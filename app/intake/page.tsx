import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cookies } from "next/headers";
import { api, ApiError } from "@/lib/api";
import { catalog } from "@/lib/catalog";
import { googleEnabled } from "@/lib/oidc";
import {
  AccessIllustration,
  MerchantFrame,
  MerchantHeading,
} from "@/components/merchant-frame";
import { IntakeForm } from "./form";
import type { Business } from "@/lib/types";

export const metadata = {
  title: "Contact and business signup",
  robots: { index: false, follow: false },
};
type Draft = {
  id: string;
  goal: string;
  business: string;
  channel: string;
  verified: boolean;
  submitted: boolean;
  reviewed: boolean;
  demo: string | null;
  cancelled: boolean;
  follow_up: boolean;
  slots: { id: number; starts_at: string }[];
};
type Query = {
  goal?: string;
  product?: string;
  referral?: string;
  plan?: string;
  q?: string;
};
const format = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));

export default async function Intake({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query = await searchParams;
  const resume = (await cookies()).get("k62intake")?.value;
  const { products } = await catalog();
  let draft: Draft | undefined;
  if (resume)
    try {
      draft = await api<Draft>("/intake/draft/", {
        headers: { "X-Kanto62-Intake": resume },
      });
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) throw error;
    }
  const goal =
    query.goal === "claim"
      ? "claim"
      : query.goal === "listing"
        ? "listing"
        : "demo";
  const searchResults =
    draft?.verified &&
    !draft.submitted &&
    draft.goal !== "demo" &&
    query.q?.trim()
      ? (
          await api<{ results: Business[] }>(
            "/businesses/?" + new URLSearchParams({ q: query.q.slice(0, 120) }),
          )
        ).results
      : [];
  const claiming = (draft?.goal || goal) === "claim";
  const productInterests = (
    <>
      <label>
        Primary product interest
        <NativeSelect name="product" defaultValue={query.product || ""}>
          <option value="">Help me choose</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </NativeSelect>
      </label>
      <fieldset className="grid gap-2 rounded-lg border bg-card p-3">
        <legend className="px-1 text-sm font-medium">
          What do you need help with?
        </legend>
        {products.map((product) => (
          <label className="flex! items-start gap-2.5 text-sm" key={product.id}>
            <Checkbox className="mt-0.5" name="needs" value={product.id} />
            {product.signal}
          </label>
        ))}
      </fieldset>
    </>
  );
  const content = (
    <>
      {!draft ? (
        <>
          <nav
            className="flex flex-wrap items-center gap-2 [&>a]:inline-flex [&>a]:items-center [&>a]:rounded-lg [&>a]:border [&>a]:bg-card [&>a]:px-3 [&>a]:py-1.5 [&>a]:text-sm [&>a]:font-medium hover:[&>a]:bg-muted [&>a[aria-current]]:border-primary/25 [&>a[aria-current]]:bg-accent [&>a[aria-current]]:text-primary"
            aria-label="Signup goals"
          >
            <Link
              href="/intake?goal=demo"
              aria-current={goal === "demo" ? "page" : undefined}
            >
              Book a demo
            </Link>
            <Link
              href="/intake?goal=claim"
              aria-current={goal === "claim" ? "page" : undefined}
            >
              Find my listing
            </Link>
            <Link
              href="/intake?goal=listing"
              aria-current={goal === "listing" ? "page" : undefined}
            >
              Add a business
            </Link>
          </nav>
          <h2>Your contact details</h2>
          {googleEnabled() && (
            <form method="post" action="/auth/start">
              <input type="hidden" name="provider" value="google" />
              <Button variant="outline">Continue with Google</Button>
            </form>
          )}
          <IntakeForm action="start" label="Send verification code">
            <input type="hidden" name="goal" value={goal} />
            <input
              type="hidden"
              name="referral"
              value={query.referral || "direct"}
            />
            <input type="hidden" name="plan" value={query.plan || "listing"} />
            <label>
              Your name
              <Input
                maxLength={120}
                name="contact"
                required
                autoComplete="name"
              />
            </label>
            <label>
              Business name
              <Input
                maxLength={120}
                name="business"
                required
                autoComplete="organization"
                defaultValue={claiming ? query.q?.slice(0, 120) : undefined}
              />
            </label>
            <Channel />
            {claiming ? (
              <details className="w-full rounded-lg border p-3 [&>summary]:cursor-pointer [&>summary]:text-sm [&>summary]:font-medium [&>div]:mt-3">
                <summary>Add product interests</summary>
                {productInterests}
              </details>
            ) : (
              productInterests
            )}
            <p>We’ll use your verified contact for this request.</p>
            <label className="flex! items-start gap-2.5 text-sm">
              <Checkbox className="mt-0.5" name="marketing" />
              Send me other product updates.
            </label>
          </IntakeForm>
        </>
      ) : !draft.verified ? (
        <>
          <h2>
            Verify your {draft.channel === "phone" ? "mobile number" : "email"}
          </h2>
          <p>Enter the six-digit code for {draft.business}.</p>
          <IntakeForm action="verify" label="Verify contact">
            <label>
              Verification code
              <Input
                required
                name="code"
                pattern="[0-9]{6}"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </label>
          </IntakeForm>
          <IntakeForm action="resend" label="Request another code" />
          <details>
            <summary>Change verification destination</summary>
            <IntakeForm
              action="change_destination"
              label="Send to new destination"
            >
              <Channel />
            </IntakeForm>
          </details>
        </>
      ) : draft.submitted ? (
        <>
          <h2>
            {draft.demo
              ? "Demo booked"
              : draft.cancelled
                ? "Demo cancelled"
                : draft.reviewed
                  ? "Listing reviewed"
                  : "Request received"}
          </h2>
          {draft.demo && (
            <>
              <p>{format(draft.demo)} Philippine time</p>
              <p>Booking reference {draft.id}</p>
              <IntakeForm action="cancel_demo" label="Cancel demo" />
            </>
          )}
          {draft.goal !== "demo" && (
            <>
              <p>
                Studio review covers your listing details and ownership. Sign in
                to manage listings you already own.
              </p>
              <Link href="/merchant">Merchant workspace</Link>
            </>
          )}
          {draft.follow_up && (
            <IntakeForm action="opt_out" label="Stop sales follow-up" />
          )}
        </>
      ) : draft.goal === "demo" ? (
        <>
          <h2>Choose a demo time</h2>
          {draft.slots.length ? (
            <IntakeForm action="submit" label="Confirm demo">
              <label>
                Philippine time
                <NativeSelect name="slot" required>
                  {draft.slots.map((slot) => (
                    <option value={slot.id} key={slot.id}>
                      {format(slot.starts_at)}
                    </option>
                  ))}
                </NativeSelect>
              </label>
            </IntakeForm>
          ) : (
            <p>All studio times are currently booked.</p>
          )}
        </>
      ) : (
        <>
          <h2>Check the directory</h2>
          <form
            className="grid min-w-0 gap-4 [&>label]:grid [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium [&>[data-slot=button]]:justify-self-start"
            action="/intake"
          >
            <label>
              Search for the business
              <Input
                name="q"
                defaultValue={query.q || draft.business}
                required
              />
            </label>
            <Button variant="outline">Find listings</Button>
          </form>
          {searchResults.map((branch) => (
            <p key={branch.slug}>
              <Link href={"/businesses/" + branch.slug}>
                {branch.name} · {branch.barangay || branch.city}
              </Link>
            </p>
          ))}
          {draft.goal === "claim" ? (
            searchResults.length > 0 && (
              <IntakeForm action="submit" label="Request ownership review">
                <label>
                  Choose your listing
                  <NativeSelect name="branch" required>
                    {searchResults.map((branch) => (
                      <option value={branch.slug} key={branch.slug}>
                        {branch.name} · {branch.barangay || branch.city}
                      </option>
                    ))}
                  </NativeSelect>
                </label>
              </IntakeForm>
            )
          ) : (
            <IntakeForm action="submit" label="Submit for listing review">
              <label>
                Category
                <NativeSelect name="category">
                  <option value="sari-sari">Small store</option>
                  <option value="restaurant">Food and dining</option>
                  <option value="repair">Electronics</option>
                </NativeSelect>
              </label>
              <label>
                Barangay
                <Input name="barangay" required maxLength={80} />
              </label>
              <label>
                Public landmark or approximate area
                <Input name="landmark" maxLength={160} />
              </label>
              <label>
                Opening hours
                <Input name="hours" maxLength={160} />
              </label>
              <label>
                What you offer
                <Textarea name="description" maxLength={1500} />
              </label>
            </IntakeForm>
          )}
        </>
      )}
      {draft && (
        <div className="mt-4 border-t pt-4">
          <IntakeForm action="new" label="Start another signup" />
        </div>
      )}
    </>
  );

  if (claiming) {
    const step = draft?.submitted
      ? "Review requested"
      : draft?.verified
        ? "Choose your listing"
        : draft
          ? "Verify contact"
          : "Contact details";
    return (
      <MerchantFrame back={{ href: "/merchant", label: "Merchant workspace" }}>
        <div className="grid overflow-hidden rounded-2xl border bg-card lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid content-start justify-items-start gap-5 p-5 sm:p-8 lg:p-9 [&_form]:w-full [&>h2]:text-xl [&>h2]:font-semibold">
            <MerchantHeading title="Claim your listing">
              <p>
                Verify your contact and select the business you own. The studio
                reviews ownership separately.
              </p>
            </MerchantHeading>
            <ol
              className="flex flex-wrap gap-2 [&>li]:rounded-md [&>li]:bg-muted [&>li]:px-2.5 [&>li]:py-1.5 [&>li]:text-xs [&>li]:text-muted-foreground [&>li[aria-current]]:bg-accent [&>li[aria-current]]:font-semibold [&>li[aria-current]]:text-primary"
              aria-label="Claim progress"
            >
              {[
                "Contact details",
                "Verify contact",
                "Choose your listing",
                "Review requested",
              ].map((label) => (
                <li
                  key={label}
                  aria-current={label === step ? "step" : undefined}
                >
                  {label}
                </li>
              ))}
            </ol>
            {content}
          </div>
          <AccessIllustration />
        </div>
      </MerchantFrame>
    );
  }
  return (
    <section className="mx-auto w-full max-w-7xl px-5 sm:px-8 grid max-w-2xl gap-5 py-12 [&>h1]:text-4xl [&>h1]:font-semibold [&>h1]:tracking-tight [&>h2]:text-xl [&>h2]:font-semibold [&>p]:text-muted-foreground [&>a]:text-sm [&>a]:text-primary [&>p>a]:text-primary [&>p>a:hover]:underline">
      <Link href="/">← kanto62</Link>
      <h1>
        {(draft?.goal || goal) === "demo"
          ? "Book a studio demo"
          : "Business signup"}
      </h1>
      {content}
    </section>
  );
}
function Channel() {
  return (
    <>
      <label>
        Verify by
        <NativeSelect name="channel">
          <option value="email">Email</option>
          <option value="phone">Philippine mobile number</option>
        </NativeSelect>
      </label>
      <label>
        Email or mobile number
        <Input name="destination" required maxLength={254} />
      </label>
    </>
  );
}
