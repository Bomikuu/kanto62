"use client";
import {
  startTransition,
  useActionState,
  useState,
  type ReactNode,
} from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { changeBilling } from "./actions";

export function BillingForm({
  slug,
  children,
  label,
  action,
  primary = false,
}: {
  slug: string;
  children?: ReactNode;
  label: string;
  action: string;
  primary?: boolean;
}) {
  const [state, submit, pending] = useActionState(
    changeBilling.bind(null, slug),
    {},
  );
  return (
    <form
      className="grid min-w-0 gap-4 [&>label]:grid [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium [&>[data-slot=button]]:justify-self-start [&>[data-slot=button]]:w-fit"
      action={submit}
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        const data = new FormData(event.currentTarget);
        startTransition(() => submit(data));
      }}
    >
      <input type="hidden" name="action" value={action} />
      {children}
      <Button variant={primary ? "default" : "outline"} disabled={pending}>
        {pending ? "Working…" : label}
      </Button>
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-primary/25 bg-accent p-3 text-sm text-accent-foreground data-[tone=error]:border-destructive/30 data-[tone=error]:bg-destructive/8 data-[tone=error]:text-destructive"
          data-tone="error"
        >
          {state.error}
        </p>
      )}
      {state.message && (
        <p
          role="status"
          className="rounded-lg border border-primary/25 bg-accent p-3 text-sm text-accent-foreground data-[tone=error]:border-destructive/30 data-[tone=error]:bg-destructive/8 data-[tone=error]:text-destructive"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

export function CopyRecord({ value, label }: { value: string; label: string }) {
  const [status, setStatus] = useState("");
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 [&>code]:break-all [&>code]:text-xs">
      <code>{value}</code>
      <Button
        variant="ghost"
        type="button"
        aria-label={label}
        title={label}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setStatus("Copied");
          } catch {
            setStatus("Select and copy this value manually.");
          }
        }}
      >
        <Copy size={16} strokeWidth={1.65} aria-hidden="true" />
      </Button>
      <span aria-live="polite">{status}</span>
    </div>
  );
}
