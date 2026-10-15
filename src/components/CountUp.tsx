import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value?: string | number | null;
  duration?: number;
}

export default function CountUp({ value, duration = 1600 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const str = String(value ?? '');
  const match = str.match(/\d+/);
  const target = match ? parseInt(match[0], 10) : null;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (target === null) return;
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      if (reduce) return setN(target);
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  if (target === null) return <span>{str}</span>;
  return <span ref={ref}>{str.replace(/\d+/, String(n))}</span>;
}