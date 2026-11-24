"use client";
import { useEffect, useRef, useState } from "react";

export function Metric({ value, label }: { value: number; label: string }) {
  const marker = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(value);
  useEffect(() => {
    if (
      !marker.current ||
      !("IntersectionObserver" in window) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        setCurrent(0);
        const tick = (now: number) => {
          const fraction = Math.min(1, (now - start) / 850);
          setCurrent(Math.round(value * (1 - Math.pow(1 - fraction, 3))));
          if (fraction < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(marker.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  const format = new Intl.NumberFormat("en-PH");
  return (
    <div>
      <span className="sr-only">{format.format(value)} </span>
      <span
        ref={marker}
        aria-hidden
        className="block text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl"
      >
        {format.format(current)}
      </span>
      <span className="mt-2 block text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
