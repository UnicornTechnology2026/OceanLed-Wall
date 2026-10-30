import { pageHref } from "../router";
import { CONSENT_TEXT } from "../lib/consent";
import type { ConsentChoices } from "../lib/consent";

type Props = {
  value: ConsentChoices;
  onChange: (next: ConsentChoices) => void;
  error?: string;
  className?: string;
};

const box =
  "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-white/30 bg-transparent accent-[#00e5ff]";

/**
 * Consent checkboxes for every form.
 *  - All boxes start UNTICKED (value comes from EMPTY_CONSENT).
 *  - Box 1 is needed to handle the request; marketing and WhatsApp are separate and optional.
 */
/** Scrolls the missed "Required" checkbox into view and focuses it. */
export function focusRequiredConsent(form: HTMLElement | null) {
  const box = form?.querySelector<HTMLInputElement>("[data-consent-required]");
  if (!box) return;
  box.scrollIntoView({ behavior: "smooth", block: "center" });
  box.focus({ preventScroll: true });
}

export default function ConsentFields({
  value,
  onChange,
  error,
  className = "",
}: Props) {
  // the stored wording contains "Privacy Policy" – show that part as a link
  const [serviceBefore, serviceAfter] =
    CONSENT_TEXT.service.split("Privacy Policy");

  // the required box is the one that was missed
  const serviceMissing = Boolean(error) && !value.service;

  return (
    <fieldset
      className={`space-y-3 rounded-xl border p-4 text-xs leading-relaxed text-white/60 transition-colors ${
        error ? "border-red-400/70 bg-red-500/5" : "border-white/10 bg-white/2"
      } ${className}`}
    >
      <legend className="px-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
        Your consent
      </legend>

      <label
        className={`flex cursor-pointer items-start gap-3 rounded-lg ${
          serviceMissing ? "bg-red-500/10 p-2 ring-1 ring-red-400/60" : ""
        }`}
      >
        <input
          type="checkbox"
          data-consent-required
          checked={value.service}
          onChange={(e) => onChange({ ...value, service: e.target.checked })}
          aria-required="true"
          aria-invalid={serviceMissing}
          className={`${box} ${serviceMissing ? "outline-2 outline-offset-2 outline-red-400" : ""}`}
        />
        <span>
          <span
            className={`mr-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
              serviceMissing
                ? "bg-red-400/20 text-red-300"
                : "bg-ocean-cyan/15 text-ocean-cyan"
            }`}
          >
            Required
          </span>
          {serviceBefore}
          <a
            href={pageHref("privacy-policy")}
            className="font-medium text-ocean-cyan hover:underline"
          >
            Privacy Policy
          </a>
          {serviceAfter}
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={value.marketing}
          onChange={(e) => onChange({ ...value, marketing: e.target.checked })}
          className={box}
        />
        <span>
          <span className="mr-1.5 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white/60">
            Optional
          </span>
          {CONSENT_TEXT.marketing_email}
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={value.whatsapp}
          onChange={(e) => onChange({ ...value, whatsapp: e.target.checked })}
          className={box}
        />
        <span>
          <span className="mr-1.5 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white/60">
            Optional
          </span>
          {CONSENT_TEXT.whatsapp}
        </span>
      </label>

      <p className="text-white/40">
        You can withdraw any of these at any time, as easily as you gave them,
        on the{" "}
        <a
          href={pageHref("manage-consent")}
          className="font-medium text-ocean-cyan hover:underline"
        >
          Manage consent
        </a>{" "}
        page.
      </p>

      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </fieldset>
  );
}
