import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { MapPin, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import CountUp from "./CountUp";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { navigate, pageHref } from "../router";

const ALL = "All";

export default function Projects() {
  const { settings } = useSiteSettings();
  const projects = settings.projects;
  const { since, projects: projectCount } = settings.about;

  const [active, setActive] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(projects.map((p) => p.category)))],
    [projects],
  );

  const visible =
    active === ALL ? projects : projects.filter((p) => p.category === active);

  const goContact = (e: MouseEvent) => {
    e.preventDefault();
    navigate("contact");
  };

  const STATS = [
    { label: "Since", value: since },
    { label: "Projects Delivered", value: projectCount },
  ];

  return (
    <section
      id="projects"
      className="relative overflow-hidden bg-ocean-dark py-20 md:py-28"
    >
      {/* soft cyan glow, same style as the other sections */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(0,229,255,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-ocean-cyan/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ───────── HEADER ROW ───────── */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-14">
          {/* Text */}
          <div>
            <Reveal delay={100}>
              <h2 className="mt-5 text-3xl font-extrabold uppercase leading-[1.1] tracking-tighter text-white sm:text-5xl lg:text-6xl">
                Trusted
                <span className="mt-2 block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
                  Across Every Region.
                </span>
              </h2>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-lg">
                Explore a selection of LED display installations, from corporate
                lobbies to large outdoor screens, delivered and maintained by
                our team.
              </p>
            </Reveal>

            <Reveal delay={300}>
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

          {/* Stats card */}
          <Reveal direction="right" delay={100}>
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:p-8">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {STATS.map((s, i) => (
                  <Reveal key={s.label} delay={i * 120}>
                    <div className="h-full rounded-xl border border-white/10 bg-white/3 p-5 text-center transition hover:-translate-y-0.5 hover:border-ocean-cyan/40 hover:bg-ocean-cyan/4">
                      <p className="text-3xl font-extrabold tracking-tight text-ocean-cyan sm:text-4xl">
                        <CountUp value={s.value} />
                      </p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-white/45">
                        {s.label}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* ───────── FILTER PILLS ───────── */}
        {categories.length > 2 && (
          <Reveal delay={100}>
            <div className="mt-14 flex flex-wrap gap-2.5">
              {categories.map((cat) => {
                const on = cat === active;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActive(cat)}
                    aria-pressed={on}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                      on
                        ? "border-ocean-cyan bg-ocean-cyan text-black shadow-[0_0_20px_rgba(0,229,255,0.35)]"
                        : "border-white/10 bg-white/3 text-white/60 hover:border-ocean-cyan/40 hover:text-ocean-cyan"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </Reveal>
        )}

        {/* ───────── PROJECT GRID ───────── */}
        <div
          key={active}
          className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
            categories.length > 2 ? "mt-8" : "mt-14"
          }`}
        >
          {visible.map((project, i) => (
            <Reveal
              key={project.title}
              delay={(i % 3) * 120}
              className="h-full"
            >
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] transition duration-500 hover:-translate-y-1 hover:border-ocean-cyan/40 hover:shadow-[0_8px_50px_rgba(0,229,255,0.12)]">
                {/* cyan top edge highlight */}
                <div className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

                <div className="relative aspect-16/10 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#060b14] via-ocean-dark/20 to-transparent" />

                  <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ocean-cyan backdrop-blur-md">
                    {project.category}
                  </span>

                  <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark/80 text-ocean-cyan opacity-0 backdrop-blur-md transition duration-300 group-hover:opacity-100">
                    <ArrowUpRight size={16} strokeWidth={2} />
                  </span>
                </div>

                <div className="flex flex-1 items-center gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-xs font-bold text-ocean-cyan">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold uppercase leading-snug tracking-wide text-white transition-colors duration-300 group-hover:text-ocean-cyan">
                      {project.title}
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-white/45">
                      <MapPin size={12} className="shrink-0 text-ocean-cyan" />
                      {project.location}, India
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
