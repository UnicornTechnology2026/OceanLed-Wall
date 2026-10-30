import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { OPEN_EVENT, applyPrefs, getPrefs, savePrefs } from "../lib/cookies";
import type { CookiePrefs } from "../lib/cookies";
import { pageHref } from "../router";

// Same class for every button on purpose: no option is more prominent.
const btn =
  "flex-1 rounded-md border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-ocean-cyan hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-cyan";

function Toggle({
  label,
  desc,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-white/10 p-3">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 accent-cyan-400"
      />
      <span className="text-sm">
        <span className="block font-semibold text-white">{label}</span>
        <span className="text-white/60">{desc}</span>
      </span>
    </label>
  );
}

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [draft, setDraft] = useState<CookiePrefs>({
    analytics: false,
    ads: false,
  });
  const [hasChoice, setHasChoice] = useState(false);

  useEffect(() => {
    const saved = getPrefs();
    applyPrefs(saved); // load only what the visitor already agreed to
    if (saved) {
      setHasChoice(true);
      setDraft({ analytics: saved.analytics, ads: saved.ads });
    } else {
      setOpen(true); // first visit
    }
    const onOpen = () => {
      const p = getPrefs();
      setDraft({ analytics: !!p?.analytics, ads: !!p?.ads });
      setHasChoice(!!p);
      setChoosing(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  const decide = (p: CookiePrefs) => {
    setOpen(false);
    setChoosing(false);
    setHasChoice(true);
    savePrefs(p);
  };

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-label="Cookie preferences"
      style={{ zIndex: 2147483000 }}
      className="fixed inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto border-t border-white/15 bg-ocean-dark p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] sm:p-5"
    >
      <div className="mx-auto max-w-4xl space-y-4">
        <p className="text-sm leading-relaxed text-white/80">
          We use essential cookies to make this site work. With your permission
          we would also use analytics and advertising cookies. Nothing optional
          is loaded unless you agree. You can change your mind any time from
          “Cookie settings” in the footer. See our{" "}
          <a
            href={pageHref("privacy-policy")}
            className="text-ocean-cyan underline"
          >
            Privacy Policy
          </a>
          .
        </p>

        {choosing && (
          <div className="space-y-2">
            <Toggle
              label="Essential"
              desc="Needed for the site to work (for example remembering this choice). Always on."
              checked
              disabled
            />
            <Toggle
              label="Analytics"
              desc="Helps us see which pages are used so we can improve the site."
              checked={draft.analytics}
              onChange={(v) => setDraft({ ...draft, analytics: v })}
            />
            <Toggle
              label="Advertising"
              desc="Lets us measure our ads and show you relevant ads on other sites."
              checked={draft.ads}
              onChange={(v) => setDraft({ ...draft, ads: v })}
            />
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className={btn}
            onClick={() => decide({ analytics: true, ads: true })}
          >
            Accept all
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => decide({ analytics: false, ads: false })}
          >
            Reject all
          </button>
          {choosing ? (
            <button type="button" className={btn} onClick={() => decide(draft)}>
              Save my choices
            </button>
          ) : (
            <button
              type="button"
              className={btn}
              onClick={() => setChoosing(true)}
            >
              Choose
            </button>
          )}
        </div>

        {hasChoice && (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setChoosing(false);
            }}
            className="text-xs text-white/50 underline"
          >
            Close without changing
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
