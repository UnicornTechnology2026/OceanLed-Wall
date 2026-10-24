import { useState, useEffect, useRef } from "react";
import MosaicBackground from "./MosaicBackground";
import oceanLogo from "../assets/logo-loader.png";

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Prevent scroll while loading
    document.body.style.overflow = "hidden";

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      // Instant complete for reduced motion
      setProgress(100);
      timeoutRef.current = window.setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setVisible(false);
          document.body.style.overflow = "";
          onComplete?.();
        }, 400);
      }, 600);
      return () => {
        clearTimeout(timeoutRef.current);
        document.body.style.overflow = "";
      };
    }

    // Smooth progress simulation ~3.5s total
    let current = 0;
    intervalRef.current = window.setInterval(() => {
      // Non-linear ease: faster at start, slower near end
      const remaining = 100 - current;
      const increment = Math.max(0.4, remaining * 0.035 + Math.random() * 1.2);
      current = Math.min(100, current + increment);
      setProgress(Math.floor(current));

      if (current >= 100) {
        clearInterval(intervalRef.current);
        timeoutRef.current = window.setTimeout(() => {
          setFading(true);
          setTimeout(() => {
            setVisible(false);
            document.body.style.overflow = "";
            onComplete?.();
          }, 700);
        }, 350);
      }
    }, 40);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center transition-opacity duration-700 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-live="polite"
      aria-busy="true"
    >
      <MosaicBackground />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Logo: the PNG already carries a white backing that follows the
            logo's own outline, so no circle is needed */}
        <div
          className="animate-fade-in-scale mb-6 opacity-0"
          style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
        >
          <img
            src={oceanLogo}
            alt="Ocean LED"
            width={233}
            height={219}
            className="animate-logo-glow h-32 w-auto sm:h-40"
          />
        </div>

        <p
          className="animate-fade-in-up text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white uppercase opacity-0"
          style={{
            animationDelay: "0.4s",
            animationFillMode: "forwards",
            letterSpacing: "0.08em",
          }}
        >
          OCEAN LED
        </p>
        {/* Subtitle */}
        <p
          className="animate-fade-in-up mt-3 text-xs sm:text-sm font-medium tracking-[0.35em] text-white/80 uppercase opacity-0"
          style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
        >
          INITIALIZING OCEAN WORLD
        </p>

        {/* Progress bar */}
        <div
          className="animate-fade-in-up mt-10 w-full max-w-132.5 opacity-0"
          style={{ animationDelay: "0.85s", animationFillMode: "forwards" }}
        >
          <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden backdrop-blur-sm">
            <div
              className="h-full rounded-full progress-gradient animate-progress-glow transition-[width] duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-white/50 tabular-nums tracking-wider">
            {progress}%
          </p>
        </div>
      </div>
    </div>
  );
}
