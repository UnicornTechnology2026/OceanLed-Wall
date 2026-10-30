import { useEffect, useRef, useState } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  delay: number;
};

type Bokeh = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
};

const NAME = "OCEAN LED";
const NAME_START_MS = 1800; // when the company name starts to appear
const TOTAL_MS = 4800; // loader length before it fades out
const FADE_MS = 700;

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    let w = 0;
    let h = 0;
    let reach = 150;
    let nodes: Node[] = [];
    let bokeh: Bokeh[] = [];
    let raf = 0;
    let lastFrame = performance.now();
    let lastPct = -1;
    const timers: number[] = [];

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      reach = Math.max(130, Math.min(200, Math.min(w, h) * 0.35));
      const nodeCount = Math.round(clamp((w * h) / 16000, 28, 70));
      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1.6 + Math.random() * 1.8 + (Math.random() < 0.15 ? 1.5 : 0),
        delay: Math.random() * 1.6,
      }));
      bokeh = Array.from({ length: 16 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: 18 + Math.random() * 34,
        a: 0.07 + Math.random() * 0.14,
      }));
    };

    const draw = (t: number, step: number) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // soft blurred bokeh circles
      const bokehIn = clamp(t / 1.5);
      for (const b of bokeh) {
        b.x += b.vx * step;
        b.y += b.vy * step;
        if (b.x < -60) b.x = w + 60;
        if (b.x > w + 60) b.x = -60;
        if (b.y < -60) b.y = h + 60;
        if (b.y > h + 60) b.y = -60;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(90,160,255,${b.a * bokehIn})`);
        g.addColorStop(1, "rgba(90,160,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const n of nodes) {
        n.x += n.vx * step;
        n.y += n.vy * step;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      // connection lines grow outward over the first ~3 seconds
      const currentReach = reach * easeOut(clamp((t - 0.8) / 2.6));
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const ai = clamp((t - a.delay) / 0.8);
        for (let j = i + 1; j < nodes.length; j++) {
          const c = nodes[j];
          const dx = a.x - c.x;
          const dy = a.y - c.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < currentReach) {
            const alpha =
              (1 - dist / reach) *
              0.55 *
              Math.min(ai, clamp((t - c.delay) / 0.8));
            ctx.strokeStyle = `rgba(120,185,255,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(c.x, c.y);
            ctx.stroke();
          }
        }
      }

      // glowing nodes
      for (const n of nodes) {
        const k = clamp((t - n.delay) / 0.8);
        if (k <= 0) continue;
        ctx.fillStyle = `rgba(80,150,255,${0.22 * k})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(225,240,255,${k})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * k, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const finish = (delay: number) => {
      timers.push(
        window.setTimeout(() => {
          setFading(true);
          timers.push(
            window.setTimeout(() => {
              setVisible(false);
              document.body.style.overflow = "";
              onComplete?.();
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
  }, [onComplete]);

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

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p
          className="flex text-4xl font-extrabold uppercase sm:text-5xl md:text-6xl"
          aria-hidden="true"
          style={{
            color: "#e8f4ff",
            textShadow:
              "0 0 18px rgba(100,170,255,0.95), 0 0 42px rgba(0,140,255,0.5)",
          }}
        >
          {NAME.split("").map((ch, i) => (
            <span
              key={i}
              className="inline-block transition-all duration-700 ease-out"
              style={{
                opacity: showName ? 1 : 0,
                transform: showName ? "translateY(0)" : "translateY(10px)",
                transitionDelay: `${i * 110}ms`,
                marginRight: "0.12em",
                minWidth: ch === " " ? "0.4em" : undefined,
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </p>

        <div
          className="mt-8 w-40 transition-opacity duration-700 sm:w-56"
          style={{ opacity: showName ? 1 : 0, transitionDelay: "900ms" }}
        >
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-[rgba(120,185,255,0.2)]">
            <div
              className="h-full rounded-full bg-[#c8e4ff]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs tabular-nums tracking-wider text-white/50">
            {progress}%
          </p>
        </div>
      </div>
    </div>
  );
}
