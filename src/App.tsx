import { lazy, Suspense, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { usePage } from "./router";
import type { Page } from "./router";
import {
  SiteSettingsProvider,
  useSiteSettings,
} from "./context/SiteSettingsContext";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhyOceanLed from "./components/WhyOceanLed";
import Projects from "./components/Projects";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import Process from "./components/Process";
import FAQ from "./components/FAQ";
import OfficeMap from "./components/OfficeMap";
import ScrollProduct from "./components/ScrollProduct";
import ScrollProgress from "./components/ScrollProgress";
import SolutionFinder from "./components/SolutionFinder";
import PortfolioPortal from "./components/PortfolioPortal";
import PanIndiaDelivery from "./components/PanIndiaDelivery";

const LedConfigurator = lazy(() => import("./components/LedConfigurator"));

const PAGE_CONTENT: Record<Page, ReactNode> = {
  home: (
    <>
      <Hero />
      <ScrollProduct />
      <SolutionFinder />
      <PortfolioPortal />
      <Suspense fallback={<div className="h-96 bg-ocean-dark" />}>
        <LedConfigurator />
      </Suspense>
      <PanIndiaDelivery />
    </>
  ),
  process: <Process />,
  projects: <Projects />,
  about: (
    <>
      <About />
      <WhyOceanLed />
    </>
  ),
  faq: <FAQ />,
  contact: (
    <>
      <Contact />
      <OfficeMap />
    </>
  ),
};

function MainSite({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const page = usePage();

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
    requestAnimationFrame(() => setShowContent(true));
  }, []);

  return (
    <>
      {loading && <Loader onComplete={handleLoadComplete} />}
      <div
        className={`min-h-screen transition-opacity duration-700 ${showContent ? "opacity-100" : "opacity-0"}`}
      >
        <ScrollProgress />
        <Navbar onOpenAdmin={onOpenAdmin} />
        <main
          key={page}
          className={page === "home" ? "" : "min-h-[70vh] pt-16 md:pt-20"}
        >
          {PAGE_CONTENT[page]}
        </main>
        <Footer />
      </div>
    </>
  );
}

function AppRoutes() {
  const { isAdmin } = useSiteSettings();
  const [view, setView] = useState(() => {
    if (window.location.hash === "#admin")
      return isAdmin ? "dashboard" : "login";
    return "site";
  });

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#admin")
        setView(isAdmin ? "dashboard" : "login");
      else setView("site");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && view === "login") {
      setView("dashboard");
      window.location.hash = "#admin";
    }
    if (!isAdmin && view === "dashboard") setView("login");
  }, [isAdmin, view]);

  const goAdmin = () => {
    window.location.hash = "#admin";
    setView(isAdmin ? "dashboard" : "login");
  };
  const goSite = () => {
    window.location.hash = "";
    setView("site");
  };

  if (view === "login") {
    return (
      <AdminLogin
        onSuccess={() => {
          setView("dashboard");
          window.location.hash = "#admin";
        }}
        onBack={goSite}
      />
    );
  }
  if (view === "dashboard") {
    return <AdminDashboard onBack={goSite} />;
  }
  return <MainSite onOpenAdmin={goAdmin} />;
}

export default function App() {
  return (
    <SiteSettingsProvider>
      <AppRoutes />
    </SiteSettingsProvider>
  );
}
