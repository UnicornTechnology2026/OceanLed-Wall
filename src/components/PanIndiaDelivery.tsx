import Reveal from "./Reveal";
import { navigate, pageHref } from "../router";
import type { MouseEvent } from "react";
import TruckImg from "../assets/oceanTruck.png";
import TruckMobileImg from "../assets/mobileview.jpeg";

export default function PanIndiaDelivery() {
  const goContact = (e: MouseEvent) => {
    e.preventDefault();
    navigate("contact");
  };

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

      {/* Background photo: portrait image on mobile, wide image from md up */}
      <picture>
        <source media="(min-width: 768px)" srcSet={TruckImg} />
        <img
          src={TruckMobileImg}
          alt="Ocean LED Video Wall delivery truck on the highway"
          loading="lazy"
          className="pi-bg md:pt-12 absolute inset-0 -z-20 w-full h-full object-cover object-center md:object-[78%_center]"
        />
      </picture>

      {/* Readability overlays */}
      <div className="absolute inset-0 -z-10 bg-ocean-dark/50 md:bg-transparent" />
      <div className="absolute inset-0 -z-10 hidden md:block bg-linear-to-r from-ocean-dark via-ocean-dark/75 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-ocean-dark to-transparent" />
      <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-linear-to-b from-ocean-dark to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
        <div className="max-w-xl">
          <Reveal delay={100}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05]">
              We Deliver{" "}
              <span className="bg-linear-to-r from-ocean-cyan to-ocean-blue bg-clip-text text-transparent">
                Pan India
              </span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-5 text-base sm:text-lg text-white leading-relaxed">
              From every corner of India, we deliver LED video walls, display
              cabinets and control systems to your venue with secure packaging,
              reliable tracking and on-time delivery.
            </p>
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
