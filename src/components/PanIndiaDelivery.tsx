import Reveal from "./Reveal";
import { navigate, pageHref } from "../router";
import { useSiteSettings } from "../context/SiteSettingsContext";
import type { MouseEvent } from "react";
import TruckImg from "../assets/oceanTruck.png";

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Nagpur",
];

export default function PanIndiaDelivery() {
  const { settings } = useSiteSettings();
  const { projects, cities } = settings.about;

  const goContact = (e: MouseEvent) => {
    e.preventDefault();
    navigate("contact");
  };

  const stats = [
    { value: projects, label: "Projects Delivered" },
    { value: cities, label: "Cities Covered" },
    { value: "7 Days", label: "Avg. Dispatch Time" },
  ];

  return (
    <section
      id="pan-india"
      className="relative isolate overflow-hidden bg-ocean-dark"
    >
      <style>{`
        @keyframes piPush { from { transform: scale(1.04) } to { transform: scale(1.14) } }
        @keyframes piRoad { to { background-position: 80px 0 } }
        .pi-bg { animation: piPush 18s ease-in-out infinite alternate; transform-origin: 80% 60%; }
        .pi-road {
          background-image: repeating-linear-gradient(90deg, rgba(0,229,255,.7) 0 28px, transparent 28px 56px);
          background-size: 80px 100%;
          animation: piRoad 1.2s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) { .pi-bg, .pi-road { animation: none } }
      `}</style>

      {/* Background photo (truck stays on the right, even on mobile) */}
      <img
        src={TruckImg}
        alt="Ocean LED Video Wall delivery truck on the highway"
        loading="lazy"
        className="pi-bg pt-12 absolute inset-0 -z-20 h-full w-full object-cover object-[78%_center]"
      />

      {/* Readability overlays */}
      <div className="absolute inset-0 -z-10 bg-ocean-dark/65 md:bg-transparent" />
      <div className="absolute inset-0 -z-10 hidden md:block bg-linear-to-r from-ocean-dark via-ocean-dark/75 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-ocean-dark to-transparent" />
      <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-linear-to-b from-ocean-dark to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
        <div className="max-w-xl">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-ocean-cyan/20 bg-ocean-cyan/5 px-4 py-1.5 mb-5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-ocean-cyan animate-pulse" />
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-ocean-cyan">
                Delivery Network
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
              We Deliver{" "}
              <span className="bg-linear-to-r from-ocean-cyan to-ocean-blue bg-clip-text text-transparent">
                Pan India
              </span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed">
              From Kashmir to Kanyakumari, our trucks carry LED video walls,
              cabinets and control systems right to your venue, safely packed,
              tracked and delivered on schedule.
            </p>
          </Reveal>

          {/* Stats */}
          <Reveal delay={300}>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="border-l border-ocean-cyan/30 pl-4"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {s.value}
                  </p>
                  <p className="mt-1 text-[11px] sm:text-xs text-white/55 leading-snug">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* City chips */}
          <Reveal delay={400}>
            <div className="mt-8 flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/10 bg-black/30 backdrop-blur-md px-3 py-1 text-xs text-white/75"
                >
                  {c}
                </span>
              ))}
              <span className="rounded-full border border-ocean-cyan/30 bg-ocean-cyan/10 px-3 py-1 text-xs font-semibold text-ocean-cyan">
                + many more
              </span>
            </div>
          </Reveal>

          <Reveal delay={500}>
            <a
              href={pageHref("contact")}
              onClick={goContact}
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-ocean-cyan to-ocean-blue px-7 py-3 text-sm font-semibold text-ocean-dark transition-all duration-300 hover:shadow-[0_0_35px_rgba(0,229,255,0.45)] hover:-translate-y-0.5"
            >
              Get a Delivery Quote <span aria-hidden>→</span>
            </a>
          </Reveal>
        </div>
      </div>

      {/* Animated "road" line */}
      <div className="pi-road absolute inset-x-0 bottom-0 h-0.5" />
    </section>
  );
}
