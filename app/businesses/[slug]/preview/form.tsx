"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { previewDraft } from "./actions";

export function Preview({ slug }: { slug: string }) {
  const [state, submit, pending] = useActionState(
    previewDraft.bind(null, slug),
    {},
  );
  return (
    <>
      <form action={submit}>
        <Button disabled={pending}>Open private preview</Button>
      </form>
      {state.error && <p role="alert">{state.error}</p>}
      {state.description && (
        <div className="rounded-xl border bg-card p-5 grid gap-2 text-sm">
          <h2>Draft storefront</h2>
          <p>{state.description}</p>
          <p>{state.landmark}</p>
          <p>{state.hours}</p>
        </div>
      )}
    </>
  );
}
