import { useEffect, useRef, useState } from "react";
import logoSrc from "../assets/logo.png";

type Node = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  r: number;
  depth: number;
  delay: number;
  phase: number;
  k: number;
};

type Bokeh = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  par: number;
  delay: number;
  phase: number;
};

const NAME = "OCEAN LED";
const NAME_START_MS = 1800; // when the logo + company name start to appear
const TOTAL_MS = 4800; // loader length before it fades out
const FADE_MS = 700;
const LINKS_PER_NODE = 3; // nearest neighbours each node connects to
const DOT_SCALE = 1.4; // 1 = current size, 1.4 = about 40% bigger, 2 = double

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

// Pre-rendered soft sprites: far cheaper than building gradients every frame
const makeSprite = (stops: [number, string][]) => {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  return c;
};

type LoaderProps = {
  onComplete?: () => void;
  /** Path to your logo in /public (PNG, SVG or WebP). */
};

export default function Loader({ onComplete }: LoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [progress, setProgress] = useState(0);
  const [showName, setShowName] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    document.body.style.overflow = "hidden";

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // bright white-blue core with a soft halo (the sharp, in-focus points)
    const glowSprite = makeSprite([
      [0, "rgba(255,255,255,1)"],
      [0.1, "rgba(215,235,255,0.9)"],
      [0.25, "rgba(110,175,255,0.4)"],
      [0.55, "rgba(60,130,255,0.1)"],
      [1, "rgba(40,110,255,0)"],
    ]);
    // out-of-focus lens disc: flat centre, slightly brighter rim, soft edge
    const bokehSprite = makeSprite([
      [0, "rgba(80,150,255,0.55)"],
      [0.65, "rgba(90,160,255,0.65)"],
      [0.9, "rgba(140,195,255,0.9)"],
      [1, "rgba(100,170,255,0)"],
    ]);

    let w = 0;
    let h = 0;
    let reach = 150;
    let nodes: Node[] = [];
    let bokeh: Bokeh[] = [];
    let raf = 0;
    let lastFrame = performance.now();
    let lastPct = -1;
    const timers: number[] = [];

    const drawn = new Set<number>();
    const nbIdx: number[] = new Array(LINKS_PER_NODE).fill(-1);
    const nbDist: number[] = new Array(LINKS_PER_NODE).fill(Infinity);

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Spread points evenly (jittered grid) so no part of the screen is empty
      const target = clamp((w * h) / 9000, 44, 140);
      const cell = Math.sqrt((w * h) / target);
      reach = clamp(cell * 2.2, 110, 260);

      nodes = [];
      for (let gy = -cell / 2; gy < h + cell / 2; gy += cell) {
        for (let gx = -cell / 2; gx < w + cell / 2; gx += cell) {
          const depth = 0.6 + Math.random() * 0.4;
          nodes.push({
            x: gx + cell * (0.1 + Math.random() * 0.8),
            y: gy + cell * (0.1 + Math.random() * 0.8),
            px: 0,
            py: 0,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
            // dot size: raise these numbers for even bigger dots
            r:
              (2.2 + Math.random() * 2 + (Math.random() < 0.15 ? 1.8 : 0)) *
              depth *
              DOT_SCALE,
            depth,
            delay: Math.random() * 0.9,
            phase: Math.random() * Math.PI * 2,
            k: 0,
          });
        }
      }

      // bokeh discs also spread evenly, plus a few huge faint blooms
      const bCell = Math.sqrt((w * h) / 34);
      bokeh = [];
      for (let gy = -bCell / 2; gy < h + bCell / 2; gy += bCell) {
        for (let gx = -bCell / 2; gx < w + bCell / 2; gx += bCell) {
          bokeh.push({
            x: gx + bCell * Math.random(),
            y: gy + bCell * Math.random(),
            vx: (Math.random() - 0.5) * 0.14,
            vy: (Math.random() - 0.5) * 0.14,
            r: 9 + Math.pow(Math.random(), 2) * 40,
            a: 0.05 + Math.random() * 0.13,
            par: 0.5 + Math.random() * 2,
            delay: Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
      for (let i = 0; i < 6; i++) {
        bokeh.push({
          x: ((i + Math.random()) / 6) * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          r: 70 + Math.random() * 60,
          a: 0.035 + Math.random() * 0.03,
          par: 2.5,
          delay: Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const draw = (t: number, step: number) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // slow camera drift: nearer things move more than far things (parallax)
      const camX = Math.sin(t * 0.35) * 14;
      const camY = Math.cos(t * 0.28) * 10;

      // soft blue haze on the left, like the reference footage
      const fogIn = clamp(t / 1.2);
      const fogR = Math.max(w, h) * 0.6;
      const fog = ctx.createRadialGradient(
        w * 0.1,
        h * 0.55,
        0,
        w * 0.1,
        h * 0.55,
        fogR,
      );
      fog.addColorStop(0, `rgba(40,100,200,${0.22 * fogIn})`);
      fog.addColorStop(1, "rgba(40,100,200,0)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, w, h);

      // out-of-focus bokeh
      for (const b of bokeh) {
        b.x += b.vx * step;
        b.y += b.vy * step;
        if (b.x < -b.r) b.x = w + b.r;
        if (b.x > w + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = h + b.r;
        if (b.y > h + b.r) b.y = -b.r;
        const k = clamp((t - b.delay) / 1.2);
        if (k <= 0) continue;
        const tw = 0.8 + 0.2 * Math.sin(t * 0.9 + b.phase);
        ctx.globalAlpha = b.a * k * tw;
        ctx.drawImage(
          bokehSprite,
          b.x + camX * b.par - b.r,
          b.y + camY * b.par - b.r,
          b.r * 2,
          b.r * 2,
        );
      }
      ctx.globalAlpha = 1;

      // move nodes
      for (const n of nodes) {
        n.x += n.vx * step;
        n.y += n.vy * step;
        if (n.x < -40 || n.x > w + 40) n.vx *= -1;
        if (n.y < -40 || n.y > h + 40) n.vy *= -1;
        n.px = n.x + camX * n.depth;
        n.py = n.y + camY * n.depth;
        n.k = clamp((t - n.delay) / 0.8);
      }

      // network: every node links to its nearest neighbours (triangulated look)
      const reachNow = reach * easeOut(clamp((t - 0.8) / 2.6));
      const N = nodes.length;
      drawn.clear();
      ctx.lineWidth = 0.9;
      for (let i = 0; i < N; i++) {
        const a = nodes[i];
        nbIdx.fill(-1);
        nbDist.fill(Infinity);
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          const dx = a.px - nodes[j].px;
          const dy = a.py - nodes[j].py;
          const d2 = dx * dx + dy * dy;
          if (d2 >= nbDist[LINKS_PER_NODE - 1]) continue;
          let p = LINKS_PER_NODE - 1;
          while (p > 0 && nbDist[p - 1] > d2) {
            nbDist[p] = nbDist[p - 1];
            nbIdx[p] = nbIdx[p - 1];
            p--;
          }
          nbDist[p] = d2;
          nbIdx[p] = j;
        }
        for (let q = 0; q < LINKS_PER_NODE; q++) {
          const j = nbIdx[q];
          if (j < 0) continue;
          const d = Math.sqrt(nbDist[q]);
          if (d > reachNow) continue;
          const key = i < j ? i * N + j : j * N + i;
          if (drawn.has(key)) continue;
          drawn.add(key);
          const c = nodes[j];
          const alpha =
            Math.pow(1 - d / reach, 1.1) *
            0.75 *
            Math.min(a.k, c.k) *
            ((a.depth + c.depth) / 2);
          ctx.strokeStyle = `rgba(140,195,255,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(c.px, c.py);
          ctx.stroke();
        }
      }

      // glowing nodes: soft halo + crisp bright core
      for (const n of nodes) {
        if (n.k <= 0) continue;
        const tw = 0.85 + 0.15 * Math.sin(t * 1.6 + n.phase);
        const glowD = n.r * 10;
        ctx.globalAlpha = 0.75 * n.k * n.depth * tw;
        ctx.drawImage(
          glowSprite,
          n.px - glowD / 2,
          n.py - glowD / 2,
          glowD,
          glowD,
        );
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(240,248,255,${n.k * (0.7 + 0.3 * n.depth)})`;
        ctx.beginPath();
        ctx.arc(n.px, n.py, n.r * 0.85 * n.k, 0, Math.PI * 2);
        ctx.fill();
      }

      // vignette keeps the edges dark and focuses the eye on the centre
      ctx.globalCompositeOperation = "source-over";
      const vig = ctx.createRadialGradient(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.25,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.75,
      );
      vig.addColorStop(0, "rgba(2,4,10,0)");
      vig.addColorStop(1, "rgba(2,4,10,0.7)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    };

    const finish = (delay: number) => {
      timers.push(
        window.setTimeout(() => {
          setFading(true);
          timers.push(
            window.setTimeout(() => {
              setVisible(false);
              document.body.style.overflow = "";
              onCompleteRef.current?.();
            }, FADE_MS),
          );
        }, delay),
      );
    };

    setup();
    const onResize = () => setup();
    window.addEventListener("resize", onResize);

    if (reduced) {
      // static frame, no motion
      draw(4, 0);
      setShowName(true);
      setProgress(100);
      finish(700);
    } else {
      const start = performance.now();
      timers.push(window.setTimeout(() => setShowName(true), NAME_START_MS));
      finish(TOTAL_MS);

      const loop = (now: number) => {
        const elapsed = now - start;
        const step = Math.min(40, now - lastFrame) / 16.7;
        lastFrame = now;
        draw(elapsed / 1000, step);

        const pct = Math.round(
          easeOut(
            clamp((elapsed - NAME_START_MS) / (TOTAL_MS - NAME_START_MS - 200)),
          ) * 100,
        );
        if (pct !== lastPct) {
          lastPct = pct;
          setProgress(pct);
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#02040a] transition-opacity duration-700 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading Ocean LED"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />

      {/* dark scrim behind the logo + text so they stay crisp over the network */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: showName ? 1 : 0,
          background:
            "radial-gradient(ellipse 55% 36% at 50% 50%, rgba(2,4,10,0.78) 0%, rgba(2,4,10,0.45) 55%, rgba(2,4,10,0) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* logo */}
        <img
          src={logoSrc}
          alt="Ocean LED logo"
          className="mb-4 h-44 w-44 object-contain transition-all duration-700 ease-out sm:h-56 sm:w-56 md:h-64 md:w-64"
          style={{
            opacity: showName ? 1 : 0,
            transform: showName ? "translateY(0)" : "translateY(10px)",
          }}
        />

        {/* company name */}
        <div className="-mt-12 flex flex-col items-center">
          <p
            className="flex text-4xl font-bold uppercase sm:text-5xl md:text-6xl"
            aria-hidden="true"
            style={{
              color: "#f2f8ff",
              textShadow:
                "0 0 22px rgba(90,160,255,0.55), 0 2px 14px rgba(2,4,10,0.95)",
            }}
          >
            {NAME.split("").map((ch, i) => (
              <span
                key={i}
                className="inline-block transition-all duration-700 ease-out"
                style={{
                  opacity: showName ? 1 : 0,
                  transform: showName ? "translateY(0)" : "translateY(10px)",
                  transitionDelay: "0ms",
                  marginRight: "0.14em",
                  minWidth: ch === " " ? "0.4em" : undefined,
                }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </p>

          <p
            className="mt-2 text-xs font-medium uppercase tracking-[0.4em] sm:text-sm md:text-base transition-all duration-700 ease-out"
            aria-hidden="true"
            style={{
              color: "rgba(242,248,255,0.75)",
              textShadow: "0 0 12px rgba(90,160,255,0.45)",
              opacity: showName ? 1 : 0,
              transform: showName ? "translateY(0)" : "translateY(10px)",
              transitionDelay: "300ms",
            }}
          >
            Video Wall
          </p>
        </div>

        <div
          className="mt-8 w-44 transition-opacity duration-700 sm:w-60"
          style={{ opacity: showName ? 1 : 0, transitionDelay: "900ms" }}
        >
          <div className="h-0.75 w-full overflow-hidden rounded-full bg-[rgba(120,185,255,0.22)]">
            <div
              className="h-full rounded-full bg-[#d6eaff]"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 10px rgba(120,185,255,0.9)",
              }}
            />
          </div>
          <p className="mt-3 text-sm tabular-nums tracking-wider text-white/80">
            {progress}%
          </p>
        </div>
      </div>
    </div>
  );
}
