'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = Date.now();
          const startValue = 0;
          const endValue = end;

          const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);

            // Easing function (easeOutQuart)
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (endValue - startValue) * easeProgress);

            setCount(currentValue);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(endValue);
            }
          };

          animate();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}
