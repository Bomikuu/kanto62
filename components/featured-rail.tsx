"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeaturedRail({ children }: { children: ReactNode }) {
  const rail = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ previous: false, next: false });

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () =>
      setPosition({
        previous: element.scrollLeft > 2,
        next:
          element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
      });
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function step(direction: number) {
    const element = rail.current;
    const item = element?.firstElementChild;
    if (!element || !item) return;
    const stride =
      item.getBoundingClientRect().width +
      parseFloat(getComputedStyle(element).columnGap);
    element.scrollBy({
      left: direction * stride,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  const showControls = position.previous || position.next;
  return (
    <div className="relative min-w-0">
      <ul
        ref={rail}
        className="grid snap-x snap-mandatory auto-cols-[82%] grid-flow-col gap-3 overflow-x-auto px-px py-px [scrollbar-width:none] sm:auto-cols-[calc((100%-0.75rem)/2)] md:auto-cols-[calc((100%-1.5rem)/3)] [&>*]:snap-start"
      >
        {children}
      </ul>
      {showControls && (
        <div className="mt-3 flex justify-end gap-2 lg:absolute lg:top-1/2 lg:-right-12 lg:mt-0 lg:-translate-y-1/2 lg:flex-col-reverse">
          <Button
            type="button"
            variant="outline"
            className="aspect-square rounded-none bg-card shadow-sm"
            aria-label="Previous featured place"
            disabled={!position.previous}
            onClick={() => step(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="aspect-square rounded-none bg-card shadow-sm"
            aria-label="Next featured place"
            disabled={!position.next}
            onClick={() => step(1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
