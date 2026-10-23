import { useState, useEffect } from "react";
import type { MouseEvent } from "react";
import { Menu, X, ChevronRight, Lock } from "lucide-react";
import { usePage, pageHref, navigate } from "../router";
import type { Page } from "../router";
import oceanLogo from "../assets/logo.png";

const NAV_LINKS: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "Process", page: "process" },
  { label: "Projects", page: "projects" },
  { label: "About Us", page: "about" },
  { label: "Contact", page: "contact" },
];

export default function Navbar({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const page = usePage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile menu whenever the page changes
  useEffect(() => {
    setOpen(false);
  }, [page]);

  const goContact = (e: MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    navigate("contact");
  };

  const solid = scrolled || page !== "home" || open;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "border-b border-white/10 bg-ocean-dark/90 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      {/* cyan hairline under the bar once it turns solid */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-px max-w-3xl bg-linear-to-r from-transparent via-ocean-cyan/50 to-transparent transition-opacity duration-300 ${
          solid ? "opacity-100" : "opacity-0"
        }`}
      />

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-20 lg:px-8">
        {/* Logo + name */}
        <a
          href={pageHref("home")}
          className="group flex shrink-0 items-center gap-0 outline-none focus:outline-none focus-visible:outline-none [-webkit-tap-highlight-color:transparent]"
        >
          <img
            src={oceanLogo}
            alt="OCEAN LED logo"
            width={112}
            height={112}
            className="h-28 w-28"
          />
          <span className="-ml-5 text-lg font-extrabold uppercase tracking-wide text-white transition-colors group-hover:text-ocean-cyan">
            OCEAN LED
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = page === link.page;
            return (
              <li key={link.label}>
                <a
                  href={pageHref(link.page)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium uppercase tracking-wider transition ${
                    active
                      ? "border-ocean-cyan/30 bg-ocean-cyan/6 text-ocean-cyan"
                      : "border-transparent text-white/70 hover:text-ocean-cyan"
                  }`}
                >
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-ocean-cyan shadow-[0_0_8px_rgba(0,229,255,0.9)]" />
                  )}
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA + admin */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              aria-label="Admin"
              title="Admin"
              className="btn-icon"
            >
              <Lock size={14} />
            </button>
          )}
          <a
            href={pageHref("contact")}
            onClick={goContact}
            className="btn btn-primary btn-sm"
          >
            Get a Quote
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="btn-icon lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`grid transition-all duration-300 ease-in-out lg:hidden ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto px-4 pb-5 pt-2 sm:px-6">
            <div className="rounded-2xl border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-2.5">
              {NAV_LINKS.map((link, i) => {
                const active = page === link.page;
                return (
                  <a
                    key={link.label}
                    href={pageHref(link.page)}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 transition ${
                      active
                        ? "border-ocean-cyan/35 bg-ocean-cyan/5 text-white"
                        : "border-transparent text-white/75 hover:bg-white/4"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                        active
                          ? "border-ocean-cyan bg-ocean-cyan text-black"
                          : "border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-sm font-semibold uppercase tracking-wider">
                      {link.label}
                    </span>
                    <ChevronRight size={16} className="text-ocean-cyan" />
                  </a>
                );
              })}
            </div>

            <a
              href={pageHref("contact")}
              onClick={goContact}
              className="btn btn-primary mt-3 w-full"
            >
              Get a Quote
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
            </a>

            {onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenAdmin();
                }}
                className="btn-link mx-auto mt-4"
              >
                <Lock size={12} />
                Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
