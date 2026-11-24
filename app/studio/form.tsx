"use client";

import Link from "next/link";
import { ArrowUpRight, ClipboardList, ScanSearch } from "lucide-react";
import { startTransition, useActionState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/catalog";
import { studioAction } from "./actions";
import { type Match, verifiedDate } from "./types";

export function StudioForm({
  section,
  label,
  children,
  primary = false,
}: {
  section: string;
  label: string;
  children?: ReactNode;
  primary?: boolean;
}) {
  const [state, submit, pending] = useActionState(
    studioAction.bind(null, section),
    {},
  );
  return (
    <form
      className="grid min-w-0 gap-4 [&>label]:grid [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium [&>[data-slot=button]]:justify-self-start gap-3"
      action={submit}
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        const data = new FormData(event.currentTarget);
        startTransition(() => submit(data));
      }}
    >
      {children}
      {state.prospect ? (
        <Button asChild variant="outline">
          <Link href={`/studio/prospects?record=${state.prospect}`}>
            Open saved prospect <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <Button disabled={pending} variant={primary ? "default" : "outline"}>
          {pending ? "Working…" : label}
        </Button>
      )}
      {state.message && (
        <p
          className="rounded-lg border border-primary/25 bg-accent p-3 text-sm text-accent-foreground data-error:border-destructive/30 data-error:bg-destructive/8 data-error:text-destructive"
          role={state.ok ? "status" : "alert"}
          data-error={!state.ok || undefined}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

export function ProductReview({
  products,
  matches,
  lead,
  selectedProduct,
}: {
  products: Product[];
  matches: Match[];
  lead: string;
  selectedProduct?: string;
}) {
  const [state, submit, pending] = useActionState(
    studioAction.bind(null, "recommend"),
    {},
  );
  const visible = state.matches ?? matches;
  return (
    <section
      className="min-w-0 overflow-hidden rounded-xl border bg-card"
      aria-labelledby="product-fit"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground">
        <div>
          <h2 id="product-fit">Product fit</h2>
          <p>Matches based on the business’s stated needs.</p>
        </div>
        {matches.length > 0 && (
          <form action={submit}>
            <input type="hidden" name="lead" value={lead} />
            <Button variant="outline" disabled={pending}>
              <ScanSearch size={16} aria-hidden="true" />
              {pending ? "Reviewing…" : "Review recommendations"}
            </Button>
          </form>
        )}
      </div>
      {state.message && (
        <p
          className="rounded-lg border border-primary/25 bg-accent p-3 text-sm text-accent-foreground data-error:border-destructive/30 data-error:bg-destructive/8 data-error:text-destructive"
          role="alert"
          data-error
        >
          {state.message}
        </p>
      )}
      <p className="p-4 text-sm text-muted-foreground sm:px-5" role="status">
        {state.mode === "ai_ranked"
          ? "Ranked by AI from the verified selections."
          : state.matches
            ? "Ranked from the merchant’s verified selections."
            : null}
      </p>
      {visible.length ? (
        <ul className="space-y-3 px-4 pb-4 sm:px-5 [&>li]:grid [&>li]:gap-3 [&>li]:rounded-lg [&>li]:border [&>li]:p-3">
          {visible.map((match) => {
            const product = products.find((item) => item.id === match.product);
            const selected = selectedProduct === match.product;
            return (
              <li key={match.product}>
                <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                  <h3>{product?.name ?? match.product}</h3>
                  {selected && (
                    <span className="shrink-0 bg-accent text-accent-foreground">
                      Saved fit
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{match.reason}</p>
                {product?.description && <p>{product.description}</p>}
                <div className="grid gap-2 text-sm text-muted-foreground [&_a]:text-primary [&_a:hover]:underline">
                  <ClipboardList size={17} aria-hidden="true" />
                  <div>
                    <p>{match.evidence}</p>
                    <p>
                      {verifiedDate(match.evidence_date)} ·{" "}
                      {match.confidence === "high" ? "High" : "Medium"}{" "}
                      confidence
                    </p>
                  </div>
                </div>
                {!selected && (
                  <>
                    <details className="rounded-lg bg-muted p-3 [&>summary]:cursor-pointer [&>summary]:font-medium [&>p]:mt-2">
                      <summary>View outreach draft</summary>
                      <p>{match.draft}</p>
                    </details>
                    <StudioForm section="prospects" label="Save prospect">
                      <input type="hidden" name="action" value="save" />
                      <input type="hidden" name="lead" value={lead} />
                      <input
                        type="hidden"
                        name="product"
                        value={match.product}
                      />
                    </StudioForm>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="grid justify-items-start gap-3 p-5 sm:p-7 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground [&_a]:inline-flex [&_a]:items-center [&_a]:gap-2 [&_a]:text-sm [&_a]:font-semibold [&_a]:text-primary p-4">
          <p>There’s insufficient evidence to suggest a product.</p>
        </div>
      )}
    </section>
  );
}
