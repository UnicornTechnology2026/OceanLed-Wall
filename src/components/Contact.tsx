import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Send, CheckCircle, Mail, Phone, MapPin } from "lucide-react";
import Reveal from "./Reveal";
import { useSiteSettings } from "../context/SiteSettingsContext";

type FormField = "name" | "email" | "phone" | "message";
type FormErrors = Partial<Record<FormField, string>>;

const inputBase =
  "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-ocean-cyan/50 focus:bg-ocean-cyan/[0.03] focus:ring-2 focus:ring-ocean-cyan/30";

export default function Contact() {
  const { settings, addInquiry } = useSiteSettings();
  const { email, phone, address } = settings.contact;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email";
    }
    if (!form.message.trim()) next.message = "Message is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const name = e.target.name as FormField;
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      addInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });
      setSubmitting(false);
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    }, 900);
  };

  const INFO = [
    { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
    {
      icon: Phone,
      label: "Phone",
      value: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
    },
    { icon: MapPin, label: "Office", value: address, href: undefined },
  ];

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-ocean-dark py-20 md:py-28"
    >
      {/* soft cyan glow, same style as the other sections */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_25%,rgba(0,229,255,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-ocean-cyan/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:gap-14 lg:px-8">
        {/* ───────── SECTION 1 : TEXT + INFO ───────── */}
        <div className="lg:sticky lg:top-28">
          <Reveal delay={100}>
            <h1 className="mt-5 text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter text-white sm:text-5xl lg:text-6xl">
              Start your
              <span className="block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
                project today.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-lg">
              Tell us about your LED display needs. We will respond with
              tailored recommendations and a detailed quote.
            </p>
          </Reveal>

          <div className="mt-8 max-w-xl space-y-3">
            {INFO.map((item, i) => {
              const content = (
                <>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan">
                    <item.icon size={20} strokeWidth={1.75} />
                  </span>
                  <span className="block min-w-0">
                    <span className="block text-xs font-medium uppercase tracking-wider text-white/40">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block wrap-break-word text-sm font-semibold text-white/80 sm:text-base">
                      {item.value}
                    </span>
                  </span>
                </>
              );
              const cls =
                "group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-ocean-cyan/40 hover:bg-ocean-cyan/[0.04]";
              return (
                <Reveal key={item.label} delay={300 + i * 100}>
                  {item.href ? (
                    <a href={item.href} className={cls}>
                      {content}
                    </a>
                  ) : (
                    <div className={cls}>{content}</div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* ───────── SECTION 2 : FORM CARD ───────── */}
        <Reveal direction="right" delay={100}>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:p-8">
            {/* cyan top edge highlight */}
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

            {submitted ? (
              <div className="flex min-h-105 flex-col items-center justify-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan shadow-[0_0_30px_rgba(0,229,255,0.25)]">
                  <CheckCircle size={30} strokeWidth={1.75} />
                </span>
                <h2 className="mt-5 text-xl font-bold text-white">
                  Message Received
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">
                  Thank you for reaching out. Our team will get back to you
                  shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm font-semibold uppercase tracking-wide text-ocean-cyan hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                    Inquiry Form
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold text-white">
                    Tell us about your project
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50"
                    >
                      Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={`${inputBase} ${
                        errors.name ? "border-red-400/60" : "border-white/10"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50"
                    >
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className={`${inputBase} ${
                        errors.email ? "border-red-400/60" : "border-white/10"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className={`${inputBase} border-white/10`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your project or inquiry..."
                    className={`${inputBase} resize-none ${
                      errors.message ? "border-red-400/60" : "border-white/10"
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full"
                >
                  {submitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={16} strokeWidth={2.5} />
                      Send Inquiry
                      <span className="h-1.5 w-1.5 rounded-full bg-black" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
