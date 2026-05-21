'use client';

import { useEffect, useRef } from 'react';

export function useCountUp(endValue: number, duration: number = 500) {
  const ref = useRef<HTMLSpanElement>(null);
  const countRef = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!ref.current) return;

    const startValue = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      countRef.current = Math.floor(startValue + (endValue - startValue) * progress);
      
      if (ref.current) {
        ref.current.textContent = countRef.current.toString();
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [endValue, duration]);

  return ref;
}
