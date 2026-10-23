import { useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { Boxes, Building2, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { navigate, pageHref } from "../router";
import { useSiteSettings } from "../context/SiteSettingsContext";
import Reveal from "./Reveal";

/* ---------- geometry helpers (viewBox centre = 400,400) ---------- */
const CX = 400;
const CY = 400;
const toXY = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)] as const;
};
// Ring-shaped slice between radii r1 < r2 and angles a1 > a2 (clockwise)
const sector = (r1: number, r2: number, a1: number, a2: number) => {
  const [x1, y1] = toXY(r2, a1);
  const [x2, y2] = toXY(r2, a2);
  const [x3, y3] = toXY(r1, a2);
  const [x4, y4] = toXY(r1, a1);
  return `M${x1} ${y1} A${r2} ${r2} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${r1} ${r1} 0 0 0 ${x4} ${y4} Z`;
};

// Full circle of photo wedges; only the top half is visible (clipped),
// so rotating the group feeds new photos in and out of view.
const WEDGES = 10;
const STEP = 360 / WEDGES; // 36° each
const GAP = 1.5;
const R_IN = 205;
const R_OUT = 375;

const WORDS = ["SPHERE LED", "CUBE LED", "TREE LED", "KINETICS", "ANAMORPHIC"];
const ringText = (k: number) =>
  [...WORDS.slice(k), ...WORDS.slice(0, k)].join("\u00A0\u00A0•\u00A0\u00A0") +
  "\u00A0\u00A0•\u00A0\u00A0";

const RINGS = [
  { r: 232, size: 38, cls: "pf-cw", k: 0 },
  { r: 294, size: 44, cls: "pf-ccw", k: 2 },
  { r: 358, size: 50, cls: "pf-cw", k: 4 },
];

const HIGHLIGHTS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Building2,
    title: "Indoor & outdoor installs",
    text: "Video walls, facades, showrooms, control rooms and open-air displays.",
  },
  {
    icon: Boxes,
    title: "Creative LED shapes",
    text: "Spheres, cubes, trees, kinetic and anamorphic screens made to stand out.",
  },
  {
    icon: Wrench,
    title: "Brief to commissioning",
    text: "Design, supply, installation and after-sales service handled by one team.",
  },
];

