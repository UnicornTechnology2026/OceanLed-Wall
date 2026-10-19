import { useEffect, useRef } from "react";

const FRAME_COUNT = 160;
const frameSrc = (i: number) => `/esyframes/eframe-${i + 1}.webp`;

export default function ScrollProcess() {
  const wrapRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      const progress = Math.min(Math.max(-rect.top / total, 0), 1);
      target = progress * (FRAME_COUNT - 1);
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
      className="relative h-[300vh] bg-ocean-dark"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden pt-20 md:pt-24">
        {/* Heading above the frame */}
        <div className="shrink-0 px-4 pb-4 text-center">
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-ocean-cyan">
            Engineered Inside Out
          </p>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold text-white">
            Precision in Every Cabinet
          </h2>
        </div>

        {/* Frame area fills the remaining height */}
        <div className="relative min-h-0 flex-1">
          <canvas ref={canvasRef} className="block h-full w-full" />
          <p className="pointer-events-none absolute bottom-4 inset-x-0 text-center text-xs tracking-widest uppercase text-white/40">
            Scroll to rotate
          </p>
        </div>
      </div>
    </section>
  );
}
