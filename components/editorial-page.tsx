import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  MessageCircle,
  PanelsTopLeft,
  Workflow,
} from "lucide-react";

export function EditorialPage({ children }: { children: ReactNode }) {
  return <div className="bg-background">{children}</div>;
}

export function EditorialBack({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
      href={href}
    >
      <ArrowLeft size={16} aria-hidden="true" />
      {children}
    </Link>
  );
}

const productIcons = {
  pixelcore: CalendarDays,
  "website-builder": PanelsTopLeft,
  pixelflow: CreditCard,
  "pixel-workflows": Workflow,
  "smokey-chatbot": MessageCircle,
};

export function ServiceGlyph({ id }: { id: string }) {
  const Icon = Object.hasOwn(productIcons, id)
    ? productIcons[id as keyof typeof productIcons]
    : PanelsTopLeft;
  return (
    <span className="inline-grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary">
      <Icon size={22} strokeWidth={1.65} aria-hidden="true" />
    </span>
  );
}