export default function PortfolioPortal() {
  const { settings } = useSiteSettings();
  const projects = settings.projects;
  const [hover, setHover] = useState<number | null>(null);

  const go = (e: MouseEvent) => {
    e.preventDefault();
    navigate("projects"); // opens the Portfolio tab
  };
  const href = pageHref("projects");

  const wedges = Array.from({ length: WEDGES }, (_, i) => {
    const a1 = 180 - i * STEP - GAP;
    const a2 = 180 - (i + 1) * STEP + GAP;
    const mid = (a1 + a2) / 2;
    const [mx, my] = toXY(290, mid);
    const rad = (mid * Math.PI) / 180;
    const p = projects[i % projects.length];
    return {
      i,
      d: sector(R_IN, R_OUT, a1, a2),
      mx,
      my,
      tx: Math.cos(rad) * 12,
      ty: -Math.sin(rad) * 12,
      image: p?.image ?? "",
      label: p?.category ?? "Portfolio",
    };
  });

  const cubeImage = projects[1]?.image ?? projects[0]?.image ?? "";

  return (
    <section
      id="portfolio-portal"
      className="relative overflow-hidden bg-ocean-dark py-20 md:py-28"
    >
      <style>{`
        .pf-ring{transform-origin:400px 400px}
        .pf-cw{animation:pfCW 70s linear infinite}
        .pf-ccw{animation:pfCCW 95s linear infinite}
        .pf-photos{animation:pfCW 90s linear infinite}
        .pf-photos:hover{animation-play-state:paused}
        .pf-rings:hover .pf-ring{animation-play-state:paused}
        @keyframes pfCW{to{transform:rotate(360deg)}}
        @keyframes pfCCW{to{transform:rotate(-360deg)}}
        .pf-text{
          fill:rgba(0,229,255,.06);stroke:rgba(170,235,255,.8);stroke-width:1.4;
          paint-order:stroke;font-weight:800;letter-spacing:2px;
          filter:drop-shadow(0 0 6px rgba(0,229,255,.45));
          transition:fill .4s,stroke .4s;cursor:pointer;
        }
        .pf-rings:hover .pf-text{fill:rgba(0,229,255,.22);stroke:#fff}
        .pf-wedge{cursor:pointer;outline:none;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
        .pf-wedge:hover,.pf-wedge:focus-visible{transform:translate(var(--tx),var(--ty))}
        .pf-wedge .pf-shade{transition:opacity .4s}
        .pf-wedge:hover .pf-shade,.pf-wedge:focus-visible .pf-shade{opacity:0}
        .pf-wedge .pf-edge{transition:stroke .3s,stroke-width .3s}
        .pf-wedge:hover .pf-edge,.pf-wedge:focus-visible .pf-edge{stroke:#00e5ff;stroke-width:3}
        .pf-float{animation:pfFloat 5s ease-in-out infinite}
        @keyframes pfFloat{50%{transform:translateY(-8px)}}
        .pf-center{cursor:pointer;outline:none}
        .pf-center:hover .pf-title{fill:#ffffff}
        @media (prefers-reduced-motion:reduce){.pf-ring,.pf-photos,.pf-float{animation:none}}
      `}</style>

      {/* soft cyan glow, same style as the other sections */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_25%,rgba(0,229,255,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-ocean-cyan/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:gap-14 lg:px-8">
        {/* ───────── SECTION 1 : TEXT ───────── */}
        <Reveal direction="left">
          <h2 className="mt-5 text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter text-white sm:text-5xl lg:text-6xl">
            Explore our LED portfolio
            <span className="block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
              built to be seen.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-lg">
            From large facades to creative sphere, cube and tree installations,
            see how we turn ordinary spaces into high-impact LED experiences.
            Hover over the wheel to preview a project and click any slice to
            open the full portfolio.
          </p>

          <ul className="mt-8 space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ocean-cyan/25 bg-ocean-cyan/6">
                  <Icon size={20} className="text-ocean-cyan" />
                </span>
                <span>
                  <span className="block text-sm font-bold uppercase tracking-wide text-white">
                    {title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-white/55">
                    {text}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <a
            href={href}
            onClick={go}
            className="btn btn-primary mt-8 sm:px-8 sm:py-4"
          >
            View Full Portfolio
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
          </a>
        </Reveal>

        {/* ───────── SECTION 2 : PORTAL CARD ───────── */}
        <Reveal direction="right" delay={100}>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-4 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:p-6">
            {/* cyan top edge highlight */}
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

            <svg
              viewBox="0 20 800 640"
              role="group"
              aria-label="Explore our portfolio"
              className="block h-auto w-full select-none"
            >
              <defs>
                <linearGradient id="pf-side" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#0d3a7a" />
                  <stop offset="1" stopColor="#031124" />
                </linearGradient>
                <linearGradient id="pf-top-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#2a8fd6" />
                  <stop offset="1" stopColor="#0d4a8a" />
                </linearGradient>
                <radialGradient id="pf-hole" cx="50%" cy="50%" r="50%">
                  <stop offset="0" stopColor="#0a1628" />
                  <stop offset="1" stopColor="#02060c" />
                </radialGradient>
                <clipPath id="pf-bottom">
                  <rect x="0" y="400" width="800" height="400" />
                </clipPath>
                <clipPath id="pf-top">
                  <rect x="0" y="0" width="800" height="400" />
                </clipPath>
                {wedges.map((w) => (
                  <clipPath id={`pf-clip-${w.i}`} key={w.i}>
                    <path d={w.d} />
                  </clipPath>
                ))}
              </defs>

              {/* Bezel */}
              <circle
                cx={CX}
                cy={CY}
                r="392"
                fill="#02050a"
                stroke="rgba(255,255,255,.07)"
                strokeWidth="2"
              />
              <circle
                cx={CX}
                cy={CY}
                r="382"
                fill="none"
                stroke="rgba(0,229,255,.12)"
                strokeWidth="1"
              />

              {/* Rotating category rings (visible in the bottom half only) */}
              <g clipPath="url(#pf-bottom)" className="pf-rings">
                {RINGS.map((ring) => {
                  const id = `pf-path-${ring.r}`;
                  const c = 2 * Math.PI * ring.r;
                  return (
                    <a
                      key={ring.r}
                      href={href}
                      onClick={go}
                      aria-label="Open portfolio"
                    >
                      <g className={`pf-ring ${ring.cls}`}>
                        <path
                          id={id}
                          d={`M${CX - ring.r} ${CY} A${ring.r} ${ring.r} 0 1 0 ${CX + ring.r} ${CY} A${ring.r} ${ring.r} 0 1 0 ${CX - ring.r} ${CY}`}
                          fill="none"
                        />
                        <text className="pf-text" fontSize={ring.size}>
                          <textPath
                            href={`#${id}`}
                            textLength={c - 6}
                            lengthAdjust="spacing"
                          >
                            {ringText(ring.k)}
                          </textPath>
                        </text>
                      </g>
                    </a>
                  );
                })}
              </g>

              {/* Rotating image wedges (visible through the top half only) */}
              <g clipPath="url(#pf-top)">
                <g className="pf-ring pf-photos">
                  {wedges.map((w) => (
                    <a
                      key={w.i}
                      href={href}
                      onClick={go}
                      className="pf-wedge"
                      aria-label={`${w.label} – open portfolio`}
                      style={
                        {
                          "--tx": `${w.tx}px`,
                          "--ty": `${w.ty}px`,
                        } as CSSProperties
                      }
                      onMouseEnter={() => setHover(w.i)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(w.i)}
                      onBlur={() => setHover(null)}
                    >
                      <image
                        href={w.image}
                        x={w.mx - 170}
                        y={w.my - 170}
                        width="340"
                        height="340"
                        preserveAspectRatio="xMidYMid slice"
                        clipPath={`url(#pf-clip-${w.i})`}
                      />
                      <path
                        d={w.d}
                        className="pf-shade"
                        fill="rgba(5,13,24,.4)"
                      />
                      <path
                        d={w.d}
                        className="pf-edge"
                        fill="none"
                        stroke="rgba(0,229,255,.25)"
                        strokeWidth="1.5"
                      />
                    </a>
                  ))}
                </g>
              </g>

              {/* Centre hole */}
              <circle
                cx={CX}
                cy={CY}
                r="182"
                fill="url(#pf-hole)"
                stroke="rgba(255,255,255,.08)"
                strokeWidth="2"
              />

              {/* Centre: floating cube + glass title frame */}
              <a
                href={href}
                onClick={go}
                className="pf-center"
                aria-label="Open portfolio"
              >
                <g className="pf-float">
                  <path
                    d="M300 380 L360 350 L510 350 L450 380 Z"
                    fill="url(#pf-top-grad)"
                  />
                  <image
                    href={cubeImage}
                    x="300"
                    y="380"
                    width="150"
                    height="160"
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <path
                    d="M450 380 L510 350 L510 510 L450 540 Z"
                    fill="url(#pf-side)"
                  />
                  <rect
                    x="300"
                    y="380"
                    width="150"
                    height="160"
                    fill="none"
                    stroke="rgba(255,255,255,.25)"
                  />
                </g>

                <rect
                  x="225"
                  y="300"
                  width="350"
                  height="125"
                  rx="6"
                  fill="rgba(255,255,255,.08)"
                  stroke="rgba(0,229,255,.45)"
                  strokeWidth="1.5"
                />
                <text
                  x={CX}
                  y="338"
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="22"
                  fontWeight="500"
                  letterSpacing="3"
                >
                  {hover !== null
                    ? wedges[hover].label.toUpperCase()
                    : "CHECK OUT OUR"}
                </text>
                <text
                  className="pf-title"
                  x={CX}
                  y="400"
                  textAnchor="middle"
                  fill="#00e5ff"
                  fontSize="60"
                  fontWeight="900"
                  textLength="310"
                  lengthAdjust="spacingAndGlyphs"
                  style={{ transition: "fill .3s" }}
                >
                  PORTFOLIO
                </text>
              </a>
            </svg>

            <p className="mt-3 text-center text-[10px] uppercase tracking-widest text-white/40 sm:text-xs">
              Hover to preview · Click to open
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
