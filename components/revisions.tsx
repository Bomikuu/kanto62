"use client";
import { NativeSelect } from "@/components/ui/native-select";
import { useActionState } from "react";
import { restore, type Outcome } from "@/app/actions";
import { Button } from "@/components/ui/button";
export type Revision = { id: string; published_at: string };
export function RevisionPicker({
  slug,
  revisions,
}: {
  slug: string;
  revisions: Revision[];
}) {
  const [state, action, pending] = useActionState(
    restore.bind(null, slug),
    {} as Outcome,
  );
  if (!revisions.length) return null;
  return (
    <form
      className="grid min-w-0 gap-4 [&>label]:grid [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium [&>[data-slot=button]]:justify-self-start"
      action={action}
    >
      <label>
        Choose a revision
        <NativeSelect name="revision_id">
          {revisions.map((r) => (
            <option key={r.id} value={r.id}>
              {new Intl.DateTimeFormat("en-PH", {
                dateStyle: "medium",
                timeStyle: "medium",
                timeZone: "Asia/Manila",
              }).format(new Date(r.published_at))}{" "}
              PHT
            </option>
          ))}
        </NativeSelect>
      </label>
      <Button variant="outline" disabled={pending}>
        Restore to draft
      </Button>
      {state.message && <p role="status">{state.message}</p>}
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
