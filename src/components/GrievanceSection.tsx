import { useState } from "react";
import type { FormEvent } from "react";
import { Mail, Phone, UserRound } from "lucide-react";
import { useSiteSettings } from "../context/SiteSettingsContext";

/**
 * EDIT THESE: the Grievance Officer shown on the website.
 */
const OFFICER = {
  name: "Your Name",
  designation: "Director",
  email: "oceanled2812@gmail.com",
  phone: "+91 90112 40214",
};

const TYPES = [
  { key: "data", label: "My personal data / privacy (DPDP)" },
  { key: "order", label: "An order, product or service" },
] as const;

type TypeKey = (typeof TYPES)[number]["key"];

/** e.g. GR-20261030-K7QX2 */
function makeTicket(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `GR-${ymd}-${rand}`;
}

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-ocean-cyan/50 focus:ring-2 focus:ring-ocean-cyan/20";

export default function GrievanceSection() {
  const { addInquiry } = useSiteSettings();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    type: "data" as TypeKey,
    details: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.name.trim() || form.details.trim().length < 10) {
      setError("Please enter your name and describe your complaint.");
      return;
    }
    if (
      form.phone.replace(/\D/g, "").length < 10 ||
      !/^\S+@\S+\.\S+$/.test(form.email)
    ) {
      setError("Please enter a valid phone number and email so we can reply.");
      return;
    }
    setError("");
    setSubmitting(true);
    const id = makeTicket();
    const typeLabel = TYPES.find((t) => t.key === form.type)!.label;
    try {
      await addInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: [
          `GRIEVANCE – Ticket ${id}`,
          `About: ${typeLabel}`,
          `Reply due: ${
            form.type === "data"
              ? "acknowledge in 48 hours, resolve within 30 days (DPDP outer limit 90 days)"
              : "acknowledge in 48 hours, resolve within 1 month"
          }`,
          "",
          form.details.trim(),
        ].join("\n"),
        source: "grievance",
        // Using the details to handle the complaint is the purpose of this form.
        consent: { service: true, marketing: false, whatsapp: false },
      });
      setTicket(id);
      setForm({ name: "", phone: "", email: "", type: "data", details: "" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't submit your complaint. Please email us instead.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-4" aria-labelledby="grievance">
      <h2
        id="grievance"
        className="scroll-mt-28 text-sm font-semibold uppercase tracking-wider text-ocean-cyan"
      >
        Grievance Officer and complaints
      </h2>

      <ul className="space-y-2 text-white/80">
        <li className="flex items-start gap-3">
          <UserRound size={16} className="mt-0.5 shrink-0 text-ocean-cyan" />
          <span>
            {OFFICER.name}, {OFFICER.designation}
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Mail size={16} className="mt-0.5 shrink-0 text-ocean-cyan" />
          <a
            href={`mailto:${OFFICER.email}?subject=Grievance`}
            className="hover:text-ocean-cyan"
          >
            {OFFICER.email}
          </a>
        </li>
        <li className="flex items-start gap-3">
          <Phone size={16} className="mt-0.5 shrink-0 text-ocean-cyan" />
          <a
            href={`tel:${OFFICER.phone.replace(/\s/g, "")}`}
            className="hover:text-ocean-cyan"
          >
            {OFFICER.phone}
          </a>
        </li>
      </ul>

      <p>How quickly we respond:</p>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>
          Every complaint gets a ticket number and is{" "}
          <strong className="font-semibold text-white">
            acknowledged within 48 hours
          </strong>
          .
        </li>
        <li>
          Complaints about your personal data are resolved as quickly as we can,
          and in any case{" "}
          <strong className="font-semibold text-white">within 90 days</strong>{" "}
          (we aim for 30).
        </li>
        <li>
          Complaints about an order, product or service are resolved{" "}
          <strong className="font-semibold text-white">within 1 month</strong>.
        </li>
      </ul>

      {ticket ? (
        <div
          role="status"
          className="rounded-xl border border-ocean-cyan/30 bg-ocean-cyan/10 p-4 text-sm text-white"
        >
          Your complaint has been received. Your ticket number is{" "}
          <strong className="select-all font-mono text-ocean-cyan">
            {ticket}
          </strong>
          . Please keep it for reference. We will acknowledge it within 48
          hours.
          <button
            type="button"
            onClick={() => setTicket("")}
            className="mt-3 block text-xs text-white/60 underline"
          >
            Submit another complaint
          </button>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          noValidate
          className="space-y-3 rounded-2xl border border-white/10 bg-white/3 p-4 sm:p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              aria-label="Your name"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={field}
            />
            <input
              aria-label="Phone number"
              type="tel"
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={field}
            />
          </div>
          <input
            aria-label="Email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={field}
          />
          <select
            aria-label="What is your complaint about?"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as TypeKey })
            }
            className={field}
          >
            {TYPES.map((t) => (
              <option key={t.key} value={t.key} className="bg-black">
                {t.label}
              </option>
            ))}
          </select>
          <textarea
            aria-label="Describe your complaint"
            rows={4}
            placeholder="Describe your complaint"
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            className={`${field} resize-none`}
          />
          <p className="text-xs text-white/50">
            We use these details only to look into and reply to your complaint.
          </p>
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-ocean-cyan px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit complaint"}
          </button>
        </form>
      )}
    </section>
  );
}
