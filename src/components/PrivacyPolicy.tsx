import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { pageHref } from "../router";

/** Update this date every time the policy text below changes. */
export const PRIVACY_LAST_UPDATED = "30 October 2026";

type DataRow = {
  data: string;
  collected: string;
  purpose: string;
  retention: string;
  sharedWith: string;
};

const DATA_ROWS: DataRow[] = [
  {
    data: "Name",
    collected: "Inquiry form, quote request, orders",
    purpose: "To address you, prepare quotations and deliver your order.",
    retention:
      "2 years after your last inquiry; 6 years if you place an order (accounting records).",
    sharedWith: "CRM tool, courier / installation partners (only for orders).",
  },
  {
    data: "Phone number",
    collected: "Inquiry form, quote request, orders",
    purpose: "Support, quotation follow-up, delivery coordination.",
    retention:
      "2 years after your last inquiry; 6 years if you place an order.",
    sharedWith: "CRM tool, courier / installation partners (only for orders).",
  },
  {
    data: "Email address",
    collected: "Inquiry form, quote request",
    purpose:
      "Replying to inquiries, sending quotations, order and support updates. Marketing emails only if you opt in.",
    retention:
      "2 years after your last inquiry; until you withdraw consent for marketing.",
    sharedWith: "CRM tool, email service provider.",
  },
  {
    data: "Address (delivery / installation site)",
    collected: "Shared with us when you confirm an order",
    purpose: "Order delivery and installation.",
    retention: "6 years from the order date (accounting and warranty records).",
    sharedWith: "Courier / logistics and installation partners.",
  },
  {
    data: "Project details (message, LED size, shape, pixel pitch)",
    collected: "Inquiry form and LED configurator",
    purpose: "Preparing an accurate quotation and design for you.",
    retention: "2 years after your last inquiry.",
    sharedWith: "CRM tool. Not shared with anyone else.",
  },
  {
    data: "IP address and device / browser data",
    collected: "Automatically when you use the website",
    purpose:
      "Security, fraud and spam prevention, and analytics to improve the site.",
    retention:
      "Up to 90 days in server logs; analytics data in aggregated form for up to 14 months.",
    sharedWith: "Hosting and database provider, analytics provider.",
  },
  {
    data: "Cookies and similar technologies",
    collected: "Automatically when you use the website",
    purpose:
      "Essential cookies keep the site working. Analytics and advertising cookies are used only with your consent.",
    retention:
      "Session cookies until you close the browser; others up to 12 months.",
    sharedWith:
      "Analytics provider and ad platforms (only if you accept those cookies).",
  },
  {
    data: "Payment information",
    collected:
      "Only when you pay online. We never see or store your full card, UPI PIN or net-banking details.",
    purpose: "Processing payment for your order and issuing invoices.",
    retention:
      "Transaction records (not card details) for 6 years, as required by tax law.",
    sharedWith: "Payment gateway / bank.",
  },
];

const SHARING: { who: string; what: string }[] = [
  {
    who: "Payment gateway / bank",
    what: "Order amount and payer details needed to complete a payment.",
  },
  {
    who: "Courier and logistics partners",
    what: "Name, phone number and delivery address, to deliver and install your order.",
  },
  {
    who: "CRM and email tools",
    what: "Name, phone, email and inquiry details, to track and answer your requests.",
  },
  {
    who: "Advertising platforms",
    what: "Cookie identifiers and browsing activity, only if you accept advertising cookies.",
  },
  {
    who: "Hosting / database provider",
    what: "All website data, stored securely on our behalf.",
  },
  {
    who: "Authorities",
    what: "Only where the law requires us to disclose information.",
  },
];

const SECURITY: string[] = [
  "All traffic between your browser and our website is encrypted with HTTPS/TLS.",
  "Data is stored in a managed database with access controls; only authorised staff can view inquiries, and the admin area needs a login.",
  "Passwords are never stored in plain text and admin access is limited to those who need it.",
  "We do not store card or banking details; payments are handled by the payment gateway.",
  "We collect only the data needed for the purposes above and delete or anonymise it when the retention period ends.",
  "Service providers are bound to protect your data and use it only on our instructions.",
  "If a personal data breach affects you, we will inform you and the Data Protection Board of India as the law requires.",
];

function H2({ id, children }: { id: string; children: string }) {
  return (
    <h2
      id={id}
      className="scroll-mt-28 text-sm font-semibold uppercase tracking-wider text-ocean-cyan"
    >
      {children}
    </h2>
  );
}

