import { useEffect, useRef, useState } from "react";
import { navigate } from "../router";

// frame-10.jpeg doesn't exist in /public/frames, so skip it
const FRAME_IDS = Array.from({ length: 36 }, (_, i) => i + 1).filter(
  (n) => n !== 10,
);
const FRAME_COUNT = FRAME_IDS.length;
const frameSrc = (i: number) => `/frames/frame-${FRAME_IDS[i]}.jpeg`;

// Where the product sits horizontally in each source frame (0 = left, 1 = right).
const centerXFor = (n: number) => {
  if (n <= 26) return 0.5;
  if (n === 27) return 0.55;
  if (n <= 29) return 0.62;
  if (n <= 35) return 0.61;
  return 0.505; // frame 36 text block is centred around here
};
const CENTER_X = FRAME_IDS.map(centerXFor);

// Width of the important content as a fraction of the source image width.
// When set, the frame is scaled down so this content always stays inside the box.
// (frame 36 = the wide "OCEAN LED" close-up)
const contentWidthFor = (n: number) => (n === 36 ? 0.75 : 0);
const CONTENT_W = FRAME_IDS.map(contentWidthFor);

// How much of the card width the content may use
const FIT_MARGIN = 0.88;
// Background colour used where a fitted frame doesn't fill the whole card
const FILL = "#050a18";

export default function ScrollProduct() {
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

    const drawCover = (
      img: HTMLImageElement,
      alpha: number,
      cx: number,
      contentW: number,
    ) => {
      if (!img.complete || !img.naturalWidth || alpha <= 0) return;
      const cw = canvas.width;
      const ch = canvas.height;

      // cover scale, slightly zoomed so there is room to pan
      let scale =
        Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * 1.05;

      // keep wide content (like the OCEAN LED text) fully inside the box
      if (contentW > 0) {
        const fitScale = (cw * FIT_MARGIN) / (contentW * img.naturalWidth);
        scale = Math.min(scale, fitScale);
      }

      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;

      // centre the product (cx), but never pan so far that an empty edge shows
      const dx =
        w >= cw ? Math.min(0, Math.max(cw - w, cw / 2 - cx * w)) : (cw - w) / 2;
      const dy = (ch - h) / 2;

      // fitted frames may leave gaps (top/bottom) - fill them with the frame's dark colour
      if (contentW > 0) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = FILL;
        ctx.fillRect(0, 0, cw, ch);
      }

      ctx.globalAlpha = alpha;
      ctx.drawImage(img, dx, dy, w, h);
      ctx.globalAlpha = 1;
    };

    const draw = (pos: number) => {
      const i = Math.min(Math.floor(pos), FRAME_COUNT - 1);
      const next = Math.min(i + 1, FRAME_COUNT - 1);
      const t = pos - i;
      // smoothly pan between the two frames' centre points
      const cx = CENTER_X[i] + (CENTER_X[next] - CENTER_X[i]) * t;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCover(images[i], 1, cx, CONTENT_W[i]);
      if (next !== i) drawCover(images[next], t, cx, CONTENT_W[next]);
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
      id="product"
      className="relative h-[640vh] bg-ocean-dark"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* soft background glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(212,255,0,0.07),transparent_55%)]" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col gap-4 px-4 pb-4 sm:px-6 lg:grid lg:grid-cols-[1fr_1.45fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-6">
          {/* ───────── SECTION 1 : TEXT ───────── */}
          <div className="order-1 flex shrink-0 flex-col items-start">
            <h2 className="mt-2 text-[clamp(1.35rem,4.6vh,3rem)] font-extrabold uppercase leading-[1.1] tracking-tighter text-white lg:mt-5 lg:text-6xl">
              Redefining Digital Display Experiences
              <span className="mt-2 block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
                Performance That Never Pauses.
              </span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-snug text-white sm:text-base lg:mt-5 lg:text-lg lg:leading-relaxed">
              Direct-view LED architecture designed for continuous 24/7
              mission-critical operations, harsh ambient sunlight, and ultra-low
              maintenance overhead.
            </p>

            <button
              onClick={() => navigate("contact")}
              className="mt-4 inline-flex items-center gap-3 rounded-md bg-ocean-cyan px-6 py-3 lg:mt-6 lg:py-3.5 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(212,255,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(212,255,0,0.55)] sm:px-8"
            >
              Request Engineering Proposal
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
            </button>
          </div>

          {/* ───────── SECTION 2 : FRAME CARD ───────── */}
          <div className="relative order-2 min-h-35 flex-1 lg:h-full lg:max-h-[78vh] lg:flex-none">
            <div className="absolute inset-0 overflow-hidden rounded-[28px] lg:relative lg:inset-auto lg:h-full border border-white/10 bg-black shadow-[0_0_80px_rgba(0,0,0,0.6)]">
              {/* lime top edge highlight */}
              <div className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

              <canvas ref={canvasRef} className="block h-full w-full" />

              {/* vignette */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />

              <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-white/60">
                Scroll to rotate
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
    </section>
  );
}
