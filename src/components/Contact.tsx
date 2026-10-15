import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Send, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';


type FormField = 'name' | 'email' | 'phone' | 'message';
type FormErrors = Partial<Record<FormField, string>>;

export default function Contact() {
  const { settings,addInquiry } = useSiteSettings();
  const { email, phone, address } = settings.contact;
  

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email';
    }
    if (!form.message.trim()) next.message = 'Message is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setForm({ name: '', email: '', phone: '', message: '' });
    }, 900);
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-ocean-navy" />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-175 h-75 rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{ background: '#00b4ff' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-ocean-cyan/20 bg-ocean-cyan/5 px-4 py-1.5 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-ocean-cyan animate-pulse" />
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-ocean-cyan">
              Contact
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Start Your{' '}
            <span className="bg-linear-to-r from-ocean-cyan to-ocean-blue bg-clip-text text-transparent">
              Project
            </span>
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-base text-white/55 leading-relaxed">
            Tell us about your LED display needs. We will respond with tailored
            recommendations and a quote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Info cards */}
          <div className="lg:col-span-2 space-y-4">
            {[
              { icon: Mail, label: 'Email', value: email },
              { icon: Phone, label: 'Phone', value: phone },
              { icon: MapPin, label: 'Office', value: address },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-2xl border border-white/6 bg-white/2 p-5 hover:border-ocean-cyan/20 transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ocean-cyan/10 text-ocean-cyan">
                  <item.icon size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-white/40 mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-sm text-white/70">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="rounded-2xl border border-ocean-teal/30 bg-ocean-teal/10 p-12 text-center h-full flex flex-col items-center justify-center">
                <CheckCircle className="mb-4 text-ocean-teal" size={48} strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-white mb-2">Message Received</h3>
                <p className="text-white/60 mb-6">
                  Thank you for reaching out. Our team will get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-ocean-cyan hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-white/6 bg-white/2 p-6 sm:p-8 space-y-5"
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1.5">
                      Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full rounded-xl border bg-white/4 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-ocean-cyan/40 focus:border-ocean-cyan/40 transition ${
                        errors.name ? 'border-red-400/60' : 'border-white/10'
                      }`}
                      placeholder="Your name"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full rounded-xl border bg-white/4 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-ocean-cyan/40 focus:border-ocean-cyan/40 transition ${
                        errors.email ? 'border-red-400/60' : 'border-white/10'
                      }`}
                      placeholder="you@company.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white/70 mb-1.5">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-ocean-cyan/40 focus:border-ocean-cyan/40 transition"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white/70 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white/4 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-ocean-cyan/40 focus:border-ocean-cyan/40 transition resize-none ${
                      errors.message ? 'border-red-400/60' : 'border-white/10'
                    }`}
                    placeholder="Describe your project or inquiry..."
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-ocean-blue to-ocean-cyan px-8 py-3.5 text-sm font-semibold text-ocean-dark shadow-lg shadow-ocean-blue/25 hover:shadow-ocean-cyan/40 hover:scale-[1.02] disabled:opacity-60 transition-all"
                >
                  {submitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={16} />
                      Send Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}