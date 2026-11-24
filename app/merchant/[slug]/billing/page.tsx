import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CreditCard, Globe2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MerchantFrame, MerchantHeading } from "@/components/merchant-frame";
import { BillingForm, CopyRecord } from "./form";

export const metadata = {
  title: "Plans and domains",
  robots: { index: false, follow: false },
};

type Invoice = {
  id: string;
  plan: string;
  status: string;
  amount: number;
  checkout_url: string;
  starts: string | null;
  ends: string | null;
};
type Domain = {
  hostname: string;
  state: "active" | "awaiting_https" | "awaiting_dns";
  url: string;
  records: Record<string, { name: string; value: string }>;
};
type Billing = {
  business: string;
  plan: string;
  plans: Record<string, number>;
  paid_until: string | null;
  published: boolean;
  invoices: Invoice[];
  domain: Domain | null;
  target: string;
};
const names: Record<string, string> = {
  listing: "Listing",
  storefront: "Storefront",
  bookings: "Bookings",
};
const terms: Record<string, string> = {
  listing: "A business profile and verified contact details.",
  storefront:
    "Publish your site, accept stock inquiries, and connect your own domain.",
  bookings:
    "Everything in Storefront, plus a calendar and up to 250 confirmed bookings per paid month.",
};
const php = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});
const localDate = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeZone: "Asia/Manila",
});
const money = (n: number) => php.format(n / 100);
const invoiceStatus: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  cancelled: "Cancelled",
  expired: "Expired",
  review: "Needs review",
};

function InvoiceRow({ invoice, slug }: { invoice: Invoice; slug: string }) {
  return (
    <article className="grid gap-3 rounded-lg border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-2 [&_h3]:font-semibold">
        <div>
          <h3>
            {names[invoice.plan]} <span>{money(invoice.amount)}</span>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Invoice {invoice.id}
          </p>
        </div>
        <span
          className="inline-flex w-fit items-center rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground"
          data-state={invoice.status}
        >
          {invoiceStatus[invoice.status] || invoice.status}
        </span>
      </div>
      {invoice.status === "review" && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Pixelflow flagged this payment for studio review.
        </p>
      )}
      {invoice.status === "pending" && (
        <>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Choose cash in Pixelflow. Your plan activates after the sandbox
            collector confirms the amount.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {invoice.checkout_url ? (
              <Button asChild>
                <a href={invoice.checkout_url} referrerPolicy="no-referrer">
                  Continue to Pixelflow{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </Button>
            ) : (
              <BillingForm slug={slug} action="checkout" label="Retry checkout">
                <input type="hidden" name="plan" value={invoice.plan} />
              </BillingForm>
            )}
            <BillingForm slug={slug} action="refresh" label="Check payment">
              <input type="hidden" name="invoice" value={invoice.id} />
            </BillingForm>
            <BillingForm slug={slug} action="cancel" label="Cancel invoice">
              <input type="hidden" name="invoice" value={invoice.id} />
            </BillingForm>
          </div>
        </>
      )}
    </article>
  );
}

