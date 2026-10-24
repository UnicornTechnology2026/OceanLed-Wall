import { Sparkles, Cpu, Shield, Settings } from "lucide-react";
import type { MouseEvent } from "react";
import Reveal from "./Reveal";
import { navigate, pageHref } from "../router";
import aboutImage from "../assets/ocean_led_logo.png";

const HIGHLIGHTS = [
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

export default function About() {
  const goContact = (e: MouseEvent) => {
    e.preventDefault();
    navigate("contact");
  };

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-ocean-dark py-20 md:py-28"
    >
      {/* soft cyan glow, same style as the other sections */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_25%,rgba(0,229,255,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-ocean-cyan/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:gap-14 lg:px-8">
        {/* ───────── SECTION 1 : TEXT ───────── */}
        <div>
          <Reveal delay={100}>
            <h1 className="mt-5 text-3xl font-extrabold uppercase leading-[1.1] tracking-tighter text-white sm:text-5xl lg:text-6xl">
              Illuminating spaces
              <span className="block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
                with precision.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-lg">
              OCEAN LED specializes in advanced LED display solutions for
              commercial, entertainment, and architectural applications. We
              deliver high-performance screens that combine visual excellence
              with dependable engineering.
            </p>
          </Reveal>

          <Reveal delay={250}>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
              Our portfolio spans indoor and outdoor LED displays, video walls,
              digital signage, and fully custom installations. Every project is
              approached with attention to detail, from pixel pitch selection to
              system integration.
            </p>
          </Reveal>

          <Reveal delay={350}>
            <a
              href={pageHref("contact")}
              onClick={goContact}
              className="btn btn-primary mt-8 sm:px-8 sm:py-4"
            >
              Start Your Project
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
            </a>
          </Reveal>
        </div>

        {/* ───────── SECTION 2 : CARD ───────── */}
        <Reveal direction="right" delay={100}>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:p-8">
            {/* cyan top edge highlight */}
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

            {/* image */}
            {/* image */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white">
              <img
                src={aboutImage}
                alt="OCEAN LED Video Wall"
                className="aspect-video w-full object-contain p-4"
                loading="lazy"
              />
            </div>

            {/* why Ocean LED list */}
            <ul className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {HIGHLIGHTS.map((item, i) => (
                <Reveal key={item.title} delay={i * 120}>
                  <li className="group flex h-full items-start gap-4 rounded-xl border border-white/10 bg-white/3 p-4 transition hover:-translate-y-0.5 hover:border-ocean-cyan/40 hover:bg-ocean-cyan/4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan">
                      <item.icon size={22} strokeWidth={1.75} />
                    </span>
                    <span className="block">
                      <span className="block text-sm font-bold uppercase tracking-wide text-white">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-white/55">
                        {item.description}
                      </span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
