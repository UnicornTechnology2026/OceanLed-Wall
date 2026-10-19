import { MessageSquare, PencilRuler, Truck, Headset } from "lucide-react";
import type { MouseEvent } from "react";
import Reveal from "./Reveal";
import { navigate, pageHref } from "../router";

const STEPS = [
  {
    icon: MessageSquare,
    title: "Consultation",
    description:
      "We understand your space, viewing distance, budget, and goals, then recommend the right display type and pixel pitch.",
  },
  {
    icon: PencilRuler,
    title: "Design",
    description:
      "Our team prepares the screen layout, structure, and content plan, with a preview so you know the result before we build.",
  },
  {
    icon: Truck,
    title: "Installation",
    description:
      "Professional delivery, mounting, wiring, and calibration by trained technicians, with minimal disruption to your site.",
  },
  {
    icon: Headset,
    title: "Maintenance",
    description:
      "Ongoing support, regular health checks, and quick repairs to keep your display running at its best.",
  },
];

export default function Process() {
  const goContact = (e: MouseEvent) => {
    e.preventDefault();
    navigate("contact");
  };

  return (
    <section
      id="process"
      className="relative overflow-hidden bg-ocean-dark py-20 md:py-28"
    >
      {/* soft cyan glow, same style as the other sections */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_25%,rgba(0,229,255,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-ocean-cyan/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:gap-14 lg:px-8">
        {/* ───────── SECTION 1 : TEXT ───────── */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-white/70 sm:text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-ocean-cyan shadow-[0_0_10px_rgba(0,229,255,0.9)]" />
              How We Work // 4 Simple Steps
            </span>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="mt-5 text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter text-white sm:text-5xl lg:text-6xl">
              From idea to illumination
              <span className="block bg-gradient-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
                in four clear steps.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-lg">
              A simple, transparent process from your first call to long-term
              support. You always know what happens next, who is doing it and
              what your display will look like before we build it.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <a
              href={pageHref("contact")}
              onClick={goContact}
              className="mt-8 inline-flex items-center gap-3 rounded-md bg-ocean-cyan px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(0,229,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(0,229,255,0.55)] sm:px-8 sm:py-4"
            >
              Start Your Project
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
            </a>
          </Reveal>
        </div>

        {/* ───────── SECTION 2 : STEPS CARD ───────── */}
        <Reveal direction="right" delay={100}>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#0a1220] to-[#060b14] p-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:p-8">
            {/* cyan top edge highlight */}
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-ocean-cyan/70 to-transparent" />

            <ol className="relative space-y-4">
              {/* vertical connecting line */}
              <div className="pointer-events-none absolute bottom-8 left-[27px] top-8 w-px bg-gradient-to-b from-ocean-cyan/50 via-ocean-cyan/20 to-transparent" />

              {STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 120}>
                  <li className="group relative flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-ocean-cyan/40 hover:bg-ocean-cyan/[0.04] sm:p-5">
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan">
                      <step.icon size={24} strokeWidth={1.75} />
                      <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ocean-cyan text-xs font-bold text-black">
                        {i + 1}
                      </span>
                    </span>
                    <span className="block">
                      <span className="block text-xs font-medium uppercase tracking-wider text-white/40">
                        Step {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-0.5 block text-lg font-bold uppercase tracking-wide text-white">
                        {step.title}
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-white/55">
                        {step.description}
                      </span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