function DomainSection({ billing, slug }: { billing: Billing; slug: string }) {
  const attached = billing.domain;
  const local = billing.target.endsWith(".localhost");
  const paid = Boolean(billing.paid_until);
  const label =
    attached &&
    (!paid
      ? "Paused · renew to restore access"
      : {
          active: "HTTPS storefront active",
          awaiting_https: "DNS verified · waiting for HTTPS",
          awaiting_dns: "Waiting for DNS verification",
        }[attached.state]);
  return (
    <section
      className="grid min-w-0 gap-4 rounded-xl border bg-card p-4 sm:p-5 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-tight"
      id="domain"
      aria-labelledby="console-domain-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 [&_h2]:text-xl [&_h2]:font-semibold">
        <Globe2 size={20} strokeWidth={1.65} aria-hidden="true" />
        <h2 id="console-domain-title">Custom domain</h2>
      </div>
      {!paid && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Activate Storefront or Bookings to connect a hostname you own.
        </p>
      )}
      {paid && !attached && (
        <div className="grid gap-3 [&_p]:text-sm">
          <BillingForm
            slug={slug}
            action="connect"
            label="Connect domain"
            primary
          >
            <label>
              Storefront hostname
              <Input
                name="hostname"
                required
                placeholder={
                  local ? "your-shop.shops.localhost" : "www.yourshop.ph"
                }
                autoCapitalize="none"
                spellCheck={false}
              />
            </label>
            {local && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Use a hostname ending in .shops.localhost in the sandbox.
              </p>
            )}
          </BillingForm>
        </div>
      )}
      {attached && (
        <div className="grid gap-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3>{attached.hostname}</h3>
            <span
              className="inline-flex w-fit items-center rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground"
              data-state={paid ? attached.state : "paused"}
            >
              {label}
            </span>
          </div>
          {paid && (
            <>
              <ol
                className="flex flex-wrap gap-2 text-xs [&>li]:rounded-md [&>li]:bg-muted [&>li]:px-2 [&>li]:py-1 [&>li[aria-current]]:bg-accent [&>li[aria-current]]:text-primary"
                aria-label="Domain setup progress"
              >
                <li>
                  <strong>DNS records</strong>
                  <span>
                    {attached.state === "awaiting_dns"
                      ? "Verification required"
                      : "Verified"}
                  </span>
                </li>
                <li>
                  <strong>Storefront</strong>
                  <span>
                    {billing.published ? "Published" : "Publish required"}
                  </span>
                </li>
                <li>
                  <strong>HTTPS</strong>
                  <span>
                    {attached.state === "active"
                      ? "Active"
                      : "Waiting for activation"}
                  </span>
                </li>
              </ol>
              <details
                className="grid gap-3 rounded-lg bg-muted/60 p-3 sm:p-4 [&>summary]:cursor-pointer [&>summary]:font-medium"
                open={attached.state === "awaiting_dns" ? true : undefined}
              >
                <summary>DNS records</summary>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {local
                    ? "Add both records to the sandbox DNS zone, then verify them."
                    : "Add both records at your DNS provider, then verify them here."}
                </p>
                {Object.entries(attached.records).map(([type, record]) => (
                  <div
                    className="grid min-w-0 gap-2 border-t py-3 [&_code]:block [&_code]:break-all [&_code]:text-xs [&_dt]:text-sm [&_dt]:font-medium [&_dd]:text-sm"
                    key={type}
                  >
                    <h4>{type}</h4>
                    <div>
                      <span>Host</span>
                      <CopyRecord
                        value={record.name}
                        label={"Copy " + type + " host"}
                      />
                    </div>
                    <div>
                      <span>Value</span>
                      <CopyRecord
                        value={record.value}
                        label={"Copy " + type + " value"}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-2">
                  {local && attached.hostname.endsWith(".shops.localhost") && (
                    <BillingForm
                      slug={slug}
                      action="pilot_dns"
                      label="Add sandbox DNS records"
                    />
                  )}
                  <BillingForm slug={slug} action="verify" label="Verify DNS" />
                </div>
              </details>
              {attached.state !== "awaiting_dns" && (
                <div className="flex flex-wrap items-center gap-2">
                  {billing.published ? (
                    <Button asChild>
                      <a href={attached.url}>
                        Open HTTPS storefront{" "}
                        <ArrowRight size={16} aria-hidden="true" />
                      </a>
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link href={"/businesses/" + slug + "/manage"}>
                        Publish your storefront to enable HTTPS
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <BillingForm
              slug={slug}
              action="disconnect"
              label="Disconnect domain"
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default async function BillingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let billing: Billing;
  try {
    billing = await api<Billing>(
      "/businesses/" + encodeURIComponent(slug) + "/billing/",
      {},
      true,
    );
  } catch (error) {
    if (!(error instanceof ApiError) || ![401, 403, 404].includes(error.status))
      throw error;
    return (
      <MerchantFrame back={{ href: "/merchant", label: "Merchant workspace" }}>
        <MerchantHeading title="Plans & domains">
          <p>Sign in with the owner account for this business.</p>
        </MerchantHeading>
        <Button asChild>
          <Link href="/merchant">Go to merchant workspace</Link>
        </Button>
      </MerchantFrame>
    );
  }
  const pending = billing.invoices.find(
    (invoice) => invoice.status === "pending",
  );
  const renewable =
    !billing.paid_until ||
    Date.parse(billing.paid_until) - Date.now() <= 7 * 86400000;
  return (
    <MerchantFrame
      context={{ slug, name: billing.business, role: "owner" }}
      current="billing"
      back={{
        href: "/merchant?branch=" + encodeURIComponent(slug),
        label: "Overview",
      }}
    >
      <MerchantHeading title="Plans & domains">
        <p>{billing.business}</p>
      </MerchantHeading>
      <Card className="gap-2 px-4 sm:px-5 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground">
        <CreditCard size={23} strokeWidth={1.65} aria-hidden="true" />
        <div>
          <p>Current plan</p>
          <h2>{names[billing.plan]}</h2>
          <p>
            {billing.paid_until
              ? "Paid through " + localDate.format(new Date(billing.paid_until))
              : "Free directory listing"}
          </p>
        </div>
      </Card>
      <nav
        className="flex flex-wrap gap-3 text-sm text-primary hover:[&_a]:underline"
        aria-label="Plans and domains sections"
      >
        <a href="#plans">Plans</a>
        <a href="#invoices">Invoices</a>
        <a href="#domain">Custom domain</a>
      </nav>
      <section
        className="grid min-w-0 gap-4 rounded-xl border bg-card p-4 sm:p-5 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-tight"
        id="plans"
      >
        <h2>Choose a monthly plan</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sandbox pricing in PHP per business. Paid plans renew manually by
          invoice.
        </p>
        {billing.paid_until && !renewable && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your next renewal invoice opens seven days before the paid term
            ends.
          </p>
        )}
        {pending && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            <a href="#invoices">Resume the pending invoice</a> to finish
            checkout.
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(billing.plans).map(([id, amount]) => (
            <Card
              key={id}
              className="gap-3 p-4 data-[active=true]:ring-primary/50"
              data-current={id === billing.plan}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 [&_h3]:font-semibold">
                <h3>{names[id]}</h3>
                {id === billing.plan && (
                  <span>
                    <BadgeCheck size={16} aria-hidden="true" /> Current
                  </span>
                )}
              </div>
              <p className="text-2xl font-semibold tracking-tight tabular-nums [&>span]:text-sm [&>span]:font-normal [&>span]:text-muted-foreground">
                {money(amount)} <small>/ month</small>
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {terms[id]}
              </p>
              {amount > 0 && !pending && renewable && (
                <BillingForm
                  slug={slug}
                  action="checkout"
                  label={"Choose " + names[id]}
                >
                  <input type="hidden" name="plan" value={id} />
                </BillingForm>
              )}
            </Card>
          ))}
        </div>
      </section>
      <section
        className="grid min-w-0 gap-4 rounded-xl border bg-card p-4 sm:p-5 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-tight"
        id="invoices"
      >
        <h2>Invoices</h2>
        {billing.invoices.length ? (
          billing.invoices.map((invoice) => (
            <InvoiceRow key={invoice.id} invoice={invoice} slug={slug} />
          ))
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No invoices yet.
          </p>
        )}
      </section>
      <DomainSection billing={billing} slug={slug} />
    </MerchantFrame>
  );
}
