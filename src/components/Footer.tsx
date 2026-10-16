import { pageHref } from "../router";
import type { Page } from "../router";
import OceanLedLogo from "./OceanLedLogo";
import { useSiteSettings } from "../context/SiteSettingsContext";

const FOOTER_LINKS: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "Process", page: "process" },
  { label: "Projects", page: "projects" },
  { label: "About", page: "about" },
  { label: "FAQ", page: "faq" },
  { label: "Contact", page: "contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { settings } = useSiteSettings();
  const { email, phone, address } = settings.contact;

  return (
    <footer className="relative border-t border-white/6 bg-ocean-dark overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,180,255,0.3), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <OceanLedLogo size={36} />
              <span className="text-lg font-bold tracking-wide text-white">
                OCEAN LED
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Premium LED display solutions for spaces that demand visual
              excellence.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50 mb-5">
              Navigate
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={pageHref(link.page)}
                    className="text-sm text-white/40 hover:text-ocean-cyan transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50 mb-5">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li>{email}</li>
              <li>{phone}</li>
              <li>{address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {year} OCEAN LED. All rights reserved.
          </p>
          <p className="text-xs text-white/25 tracking-wide">
            LED Displays · Video Walls · Digital Signage
          </p>
        </div>
      </div>
    </footer>
  );
}
