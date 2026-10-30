import { pageHref } from "../router";

/** Short consent line with a link to the Privacy Policy – place under every form. */
export default function PrivacyNotice({
  className = "",
}: {
  className?: string;
}) {
  return (
    <p
      className={`text-center text-xs leading-relaxed text-white/45 ${className}`}
    >
      By submitting this form you agree to OCEAN LED using your details to
      respond to your request, as described in our{" "}
      <a
        href={pageHref("privacy-policy")}
        className="font-medium text-ocean-cyan hover:underline"
      >
        Privacy Policy
      </a>
      .
    </p>
  );
}
