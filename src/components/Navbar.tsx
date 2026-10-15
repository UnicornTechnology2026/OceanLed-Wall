import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import OceanLedLogo from "./OceanLedLogo";
import { usePage, pageHref } from "../router";
import type { Page } from "../router";

const NAV_LINKS: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "Solutions", page: "solutions" },
  { label: "Process", page: "process" },
  { label: "Projects", page: "projects" },
  { label: "About Us", page: "about" },
  { label: "FAQ", page: "faq" },
  { label: "Contact", page: "contact" },
];

export default function Navbar({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const page = usePage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || page !== "home"
          ? "bg-ocean-dark/90 backdrop-blur-md border-b border-white/5 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 md:h-20">
        {/* Logo + Name */}
        <a href={pageHref("home")} className="flex items-center gap-3 group">
          <OceanLedLogo size={40} className="shadow-none!" />
          <span className="text-lg font-bold tracking-wide text-white group-hover:text-ocean-cyan transition-colors">
            OCEAN LED
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={pageHref(link.page)}
                className={`text-sm font-medium transition-colors hover:text-ocean-cyan ${
                  page === link.page ? "text-ocean-cyan" : "text-white/80"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}

          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-xs text-white/30 hover:text-ocean-cyan transition-colors"
            >
              Admin
            </button>
          )}
        </ul>

        {/* CTA */}
        <div className="hidden lg:block">
          <a
            href={pageHref("contact")}
            className="inline-flex items-center rounded-full bg-linear-to-r from-ocean-blue to-ocean-cyan px-5 py-2.5 text-sm font-semibold text-ocean-dark shadow-lg shadow-ocean-blue/25 hover:shadow-ocean-cyan/40 hover:scale-[1.02] transition-all"
          >
            Get a Quote
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="lg:hidden p-2 text-white hover:text-ocean-cyan transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-ocean-dark/95 backdrop-blur-md border-t border-white/5 px-4 pb-6 pt-2">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={pageHref(link.page)}
                  onClick={() => setOpen(false)}
                  className={`block py-3 text-base font-medium transition-colors hover:text-ocean-cyan ${
                    page === link.page ? "text-ocean-cyan" : "text-white/90"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-3">
              <a
                href={pageHref("contact")}
                onClick={() => setOpen(false)}
                className="block w-full text-center rounded-full bg-linear-to-r from-ocean-blue to-ocean-cyan px-5 py-3 text-sm font-semibold text-ocean-dark"
              >
                Get a Quote
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
