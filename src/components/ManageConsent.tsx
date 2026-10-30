import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle, ShieldCheck } from "lucide-react";
import { recordConsent, WITHDRAW_TEXT } from "../lib/consent";
import type { ConsentPurpose } from "../lib/consent";
import { pageHref } from "../router";
import { useSiteSettings } from "../context/SiteSettingsContext";

const OPTIONS: { purpose: ConsentPurpose; label: string; help: string }[] = [
  {
    purpose: "marketing_email",
    label: "Stop marketing emails",
    help: "No more offers, news or product updates by email.",
  },
  {
    purpose: "whatsapp",
    label: "Stop WhatsApp updates",
    help: "No more updates or offers on WhatsApp.",
  },
  {
    purpose: "service",
    label: "Withdraw all consent",
    help: "We stop using your details for any purpose. To also delete them, email us (see below).",
  },
];

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-ocean-cyan/50 focus:ring-2 focus:ring-ocean-cyan/30";

/**
 * Public page where anyone can withdraw consent in one step.
 * Unsubscribe links in emails can point to /manage-consent?email=name@example.com
 */
export default function ManageConsent() {
  const { settings } = useSiteSettings();
  const adminEmail = settings.contact.email;

  const [email, setEmail] = useState(
    () => new URLSearchParams(window.location.search).get("email") ?? "",
  );
  const [phone, setPhone] = useState("");
  const [chosen, setChosen] = useState<Record<ConsentPurpose, boolean>>({
    service: false,
    marketing_email: false,
    whatsapp: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const picked = OPTIONS.filter((o) => chosen[o.purpose]);
    if (!email.trim() && phone.replace(/\D/g, "").length < 10) {
      setError("Enter the email address or phone number you used with us.");
      return;
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (picked.length === 0) {
      setError("Tick what you want to withdraw.");
      return;
    }
    setBusy(true);
    try {
      // "Withdraw all" also withdraws marketing + WhatsApp
      const purposes = new Set<ConsentPurpose>(picked.map((o) => o.purpose));
      if (purposes.has("service")) {
        purposes.add("marketing_email");
        purposes.add("whatsapp");
      }
      await recordConsent(
        { email, phone },
        [...purposes].map((purpose) => ({
          purpose,
          action: "withdrawn" as const,
          text: WITHDRAW_TEXT,
        })),
        "manage_consent_page",
      );
      setDone(true);
    } catch {
      setError(
        `We couldn't save your request. Please try again, or email ${adminEmail}.`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-ocean-dark px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(0,229,255,0.08),transparent_55%)]" />
      <div className="relative mx-auto max-w-2xl">
        <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs font-medium text-white/70 sm:text-sm">
          <ShieldCheck size={14} className="text-ocean-cyan" />
          Your data, your control
        </span>
        <h1 className="mt-4 text-3xl font-extrabold uppercase tracking-tighter text-white sm:text-5xl">
          Manage consent
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Withdraw your consent in one step. It is as easy as it was to give.
          See our{" "}
          <a
            href={pageHref("privacy-policy")}
            className="text-ocean-cyan hover:underline"
          >
            Privacy Policy
          </a>{" "}
          for details.
        </p>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-5 sm:p-8">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

          {done ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan">
                <CheckCircle size={26} />
              </span>
              <h2 className="mt-4 text-lg font-bold text-white">
                Your choice has been saved
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
                We will stop using your details for what you selected. To have
                your data deleted as well, email us at{" "}
                <a
                  href={`mailto:${adminEmail}?subject=Delete my data`}
                  className="text-ocean-cyan hover:underline"
                >
                  {adminEmail}
                </a>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5">
              <p className="text-sm text-white/60">
                Tell us who you are. Use the email address or phone number you
                gave us.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  aria-label="Email address"
                  className={inputCls}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  aria-label="Phone number"
                  className={inputCls}
                />
              </div>

              <fieldset className="space-y-3">
                <legend className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
                  What do you want to withdraw?
                </legend>
                {OPTIONS.map((o) => (
                  <label
                    key={o.purpose}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/3 p-4 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={chosen[o.purpose]}
                      onChange={(e) =>
                        setChosen({ ...chosen, [o.purpose]: e.target.checked })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-ocean-cyan"
                    />
                    <span>
                      <span className="block font-semibold text-white">
                        {o.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-white/50">
                        {o.help}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>

              {error && (
                <p role="alert" className="text-xs text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary w-full"
              >
                {busy ? "Saving…" : "Withdraw consent"}
                <span className="h-1.5 w-1.5 rounded-full bg-black" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
