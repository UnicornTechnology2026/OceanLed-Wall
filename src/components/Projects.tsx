import { useCallback, useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "./Reveal";
import CountUp from "./CountUp";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { navigate, pageHref } from "../router";

export default function Projects() {
  const { settings } = useSiteSettings();
  const projects = settings.projects;
  const { since, projects: projectCount } = settings.about;

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () =>
      setOpenIndex((i) =>
        i === null ? i : (i - 1 + projects.length) % projects.length,
      ),
    [projects.length],
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % projects.length)),
    [projects.length],
  );

  /* keyboard controls + lock page scroll while the viewer is open */
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, prev, next]);

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
                <span className="block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
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

        {projects.length === 0 && (
          <p className="mt-14 text-center text-sm uppercase tracking-wider text-white/40">
            Photos coming soon.
          </p>
        )}

        {/* ───────── PHOTO GRID (images only) ───────── */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal
              key={`${project.image}-${i}`}
              delay={(i % 3) * 120}
              className="h-full"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`View photo ${i + 1} larger`}
                className="group relative block aspect-16/10 w-full cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 bg-[#0a1220] transition duration-500 hover:-translate-y-1 hover:border-ocean-cyan/40 hover:shadow-[0_8px_50px_rgba(0,229,255,0.12)] focus-visible:outline-2 focus-visible:outline-ocean-cyan"
              >
                <img
                  src={project.image}
                  alt={`OCEAN LED installation ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ───────── LARGE PHOTO VIEWER ───────── */}
      {openIndex !== null &&
        projects[openIndex] &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            onClick={close}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-10"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 transition hover:border-ocean-cyan hover:text-ocean-cyan sm:right-6 sm:top-6"
            >
              <X size={20} />
            </button>

            {projects.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 transition hover:border-ocean-cyan hover:text-ocean-cyan sm:left-6"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/80 transition hover:border-ocean-cyan hover:text-ocean-cyan sm:right-6"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            <img
              key={openIndex}
              src={projects[openIndex].image}
              alt={`OCEAN LED installation ${openIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-xl object-contain shadow-[0_0_80px_rgba(0,229,255,0.15)]"
            />

            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-medium tracking-wider text-white/60">
              {openIndex + 1} / {projects.length}
            </span>
          </div>,
          document.body,
        )}
    </section>
  );
}
