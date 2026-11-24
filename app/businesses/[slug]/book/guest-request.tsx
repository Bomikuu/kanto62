"use client";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { requestVisit, type Outcome } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { manilaTime, type Business, type Slot } from "@/lib/types";

const initial: Outcome = {};
const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const receiptDate = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

type Props = {
  listing: Business;
  slots: Slot[];
  size: number;
  visitDate?: string;
  requestId: string;
};

export function GuestRequestForm({
  listing,
  slots,
  size,
  visitDate,
  requestId,
}: Props) {
  const stock = listing.action === "stock_inquiry";
  const restaurant = listing.action === "reservation";
  const [state, action, pending] = useActionState(
    requestVisit.bind(null, listing.slug, stock),
    initial,
  );
  const [submissionId] = useState(requestId);
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [slot, setSlot] = useState("");
  const [item, setItem] = useState("");
  const [name, setName] = useState("");
  const [reply, setReply] = useState({ email: "", phone: "" });
  const [quantity, setQuantity] = useState("1");
  const feedback = useRef<HTMLHeadingElement | HTMLParagraphElement>(null);
  const offeredSlots = state.alternatives ?? slots;
  const chosenItem = listing.items.find((entry) => entry.name === item);

  useEffect(() => {
    if (state.error || state.reference) feedback.current?.focus();
  }, [state]);

  if (state.reference) {
    return (
      <section
        className="grid gap-4 rounded-xl border border-primary/25 bg-card p-5 sm:p-7 [&>h2]:text-2xl [&>h2]:font-semibold [&>p]:text-muted-foreground [&>dl]:divide-y [&>dl>div]:grid [&>dl>div]:grid-cols-2 [&>dl>div]:gap-3 [&>dl>div]:py-2 [&_dt]:font-medium [&_dd]:break-words"
        aria-labelledby="request-receipt-title"
      >
        <CheckCircle2 size={27} strokeWidth={1.7} aria-hidden="true" />
        <h2 id="request-receipt-title" tabIndex={-1} ref={feedback}>
          {state.message}
        </h2>
        <p>
          {stock
            ? "Your inquiry asks the shop to confirm stock."
            : listing.name}
        </p>
        <dl>
          {state.startsAt && (
            <div>
              <dt>{restaurant ? "Reservation" : "Diagnostic appointment"}</dt>
              <dd>
                {receiptDate.format(new Date(state.startsAt))} PHT
                {restaurant &&
                  state.partySize != null &&
                  " · Party of " + state.partySize}
              </dd>
            </div>
          )}
          {state.inquiry && (
            <div>
              <dt>Item and quantity</dt>
              <dd>
                {state.inquiry.item} × {state.inquiry.quantity}
              </dd>
            </div>
          )}
          <div>
            <dt>Reference</dt>
            <dd className="font-mono text-sm font-medium text-primary">
              {state.reference}
            </dd>
          </div>
        </dl>
        <Button asChild variant="outline">
          <Link href={"/businesses/" + listing.slug}>Return to storefront</Link>
        </Button>
      </section>
    );
  }

  return (
    <form
      action={action}
      className="grid justify-items-start gap-5 rounded-xl border bg-card p-5 sm:p-6"
      onSubmit={(event) => {
        // Keep controlled selections intact when the server rejects a request.
        event.preventDefault();
        if (pending) return;
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
    >
      <input type="hidden" name="request_id" value={submissionId} />
      <input type="hidden" name="party_size" value={size} />
      <fieldset
        className="grid w-full min-w-0 gap-3 [&>legend]:mb-2 [&>legend]:text-lg [&>legend]:font-semibold [&_label]:grid [&_label]:min-w-0 [&_label]:gap-1.5 [&_label]:text-sm [&_label]:font-medium"
        disabled={pending}
      >
        <legend>
          {stock
            ? "What are you looking for?"
            : restaurant
              ? "Reservation details"
              : "Appointment details"}
        </legend>
        {stock ? (
          <>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(6rem,0.35fr)]">
              <label>
                Item
                {listing.items.length ? (
                  <NativeSelect
                    name="item"
                    required
                    value={item}
                    onChange={(event) => setItem(event.target.value)}
                  >
                    <option value="">Choose an item</option>
                    {listing.items.map((entry) => (
                      <option key={entry.name}>{entry.name}</option>
                    ))}
                  </NativeSelect>
                ) : (
                  <Input
                    name="item"
                    required
                    maxLength={120}
                    value={item}
                    onChange={(event) => setItem(event.target.value)}
                  />
                )}
              </label>
              <label>
                Quantity
                <Input
                  type="number"
                  min="1"
                  max="100"
                  required
                  name="quantity"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </label>
            </div>
            {chosenItem && (
              <p
                className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
                aria-live="polite"
              >
                {chosenItem.detail}
                {chosenItem.detail && chosenItem.price_php != null && " · "}
                {chosenItem.price_php != null &&
                  currency.format(Number(chosenItem.price_php))}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
              {visitDate}
              {restaurant && " · Party of " + size}
            </p>
            {offeredSlots.length ? (
              <label>
                <span>
                  Available time{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (Philippine time)
                  </span>
                </span>
                <NativeSelect
                  name="slot_id"
                  required
                  value={
                    offeredSlots.some((entry) => entry.id === slot) ? slot : ""
                  }
                  onChange={(event) => setSlot(event.target.value)}
                >
                  <option value="">Select a time</option>
                  {offeredSlots.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {manilaTime(entry.starts_at)}
                      {restaurant
                        ? " · " + entry.remaining + " seats available"
                        : ""}
                    </option>
                  ))}
                </NativeSelect>
              </label>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Choose another date or refresh availability using Find times.
              </p>
            )}
          </>
        )}
      </fieldset>
      <fieldset
        className="grid w-full min-w-0 gap-3 [&>legend]:mb-2 [&>legend]:text-lg [&>legend]:font-semibold [&_label]:grid [&_label]:min-w-0 [&_label]:gap-1.5 [&_label]:text-sm [&_label]:font-medium"
        disabled={pending}
      >
        <legend>
          {stock ? "How should the shop reply?" : "Your contact details"}
        </legend>
        <label>
          Your name
          <Input
            name="guest_name"
            required
            maxLength={120}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            Reply by
            <NativeSelect
              name="reply_channel"
              value={channel}
              onChange={(event) =>
                setChannel(event.target.value === "phone" ? "phone" : "email")
              }
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </NativeSelect>
          </label>
          <label>
            {channel === "email" ? "Email address" : "Phone number"}
            <Input
              name="reply_to"
              type={channel === "email" ? "email" : "tel"}
              autoComplete={channel === "email" ? "email" : "tel"}
              required
              maxLength={254}
              value={reply[channel]}
              onChange={(event) =>
                setReply({ ...reply, [channel]: event.target.value })
              }
            />
          </label>
        </div>
      </fieldset>
      {state.error && (
        <p
          className="rounded-lg border p-3 text-sm border-destructive/30 bg-destructive/8 text-destructive"
          role="alert"
          tabIndex={-1}
          ref={feedback}
        >
          {state.error}
        </p>
      )}
      <Button disabled={pending || (!stock && !offeredSlots.length)}>
        {pending
          ? stock
            ? "Sending inquiry…"
            : "Confirming…"
          : stock
            ? "Send stock inquiry"
            : "Confirm booking"}
        <ArrowRight size={17} aria-hidden="true" />
      </Button>
    </form>
  );
}
