import { useState, type MouseEvent } from "react";
import { ArrowUp, Mail, Phone, MapPin, ChevronRight } from "lucide-react";
import { navigate, pageHref } from "../router";
import type { Page } from "../router";
import Reveal from "./Reveal";
import { useSiteSettings } from "../context/SiteSettingsContext";
import oceanLogo from "../assets/logo.png";
import PrivacyModal from "./PrivacyModal";

const FOOTER_LINKS: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "Process", page: "process" },
  { label: "Projects", page: "projects" },
  { label: "About Us", page: "about" },
  { label: "Contact", page: "contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { settings } = useSiteSettings();
  const { email, phone, address } = settings.contact;
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const goContact = (e: MouseEvent) => {
    e.preventDefault();
    navigate("contact");
  };

  const INFO = [
    { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
    {
      icon: Phone,
      label: "Phone",
      value: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
    },
    { icon: MapPin, label: "Office", value: address, href: undefined },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ocean-dark">
      {/* soft cyan glow, same style as the other sections */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(0,229,255,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-ocean-cyan/10 blur-[140px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-2xl bg-linear-to-r from-transparent via-ocean-cyan/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        {/* ───────── CTA BANNER ───────── */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:p-10">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs font-medium text-white/70 sm:text-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-ocean-cyan shadow-[0_0_10px_rgba(0,229,255,0.9)]" />
                  Let’s talk — free quote
                </span>
                <h2 className="mt-4 text-2xl font-extrabold uppercase leading-[0.95] tracking-tighter text-white sm:text-4xl">
                  Ready to light up
                  <span className="mt-2 block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
                    your space?
                  </span>
                </h2>
              </div>

              <a
                href={pageHref("contact")}
                onClick={goContact}
                className="btn btn-primary shrink-0"
              >
                Get a Free Quote
                <span className="h-1.5 w-1.5 rounded-full bg-black" />
              </a>
            </div>
          </div>
        </Reveal>

        {/* ───────── LINK COLUMNS ───────── */}
        <div className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1.2fr] lg:gap-14">
          {/* Brand */}
          <Reveal>
            <div>
              <a
                href={pageHref("home")}
                className="group inline-flex items-center gap-0"
              >
                <img
                  src={oceanLogo}
                  alt=""
                  width={112}
                  height={112}
                  loading="lazy"
                  className="h-28 w-28"
                />
                <span className="-ml-5 text-xl font-extrabold uppercase tracking-wide text-white transition-colors group-hover:text-ocean-cyan">
                  OCEAN LED
                </span>
              </a>
              <p className="-mt-6 max-w-sm text-sm leading-relaxed text-white/65">
                Premium LED display solutions for spaces that demand visual
                excellence. Video walls, digital signage and customized display
                systems, delivered across India.
              </p>
            </div>
          </Reveal>

          {/* Navigation */}
          <Reveal delay={100}>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ocean-cyan">
                Navigate
              </h3>
              <ul className="mt-5 space-y-3">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={pageHref(link.page)}
                      className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/60 transition-colors hover:text-ocean-cyan"
                    >
                      <ChevronRight
                        size={14}
                        className="-ml-1 text-ocean-cyan/0 transition-all group-hover:ml-0 group-hover:text-ocean-cyan"
                      />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Contact */}
          <Reveal delay={200} className="md:col-span-2 lg:col-span-1">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ocean-cyan">
                Contact
              </h3>
              <div className="mt-5 space-y-3">
                {INFO.map((item) => {
                  const content = (
                    <>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan">
                        <item.icon size={18} strokeWidth={1.75} />
                      </span>
                      <span className="block min-w-0">
                        <span className="block text-xs font-medium uppercase tracking-wider text-white/50">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block wrap-break-word text-sm font-semibold text-white/75">
                          {item.value}
                        </span>
                      </span>
                    </>
                  );
                  const cls =
                    "flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:-translate-y-0.5 hover:border-ocean-cyan/40 hover:bg-ocean-cyan/[0.04]";
                  return item.href ? (
                    <a key={item.label} href={item.href} className={cls}>
                      {content}
                    </a>
                  ) : (
                    <div key={item.label} className={cls}>
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>

        {/* ───────── BOTTOM BAR ───────── */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <p className="text-xs text-white/40">
              © {year} OCEAN LED. All rights reserved.
            </p>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="text-xs text-white/50 transition-colors hover:text-ocean-cyan"
            >
              Privacy Policy
            </button>
          </div>
          <p className="text-xs text-white/50">
            LED Displays · Video Walls · Digital Signage
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="btn-icon"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </footer>
  );
}
