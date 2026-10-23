import { useEffect, useRef, useState } from "react";
import { navigate } from "../router";

// eframe-46.webp doesn't exist in /public/esyframes, so skip it
const FRAME_IDS = Array.from({ length: 161 }, (_, i) => i + 1).filter(
  (n) => n !== 46,
);
const FRAME_COUNT = FRAME_IDS.length;
const frameSrc = (i: number) => `/esyframes/eframe-${FRAME_IDS[i]}.webp`;

export default function ScrollProcess() {
  const wrapRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images: HTMLImageElement[] = [];
    let target = 0;
    let current = 0;
    let raf = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.onerror = () => console.error("Frame failed to load:", frameSrc(i));
      img.src = frameSrc(i);
      images.push(img);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(canvas.clientWidth, 1) * dpr;
      canvas.height = Math.max(canvas.clientHeight, 1) * dpr;
    };

    // The canvas has the same 16:9 shape as the frames, so nothing is cropped
    const drawCover = (img: HTMLImageElement, alpha: number) => {
      if (!img.complete || !img.naturalWidth || alpha <= 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      ctx.globalAlpha = 1;
    };

    const draw = (pos: number) => {
      const i = Math.min(Math.floor(pos), FRAME_COUNT - 1);
      const next = Math.min(i + 1, FRAME_COUNT - 1);
      const t = pos - i;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCover(images[i], 1);
      if (next !== i) drawCover(images[next], t);
    };

    const onScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const total = wrap.offsetHeight - window.innerHeight;
      const p = Math.min(Math.max(-rect.top / total, 0), 1);
      target = p * (FRAME_COUNT - 1);
      setProgress(p);
    };

    const loop = () => {
      current += (target - current) * 0.12;
      draw(current);
      raf = requestAnimationFrame(loop);
    };

    resize();
    onScroll();
    loop();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section
      ref={wrapRef}
      id="process-frames"
      className="relative h-[400vh] bg-ocean-dark"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden md:pt-24 lg:h-screen">
        {/* soft cyan glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_25%,rgba(0,229,255,0.08),transparent_55%)]" />

        <div className="relative mx-auto grid h-full max-w-7xl grid-cols-1 content-center items-center gap-5 px-4 pb-0 sm:px-6 lg:grid-cols-[0.85fr_1.4fr] lg:gap-10 lg:px-8">
          {/* ───────── SECTION 1 : TEXT ───────── */}
          <div className="order-1 -translate-y-8 lg:translate-y-0">
            <h2 className="mt-4 text-3xl font-extrabold uppercase leading-[1.2] tracking-tighter text-white sm:text-5xl lg:text-5xl xl:text-6xl">
              Precision in every cabinet
              <span className="block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
                scroll to explore.
              </span>
            </h2>

            <p className="mt-4 hidden max-w-md text-sm leading-relaxed text-white/70 lg:block">
              Keep scrolling to take a cabinet apart, look at what is inside and
              watch the finished video wall come together.
            </p>

            <button
              onClick={() => navigate("contact")}
              className="mt-6 inline-flex items-center gap-3 rounded-md bg-ocean-cyan px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(212,255,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(212,255,0,0.55)] sm:px-8 sm:py-4"
            >
              Request Engineering Proposal
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
            </button>
          </div>

          {/* ───────── SECTION 2 : FRAME CARD ───────── */}
          <div className="relative order-2">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-2 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:p-4">
              {/* cyan top edge highlight */}
              <div className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

              {/* 16:9 box that always fits the screen height */}
              <div
                className="relative mx-auto aspect-5/4 md:aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black"
                style={{ width: "min(100%, calc((100vh - 15rem) * 1.7778))" }}
              >
                <canvas ref={canvasRef} className="block h-full w-full" />

                {/* vignette */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-linear(ellipse_at_center,transparent_60%,rgba(0,0,0,0.45)_100%)]" />

                <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-white/60">
                  Scroll to explore
                </p>

                {/* scroll progress bar */}
                <div className="absolute inset-x-0 bottom-0 h-0.75 bg-white/5">
                  <div
                    className="h-full bg-ocean-cyan"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
