import { useEffect, useRef, useState } from 'react';
import type { ElementType, ReactNode } from 'react';

/**
 * Fades/slides children in when they scroll into view.
 * direction: 'up' | 'down' | 'left' | 'right' | 'scale'
 */
interface RevealProps {
  children?: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  delay?: number;
  className?: string;
  as?: ElementType;
}

export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal reveal-${direction} ${visible ? 'reveal-in' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}