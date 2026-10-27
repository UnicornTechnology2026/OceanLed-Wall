import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings } from "../context/SiteSettingsContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Information We Collect",
    body: [
      "When you contact us, request a quote or use our LED configurator, we may collect your name, email address, phone number, company name, project location and the details of your requirement.",
      "We may also collect basic technical data such as browser type, device information and pages visited, to help us improve the website.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "To respond to your enquiries and prepare quotations for LED displays, video walls and digital signage.",
      "To deliver, install and support our products and services.",
      "To improve our website, products and customer experience.",
      "To send service-related updates. We do not send marketing messages unless you ask for them.",
    ],
  },
  {
    title: "3. Sharing of Information",
    body: [
      "We do not sell or rent your personal information. We share it only with trusted service providers (such as hosting, logistics and installation partners) who help us serve you, or when required by law.",
    ],
  },
  {
    title: "4. Cookies",
    body: [
      "Our website may use cookies or similar technologies to keep the site working properly and to understand how visitors use it. You can disable cookies in your browser settings, though some features may not work as expected.",
    ],
  },
  {
    title: "5. Data Security",
    body: [
      "We take reasonable technical and organisational steps to protect your information from unauthorised access, loss or misuse. No online transmission is completely secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    title: "6. Data Retention",
    body: [
      "We keep your information only as long as needed for the purposes described here, or as required by law.",
    ],
  },
  {
    title: "7. Your Rights",
    body: [
      "You may ask us to access, correct or delete your personal information at any time by contacting us using the details below.",
    ],
  },
  {
    title: "8. Third-Party Links",
    body: [
      "Our website may link to third-party sites such as maps or social media. We are not responsible for their privacy practices, so please read their policies.",
    ],
  },
  {
    title: "9. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Changes take effect once posted on this page.",
    ],
  },
];

export default function PrivacyModal({ open, onClose }: Props) {
  const { settings } = useSiteSettings();
  const { email, phone, address } = settings.contact;

  // Close on Esc + lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] shadow-[0_0_80px_rgba(0,229,255,0.15)]">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
          <div>
            <h2
              id="privacy-title"
              className="text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl"
            >
              Privacy Policy
            </h2>
            <p className="mt-1 text-xs text-white/50">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close privacy policy"
            className="btn-icon shrink-0"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="select-text space-y-6 overflow-y-auto px-6 py-6 text-sm leading-relaxed text-white/70 sm:px-8">
          <p>
            OCEAN LED respects your privacy. This policy explains what
            information we collect, how we use it and how we protect it when you
            use our website and services.
          </p>

          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ocean-cyan">
                {s.title}
              </h3>
              <div className="mt-2 space-y-2">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ocean-cyan">
              10. Contact Us
            </h3>
            <p className="mt-2">
              For any questions about this policy, reach us at:
            </p>
            <ul className="mt-3 space-y-2 text-white/80">
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-ocean-cyan" />
                <a href={`mailto:${email}`} className="hover:text-ocean-cyan">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-ocean-cyan" />
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="hover:text-ocean-cyan"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-ocean-cyan" />
                <span>{address}</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-white/10 px-6 py-4 sm:px-8">
          <button type="button" onClick={onClose} className="btn btn-primary">
            Close
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
