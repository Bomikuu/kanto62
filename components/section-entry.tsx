"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SectionEntry() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      !window.IntersectionObserver ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-entered", "");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    document
      .querySelectorAll("[data-section-entry]:not([data-entered])")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
