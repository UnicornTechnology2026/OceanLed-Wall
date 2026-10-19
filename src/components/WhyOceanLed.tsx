import { Sparkles, Cpu, Shield, Settings } from "lucide-react";
import type { MouseEvent } from "react";
import Reveal from "./Reveal";
import { navigate, pageHref } from "../router";

const REASONS = [
  {
    icon: Sparkles,
    title: "Visual Quality",
    description:
      "Exceptional brightness, contrast, and color fidelity that make every pixel count.",
  },
  {
    icon: Cpu,
    title: "Innovative Technology",
    description:
      "Cutting-edge LED modules and processing systems designed for next-generation displays.",
  },
  {
    icon: Shield,
    title: "Dependable Performance",
    description:
      "Built for continuous operation with robust components and rigorous quality standards.",
  },
  {
    icon: Settings,
    title: "Tailored Solutions",
    description:
      "Custom configurations and support to match the exact needs of your project.",
  },
];

export default function WhyOceanLed() {
  const goContact = (e: MouseEvent) => {
    e.preventDefault();
    navigate("contact");
  };

  return (
    <section
      id="why-ocean-led"
      className="relative overflow-hidden bg-ocean-dark py-20 md:py-28"
    >
      {/* soft cyan glow, same style as the other sections */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-linear(ellipse_at_15%_25%,rgba(0,229,255,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-ocean-cyan/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:gap-14 lg:px-8">
        {" "}
        {/* ───────── SECTION 1 : TEXT ───────── */}
        <div>
          <Reveal></Reveal>

          <Reveal delay={100}>
            <h2 className="mt-5 text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter text-white sm:text-5xl lg:text-6xl">
              Engineered
              <span className="block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
                for excellence.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-lg">
              From the first pixel to long-term support, we build every display
              to look stunning, run reliably and fit your space exactly, so you
              get a screen you can depend on for years.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <a
              href={pageHref("contact")}
              onClick={goContact}
              className="mt-8 inline-flex items-center gap-3 rounded-md bg-ocean-cyan px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(0,229,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(0,229,255,0.55)] sm:px-8 sm:py-4"
            >
              Get a Free Quote
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
            </a>
          </Reveal>
        </div>
        {/* ───────── SECTION 2 : REASONS CARD ───────── */}
        <Reveal direction="right" delay={100}>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:p-8">
            {/* cyan top edge highlight */}
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

            <ol className="relative space-y-4">
              {/* vertical connecting line */}
              <div className="pointer-events-none absolute bottom-8 left-6.75 top-8 w-px bg-linear-to-b from-ocean-cyan/50 via-ocean-cyan/20 to-transparent" />

              {REASONS.map((item, i) => (
                <Reveal key={item.title} delay={i * 120}>
                  <li className="group relative flex items-start gap-4 rounded-xl border border-white/10 bg-white/3 p-4 transition hover:-translate-y-0.5 hover:border-ocean-cyan/40 hover:bg-ocean-cyan/4 sm:p-5">
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan">
                      <item.icon size={24} strokeWidth={1.75} />
                      <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ocean-cyan text-xs font-bold text-black">
                        {i + 1}
                      </span>
                    </span>
                    <span className="block">
                      <span className="block text-xs font-medium uppercase tracking-wider text-white/40">
                        Reason {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-0.5 block text-lg font-bold uppercase tracking-wide text-white">
                        {item.title}
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-white/55">
                        {item.description}
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
