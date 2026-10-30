import { lazy, Suspense, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { usePage, installLinkHandler } from "./router";
import { useSeo, NoIndex } from "./seo";
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
import OfficeMap from "./components/OfficeMap";
import ScrollProduct from "./components/ScrollProduct";
import ScrollProgress from "./components/ScrollProgress";
import PortfolioPortal from "./components/PortfolioPortal";
import PanIndiaDelivery from "./components/PanIndiaDelivery";
import ScrollProcess from "./components/ScrollProcess";
import PrivacyPolicy from "./components/PrivacyPolicy";
import ManageConsent from "./components/ManageConsent";
import CookieBanner from "./components/CookieBanner";
import NotFound from "./components/NotFound";

const LedConfigurator = lazy(() => import("./components/LedConfigurator"));

const PAGE_CONTENT: Record<Page, ReactNode> = {
  home: (
    <>
      <Hero />
      <ScrollProduct />
      <Suspense fallback={<div className="h-96 bg-ocean-dark" />}>
        <LedConfigurator />
      </Suspense>
      <PortfolioPortal />
      <PanIndiaDelivery />
    </>
  ),
  process: (
    <>
      <Process />
      <ScrollProcess />
    </>
  ),
  projects: <Projects />,
  about: (
    <>
      <About />
      <WhyOceanLed />
    </>
  ),
  contact: (
    <>
      <Contact />
      <OfficeMap />
    </>
  ),
  "privacy-policy": <PrivacyPolicy />,
  "manage-consent": <ManageConsent />,
  "not-found": <NotFound />,
};

const LOADER_KEY = "ocean_loader_seen";

function MainSite({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  // Show the intro loader only once per browser session so returning
  // visitors (and crawlers re-rendering pages) get content immediately.
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(LOADER_KEY);
    } catch {
      return true;
    }
  });
  const [showContent, setShowContent] = useState(!loading);
  const page = usePage();
  useSeo(page);

  const handleLoadComplete = useCallback(() => {
    try {
      sessionStorage.setItem(LOADER_KEY, "1");
    } catch {
      /* storage unavailable */
    }
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
        <CookieBanner />
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

  useEffect(() => installLinkHandler(), []);

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
      <>
        <NoIndex />
        <AdminLogin
          onSuccess={() => {
            setView("dashboard");
            window.location.hash = "#admin";
          }}
          onBack={goSite}
        />
      </>
    );
  }
  if (view === "dashboard") {
    return (
      <>
        <NoIndex />
        <AdminDashboard onBack={goSite} />
      </>
    );
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
