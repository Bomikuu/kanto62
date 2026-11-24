"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Clock, Globe2, MapPin, Monitor, Smartphone } from "lucide-react";
import { useActionState, useState } from "react";
import { enter, edit, type Outcome } from "@/app/actions";
import { art, type Business } from "@/lib/types";
const initial: Outcome = {};
function Feedback({ state }: { state: Outcome }) {
  return (
    <>
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
    </>
  );
}
export function Login({ b }: { b: Business }) {
  const claim = b.ownership_status === "unclaimed";
  const [state, action, pending] = useActionState(
    enter.bind(null, b.slug, claim),
    initial,
  );
  return (
    <form
      action={action}
      className="grid min-w-0 gap-4 [&>label]:grid [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium [&>[data-slot=button]]:justify-self-start"
    >
      <label>
        Merchant username
        <Input name="username" required autoComplete="username" />
      </label>
      <label>
        Password
        <Input
          type="password"
          name="password"
          required
          autoComplete="current-password"
        />
      </label>
      {claim && (
        <label>
          Ownership verification code
          <Input name="code" required autoComplete="one-time-code" />
        </label>
      )}
      <Feedback state={state} />
      <Button disabled={pending}>
        {pending ? "Verifying…" : claim ? "Verify and claim" : "Open editor"}
      </Button>
    </form>
  );
}
export type Draft = Pick<Business, "description" | "hours" | "landmark">;
export function Editor({ b, draft }: { b: Business; draft: Draft }) {
  const [state, action, pending] = useActionState(
    edit.bind(null, b.slug),
    initial,
  );
  const [values, set] = useState(draft);
  const [view, setView] = useState<"phone" | "desktop">("desktop");
  const published =
    b.storefront_published || state.message === "Storefront published.";

  return (
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
      <form
        className="grid min-w-0 gap-4 [&>label]:grid [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium [&>[data-slot=button]]:justify-self-start rounded-xl border bg-card p-4 sm:p-5"
        action={action}
      >
        <h2>Business details</h2>
        <label>
          Business description
          <Textarea
            name="description"
            rows={5}
            required
            maxLength={1500}
            value={values.description}
            onChange={(event) =>
              set({ ...values, description: event.target.value })
            }
          />
        </label>
        <label>
          Opening hours
          <Input
            name="hours"
            required
            value={values.hours}
            onChange={(event) => set({ ...values, hours: event.target.value })}
          />
        </label>
        <label>
          Address or landmark
          <Input
            name="landmark"
            required
            value={values.landmark}
            onChange={(event) =>
              set({ ...values, landmark: event.target.value })
            }
          />
        </label>
        <Feedback state={state} />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            name="intent"
            value="save"
            variant="outline"
            disabled={pending}
          >
            Save draft
          </Button>
          <Button name="intent" value="publish" disabled={pending}>
            {pending ? "Saving…" : "Publish storefront"}
          </Button>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Publishing makes the saved details visible on your public listing.
        </p>
      </form>
      <section
        className="overflow-hidden rounded-xl border bg-card xl:sticky xl:top-22"
        aria-labelledby="editor-preview-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4 [&_h2]:text-lg [&_h2]:font-semibold">
          <div>
            <h2 id="editor-preview-title">Draft preview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Updates as you type.
            </p>
          </div>
          <div
            className="flex items-center gap-1 rounded-md border p-1 [&>button]:rounded-sm [&>button]:px-2 [&>button]:py-1 [&>button]:text-xs [&>button]:font-medium [&>button[aria-pressed=true]]:bg-accent [&>button[aria-pressed=true]]:text-primary"
            role="group"
            aria-label="Preview size"
          >
            <Button
              variant="ghost"
              type="button"
              aria-pressed={view === "desktop"}
              aria-label="Wide preview"
              onClick={() => setView("desktop")}
            >
              <Monitor size={17} aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              type="button"
              aria-pressed={view === "phone"}
              aria-label="Phone preview"
              onClick={() => setView("phone")}
            >
              <Smartphone size={17} aria-hidden="true" />
            </Button>
          </div>
        </div>
        <div className="bg-muted/60 p-3 sm:p-4">
          <article
            className="mx-auto overflow-hidden rounded-lg border bg-card data-[preview=phone]:max-w-60 [&>img]:aspect-[2.3] [&>img]:w-full [&>img]:object-cover [&>div]:space-y-2 [&>div]:p-3 [&_h3]:font-semibold [&_p]:text-sm"
            data-preview={view}
          >
            <img
              src={"/art/" + art[b.category] + ".jpg"}
              alt=""
              width={724}
              height={724}
            />
            <div>
              <h3>{b.name}</h3>
              {values.description && <p>{values.description}</p>}
              {values.landmark && (
                <p className="flex items-start gap-2 text-muted-foreground [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg]:text-primary">
                  <MapPin size={16} aria-hidden="true" />
                  {values.landmark}
                </p>
              )}
              {values.hours && (
                <p className="flex items-start gap-2 text-muted-foreground [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg]:text-primary">
                  <Clock size={16} aria-hidden="true" />
                  {values.hours}
                </p>
              )}
            </div>
          </article>
        </div>
        <p className="border-t px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <Globe2 size={16} aria-hidden="true" />
          {published ? "Published version available" : "Storefront unpublished"}
        </p>
      </section>
    </div>
  );
}
