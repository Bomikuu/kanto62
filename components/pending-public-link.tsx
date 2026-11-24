"use client";

import Link, { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";
import type { ComponentProps } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function PendingPreview({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return createPortal(
    <div
      role="status"
      className="pointer-events-none fixed right-4 bottom-4 z-40 w-72 max-w-[calc(100%-2rem)] space-y-3 rounded-xl border bg-card p-4 text-card-foreground shadow-md [body:has([data-landing])_&]:rounded-none"
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <span
          className="size-4 rounded-full border-2 border-primary/30 border-t-primary motion-safe:animate-spin"
          aria-hidden="true"
        />
        {label}
      </p>
      <div
        className="grid grid-cols-[4rem_1fr] items-center gap-3"
        aria-hidden="true"
      >
        <Skeleton className="aspect-[1.5] motion-reduce:animate-none" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-4/5 motion-reduce:animate-none" />
          <Skeleton className="h-3 w-1/2 motion-reduce:animate-none" />
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function PendingPublicLink({
  children,
  loadingLabel,
  ...props
}: ComponentProps<typeof Link> & { loadingLabel: string }) {
  return (
    <Link {...props}>
      {children}
      <PendingPreview label={loadingLabel} />
    </Link>
  );
}