export default function PrivacyPolicy() {
  const { settings } = useSiteSettings();
  const { email, phone, address } = settings.contact;

  return (
    <section className="relative overflow-hidden bg-ocean-dark px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(0,229,255,0.08),transparent_55%)]" />

      <div className="relative mx-auto max-w-4xl">
        <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs font-medium text-white/70 sm:text-sm">
          <ShieldCheck size={14} className="text-ocean-cyan" />
          Your data, your control
        </span>
        <h1 className="mt-4 text-3xl font-extrabold uppercase tracking-tighter text-white sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-white/50">
          Last updated:{" "}
          <time dateTime="2026-10-30" className="font-semibold text-white/70">
            {PRIVACY_LAST_UPDATED}
          </time>
        </p>

        <div className="relative mt-8 select-text space-y-10 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-5 text-sm leading-relaxed text-white/70 shadow-[0_0_80px_rgba(0,0,0,0.5)] sm:p-8">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

          <p>
            OCEAN LED (“we”, “us”) respects your privacy. This policy explains
            what personal data we collect through this website, why we collect
            it, how long we keep it, who we share it with, and how you can
            exercise your rights under the Digital Personal Data Protection Act,
            2023 (“DPDP Act”). We process your data only with your consent or
            for other purposes the law permits.
          </p>

          <section className="space-y-4">
            <H2 id="data-we-collect">
              1. What we collect, why, for how long and who gets it
            </H2>
            <div className="space-y-3">
              {DATA_ROWS.map((r) => (
                <div
                  key={r.data}
                  className="rounded-xl border border-white/10 bg-white/3 p-4"
                >
                  <h3 className="text-base font-bold text-white">{r.data}</h3>
                  <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    {[
                      ["Where we collect it", r.collected],
                      ["Purpose", r.purpose],
                      ["How long we keep it", r.retention],
                      ["Shared with", r.sharedWith],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                          {k}
                        </dt>
                        <dd className="mt-0.5 text-white/75">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
            <p className="text-white/55">
              We do not sell or rent your personal data. Marketing messages are
              sent only if you have opted in, and every message has an easy way
              to opt out.
            </p>
          </section>

          <section className="space-y-3">
            <H2 id="sharing">2. Who we share your data with</H2>
            <ul className="space-y-2">
              {SHARING.map((s) => (
                <li
                  key={s.who}
                  className="flex flex-col gap-0.5 rounded-xl border border-white/10 bg-white/3 px-4 py-3 sm:flex-row sm:gap-4"
                >
                  <span className="shrink-0 font-semibold text-white sm:w-56">
                    {s.who}
                  </span>
                  <span>{s.what}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <H2 id="withdraw-consent">3. Withdrawing your consent</H2>
            <p>
              You can withdraw consent at any time, as easily as you gave it.
              The quickest way is the{" "}
              <a
                href={pageHref("manage-consent")}
                className="text-ocean-cyan hover:underline"
              >
                Manage consent
              </a>{" "}
              page: enter your email or phone, tick what to stop, and you are
              done. Every marketing email we send also has an unsubscribe link.
              You can also email us at{" "}
              <a
                href={`mailto:${email}?subject=Withdraw consent`}
                className="text-ocean-cyan hover:underline"
              >
                {email}
              </a>{" "}
              or call {phone}. We will stop processing your data for that
              purpose within a reasonable time (normally within 7 working days)
              and delete it unless we must keep it by law. Withdrawal does not
              affect processing done before you withdrew.
            </p>
          </section>

          <section className="space-y-3">
            <H2 id="consent-records">
              4. Consent is always optional and recorded
            </H2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>No box on any of our forms is ticked in advance.</li>
              <li>
                Agreeing to us handling your request is separate from agreeing
                to marketing emails and from agreeing to WhatsApp updates. You
                can say yes to the first and no to the others and still get your
                quote.
              </li>
              <li>
                We keep a record of who agreed to what, the wording they saw,
                the policy version and the date and time. When you withdraw, we
                add a new record; we do not erase the old one, so we can show
                what happened.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <H2 id="your-rights">4. Your rights</H2>
            <p>Under the DPDP Act you have the right to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Get a summary of the personal data we hold about you and how we
                use it.
              </li>
              <li>Have inaccurate or incomplete data corrected or updated.</li>
              <li>
                Have your data erased when it is no longer needed for the
                purpose it was collected for.
              </li>
              <li>
                Get your grievance resolved quickly, and to nominate another
                person to exercise these rights for you if you die or become
                unable to.
              </li>
            </ul>
            <p>
              To use any of these rights, write to our grievance contact at{" "}
              <a
                href={`mailto:${email}?subject=Privacy request`}
                className="text-ocean-cyan hover:underline"
              >
                {email}
              </a>
              . We may ask you to verify your identity first, and we aim to
              reply within 30 days.
            </p>
          </section>

          <section className="space-y-3">
            <H2 id="complaints">5. Complaints and the Data Protection Board</H2>
            <p>
              Please contact us first so we can fix the problem. If you are not
              satisfied with our response, or we do not reply within a
              reasonable time, you may make a complaint to the{" "}
              <strong className="font-semibold text-white">
                Data Protection Board of India
              </strong>
              , the body set up under the DPDP Act, 2023, in the manner it
              prescribes.
            </p>
          </section>

          <section className="space-y-3">
            <H2 id="security">6. How we keep your data secure</H2>
            <ul className="list-disc space-y-1.5 pl-5">
              {SECURITY.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="text-white/55">
              No online system is completely secure, so we cannot guarantee
              absolute security, but we work to protect your data using
              reasonable safeguards.
            </p>
          </section>

          <section className="space-y-3">
            <H2 id="children">7. Children</H2>
            <p>
              Our services are meant for businesses and adults. We do not
              knowingly collect personal data of children under 18 without
              verifiable consent from a parent or guardian.
            </p>
          </section>

          <section className="space-y-3">
            <H2 id="changes">8. Changes to this policy</H2>
            <p>
              When we change this policy we update the “last updated” date at
              the top of this page. If a change is significant, we will tell you
              and ask for fresh consent where required.
            </p>
          </section>

          <section className="space-y-3">
            <H2 id="contact">9. Contact us</H2>
            <ul className="space-y-2 text-white/80">
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
      </div>
    </section>
  );
}
