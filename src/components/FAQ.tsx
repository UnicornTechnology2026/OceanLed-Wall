import { useState } from "react";
import type { MouseEvent } from "react";
import { ChevronDown, Phone } from "lucide-react";
import Reveal from "./Reveal";
import { navigate, pageHref } from "../router";

const FAQS = [
  {
    q: "What is the price per sq ft of an LED display?",
    a: "Pricing varies based on pixel pitch, brightness, and screen dimensions. Share your project requirements through our contact form, and our team will provide a customized quote tailored to your needs.",
  },
  {
    q: "How long does delivery and installation take?",
    a: "Delivery timelines depend on your screen specifications and project requirements. Our team will provide an estimated delivery schedule along with your quotation, ensuring a smooth and timely installation process.",
  },
  {
    q: "What warranty do you provide?",
    a: "All our displays come with warranty coverage for manufacturing defects in LED modules, power supplies, and control systems. Extended warranty options are also available for added peace of mind.",
  },
  {
    q: "How much power does an LED display consume?",
    a: "Power consumption depends on screen size, brightness settings, and displayed content. Our team will provide detailed power requirements and estimated energy consumption based on your specific project.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const goContact = (e: MouseEvent) => {
    e.preventDefault();
    navigate("contact");
  };

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-ocean-dark py-20 md:py-28"
    >
      {/* soft cyan glow, same style as the other sections */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_25%,rgba(0,229,255,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-ocean-cyan/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:gap-14 lg:px-8">
        {/* ───────── SECTION 1 : TEXT ───────── */}
        <div className="lg:sticky lg:top-28">
          <Reveal delay={100}>
            <h2 className="mt-5 text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter text-white sm:text-5xl lg:text-6xl">
              Frequently asked
              <span className="block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
                questions.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-lg">
              Everything you need to know about pricing, delivery, warranty and
              support. Can't find your answer? Talk to our team and we'll get
              back to you quickly.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <a
              href={pageHref("contact")}
              onClick={goContact}
              className="mt-8 inline-flex items-center gap-3 rounded-md bg-ocean-cyan px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(0,229,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(0,229,255,0.55)] sm:px-8 sm:py-4"
            >
              <Phone size={16} strokeWidth={2.5} />
              Ask Our Team
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
            </a>
          </Reveal>
        </div>

        {/* ───────── SECTION 2 : FAQ CARD ───────── */}
        <Reveal direction="right" delay={100}>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:p-8">
            {/* cyan top edge highlight */}
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

            <ul className="relative space-y-4">
              {FAQS.map((item, i) => {
                const open = openIndex === i;
                return (
                  <Reveal key={item.q} delay={i * 100}>
                    <li
                      className={`rounded-xl border transition ${
                        open
                          ? "border-ocean-cyan/40 bg-ocean-cyan/4"
                          : "border-white/10 bg-white/3 hover:-translate-y-0.5 hover:border-ocean-cyan/40"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(open ? -1 : i)}
                        aria-expanded={open}
                        className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition ${
                            open
                              ? "border-ocean-cyan bg-ocean-cyan text-black"
                              : "border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-base font-bold uppercase leading-snug tracking-wide text-white">
                          {item.q}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`shrink-0 text-ocean-cyan transition-transform duration-300 ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          open
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="px-4 pb-5 pl-18 pr-5 text-sm leading-relaxed text-white/55 sm:pl-19">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </li>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
