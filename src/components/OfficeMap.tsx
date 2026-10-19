import { MapPin, ExternalLink } from "lucide-react";
import Reveal from "./Reveal";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function OfficeMap() {
  const { settings } = useSiteSettings();
  const { address } = settings.contact;

  const query = encodeURIComponent(address);
  const embedUrl =
    "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d232.60584241849477!2d79.12758559698811!3d21.12478318410645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1s%20Ramna%20Maroti%20Nagar-Ishwar%20Nagar!5e0!3m2!1sen!2sin!4v1791976707134!5m2!1sen!2sin";
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section
      id="location"
      className="relative overflow-hidden bg-ocean-dark pb-20 md:pb-28"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] shadow-[0_0_80px_rgba(0,0,0,0.6)]">
            {/* cyan top edge highlight */}
            <div className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

            {/* Header bar */}
            <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan">
                  <MapPin size={20} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                    Visit Our Office
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white/80 sm:text-base">
                    {address}
                  </p>
                </div>
              </div>

              <a
                href={openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-md bg-ocean-cyan px-6 py-3 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(0,229,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(0,229,255,0.55)]"
              >
                Get Directions
                <ExternalLink size={14} strokeWidth={2.5} />
              </a>
            </div>

            {/* Map */}
            <div className="aspect-video w-full border-t border-white/10 sm:aspect-21/9">
              <iframe
                title="Ocean LED office location"
                src={embedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
