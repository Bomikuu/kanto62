"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

type ChatWindow = Window & {
  SmokeyChatBot?: {
    mount(options: {
      siteId: string;
      apiBaseUrl: string;
      target: HTMLElement;
    }): { destroy(): void };
  };
};

export function Assistant({ host, site }: { host?: string; site?: string }) {
  const target = useRef<HTMLDivElement>(null);
  const widget = useRef<{ destroy(): void } | null>(null);
  useEffect(
    () => () => {
      widget.current?.destroy();
      widget.current = null;
    },
    [],
  );
  if (
    !site ||
    !host ||
    !(
      host.startsWith("https://") ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(host)
    )
  )
    return null;

  return (
    <div ref={target}>
      <Script
        src={new URL("/api/widget/script", host).href}
        strategy="lazyOnload"
        onReady={() => {
          if (!target.current || widget.current) return;
          widget.current =
            (window as ChatWindow).SmokeyChatBot?.mount({
              siteId: site,
              apiBaseUrl: host,
              target: target.current,
            }) ?? null;
        }}
      />
    </div>
  );
}
