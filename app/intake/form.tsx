"use client";
import { useActionState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { intakeAction } from "./actions";

export function IntakeForm({
  action,
  children,
  label,
}: {
  action: string;
  children?: ReactNode;
  label: string;
}) {
  const [feedback, submit, running] = useActionState(intakeAction, "");
  return (
    <form
      className="grid min-w-0 gap-4 [&>label]:grid [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium [&>[data-slot=button]]:justify-self-start"
      action={submit}
    >
      <input type="hidden" name="action" value={action} />
      {children}
      <Button disabled={running}>{running ? "Working…" : label}</Button>
      {feedback && (
        <p
          className="rounded-lg border border-ring/30 bg-accent p-3 text-sm text-accent-foreground"
          role="status"
        >
          {feedback}
        </p>
      )}
    </form>
  );
}
