import { MapPin, ExternalLink } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function OfficeMap() {
  const { settings } = useSiteSettings();
  const { address } = settings.contact;

  const query = encodeURIComponent(address);
const embedUrl =
  'https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d232.60584241849477!2d79.12758559698811!3d21.12478318410645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1s%20Ramna%20Maroti%20Nagar-Ishwar%20Nagar!5e0!3m2!1sen!2sin!4v1791976707134!5m2!1sen!2sin';  
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section id="location" className="relative pb-24 bg-ocean-dark">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 m-28">
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/2 shadow-[0_0_60px_rgba(0,180,255,0.08)]">
          {/* Header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-white/6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ocean-cyan/10 text-ocean-cyan">
                <MapPin size={18} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-white/40">
                  Visit Our Office
                </p>
                <p className="text-sm text-white/80">{address}</p>
              </div>
            </div>

            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:border-ocean-cyan/50 hover:text-ocean-cyan transition-colors"
            >
              Get Directions
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Map */}
          <div className="aspect-video sm:aspect-21/9 w-full">
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
      </div>
    </section>
  );
}