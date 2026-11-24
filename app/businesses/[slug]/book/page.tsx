import { Input } from "@/components/ui/input";
import Link from "next/link";
import { randomUUID } from "node:crypto";
import { ArrowLeft, ArrowRight, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { business } from "@/lib/business";
import { api, ApiError } from "@/lib/api";
import {
  art,
  primary,
  manilaDate,
  type Business,
  type Slot,
} from "@/lib/types";
import { GuestRequestForm } from "./guest-request";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; party_size?: string }>;
};
const shortDate = new Intl.DateTimeFormat("en-PH", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Manila",
});
const day = 86400000;

export async function generateMetadata({ params }: Props) {
  const listing = await business((await params).slug);
  return {
    title: primary[listing.action] + " at " + listing.name,
    robots: { index: false, follow: true },
  };
}

function StoreContext({ listing, root }: { listing: Business; root: string }) {
  const landmark = listing.landmark || listing.barangay;
  const diagnostic = listing.action === "appointment";
  const stock = listing.action === "stock_inquiry";
  const contextLink = diagnostic
    ? "View offerings"
    : stock
      ? "View the listing"
      : "View the menu";
  return (
    <aside>
      <Card className="overflow-hidden gap-0 py-0">
        <figure className="relative overflow-hidden bg-muted [&>img]:aspect-[2] [&>img]:w-full [&>img]:object-cover [&>figcaption]:absolute [&>figcaption]:right-2 [&>figcaption]:bottom-2 [&>figcaption]:rounded-md [&>figcaption]:bg-card [&>figcaption]:px-2 [&>figcaption]:py-1 [&>figcaption]:text-xs">
          <img
            src={"/art/" + art[listing.category] + ".jpg"}
            width={724}
            height={724}
            alt=""
          />
          <figcaption>Illustrative photo</figcaption>
        </figure>
        <div className="grid gap-3 p-4 text-sm text-muted-foreground sm:p-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_dt]:font-semibold [&_dt]:text-foreground [&_dl]:grid [&_dl]:gap-2">
          <h2>{stock ? "About the shop" : "Plan your visit"}</h2>
          <dl>
            <div>
              <dt>
                <MapPin size={18} strokeWidth={1.65} aria-hidden="true" />
                {stock ? "Landmark" : "Location"}
              </dt>
              <dd>{[landmark, listing.city].filter(Boolean).join(", ")}</dd>
            </div>
            <div>
              <dt>
                <Clock size={18} strokeWidth={1.65} aria-hidden="true" />
                Opening hours
              </dt>
              <dd>{listing.hours || "Hours unconfirmed"}</dd>
            </div>
          </dl>
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            href={root + (!stock && listing.items.length ? "#offerings" : "")}
          >
            {listing.items.length ? contextLink : "View business listing"}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </Card>
    </aside>
  );
}

export default async function Book({ params, searchParams }: Props) {
  const listing = await business((await params).slug);
  const query = await searchParams;
  const now = Date.now();
  const date = query.date || manilaDate(new Date(now + day));
  const restaurant = listing.action === "reservation";
  const stock = listing.action === "stock_inquiry";
  const size = restaurant ? Math.max(1, Number(query.party_size) || 1) : 1;
  const root = "/businesses/" + listing.slug;
  let slots: Slot[] = [];
  let error = "";

  if (listing.accepting_requests && !stock) {
    try {
      slots = (
        await api<{ slots: Slot[] }>(
          root +
            "/availability/?" +
            new URLSearchParams({ date, party_size: String(size) }),
        )
      ).slots;
    } catch (failure) {
      error =
        failure instanceof ApiError && failure.status < 500
          ? failure.message
          : "Times couldn’t be loaded. Choose Find times to try again.";
    }
  }

  return (
    <div
      className="mx-auto w-full max-w-7xl px-5 sm:px-8 grid max-w-6xl gap-5 py-8 sm:gap-7 sm:py-11"
      data-flow={listing.action}
    >
      <Link
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        href={root}
      >
        <ArrowLeft size={17} aria-hidden="true" /> {listing.name}
      </Link>
      <section className="space-y-2 [&>h1]:text-4xl [&>h1]:font-semibold [&>h1]:tracking-tight sm:[&>h1]:text-5xl [&>p]:text-muted-foreground">
        <h1>{primary[listing.action]}</h1>
        <p>
          {listing.name} · {listing.barangay || listing.city}
        </p>
      </section>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="grid min-w-0 gap-4">
          {!listing.accepting_requests ? (
            <section className="grid justify-items-start gap-2 rounded-xl border bg-card p-5 [&>h2]:text-lg [&>h2]:font-semibold [&>p]:text-sm [&>p]:text-muted-foreground [&>a]:mt-2">
              <h2>
                {stock
                  ? "Stock inquiries unavailable"
                  : "Online booking unavailable"}
              </h2>
              <p>
                {stock
                  ? "This shop is currently unable to take stock inquiries online."
                  : "This business is currently unable to take bookings online."}
              </p>
              <Button asChild variant="outline">
                <Link href={root}>Back to the listing</Link>
              </Button>
            </section>
          ) : (
            <>
              {listing.is_fixture && (
                <p className="rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">
                  Local pilot. Use sample contact details to try this form.
                </p>
              )}
              {!stock && (
                <section
                  className="grid gap-4 rounded-xl border bg-card p-5 [&>h2]:text-xl [&>h2]:font-semibold"
                  aria-labelledby="request-find-title"
                >
                  <h2 id="request-find-title">
                    {restaurant ? "Find a table" : "Find an appointment"}
                  </h2>
                  <form className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] [&>label]:grid [&>label]:min-w-0 [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium [&>[data-slot=button]]:justify-self-start">
                    <label>
                      Visit date
                      <Input
                        type="date"
                        name="date"
                        required
                        min={manilaDate(new Date(now))}
                        max={manilaDate(new Date(now + day * 30))}
                        defaultValue={date}
                      />
                    </label>
                    {restaurant && (
                      <label>
                        Party size
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          name="party_size"
                          required
                          defaultValue={size}
                        />
                      </label>
                    )}
                    <Button variant="outline">Find times</Button>
                  </form>
                </section>
              )}
              {error ? (
                <p
                  className="rounded-lg border p-3 text-sm border-destructive/30 bg-destructive/8 text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              ) : stock || slots.length ? (
                <GuestRequestForm
                  key={date + "-" + size}
                  listing={listing}
                  slots={slots}
                  size={size}
                  visitDate={
                    stock
                      ? undefined
                      : shortDate.format(new Date(slots[0].starts_at))
                  }
                  requestId={randomUUID()}
                />
              ) : (
                <section className="grid justify-items-start gap-2 rounded-xl border bg-card p-5 [&>h2]:text-lg [&>h2]:font-semibold [&>p]:text-sm [&>p]:text-muted-foreground [&>a]:mt-2">
                  <h2>
                    {restaurant
                      ? "No tables available"
                      : "No appointments available"}
                  </h2>
                  <p>
                    {restaurant
                      ? "Try another date or party size to see available times."
                      : "Try another date to see available appointments."}
                  </p>
                </section>
              )}
            </>
          )}
        </div>
        <div className="min-w-0 lg:sticky lg:top-22">
          <StoreContext listing={listing} root={root} />
        </div>
      </div>
    </div>
  );
}
