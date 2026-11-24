import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CircleOff,
  MapPin,
  Search,
} from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductReview, StudioForm } from "./form";
import {
  categories,
  stages,
  type Evidence,
  type Lead,
  type Prospect,
  verifiedDate,
} from "./types";

function location(lead: Evidence) {
  return [categories[lead.category], lead.barangay].filter(Boolean).join(" · ");
}

function Stage({ stage }: { stage: Prospect["stage"] }) {
  return (
    <Badge
      variant="secondary"
      className="shrink-0 bg-accent text-accent-foreground"
      data-stage={stage}
    >
      {stages[stage]}
    </Badge>
  );
}

export function StudioEmpty({
  filtered,
  section,
  listHref,
}: {
  filtered: boolean;
  section: "leads" | "prospects";
  listHref: string;
}) {
  return (
    <div className="grid justify-items-start gap-3 p-5 sm:p-7 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground [&_a]:inline-flex [&_a]:items-center [&_a]:gap-2 [&_a]:text-sm [&_a]:font-semibold [&_a]:text-primary">
      <Search size={22} aria-hidden="true" />
      <h3 className="font-semibold">
        {filtered
          ? "No matches for these filters"
          : section === "prospects"
            ? "No saved prospects yet"
            : "No eligible leads yet"}
      </h3>
      <p>
        {filtered
          ? "Try a different business name or clear the filters."
          : section === "prospects"
            ? "To start your pipeline, review a lead and save a product fit."
            : "Leads appear after a business verifies its request and allows a follow-up."}
      </p>
      {(filtered || section === "prospects") && (
        <Link href={filtered ? listHref : "/studio/leads"}>
          {filtered ? "Clear filters" : "Discover leads"}{" "}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function RecordList({
  items,
  section,
  filters,
  names,
}: {
  items: (Lead | Prospect)[];
  section: "leads" | "prospects";
  filters: URLSearchParams;
  names: Record<string, string>;
}) {
  const saved = section === "prospects";
  const label = saved ? "prospect" : "lead";
  return (
    <section
      className="min-w-0 overflow-hidden rounded-xl border bg-card"
      aria-labelledby="studio-results"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground">
        <h2 id="studio-results">
          {saved ? "Saved prospects" : "Eligible leads"}
        </h2>
        <p className="text-sm tabular-nums text-muted-foreground">
          {items.length} {label}
          {items.length === 1 ? "" : "s"} shown
        </p>
      </div>
      {items.length ? (
        <Table
          className="[&_th]:bg-muted/55 [&_th]:px-3 [&_td]:px-3 [&_td]:py-2.5 sm:[&_th]:px-4 sm:[&_td]:px-4"
          aria-labelledby="studio-results"
        >
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Business</TableHead>
              <TableHead scope="col" className="hidden md:table-cell">
                {saved ? "Product" : "Product fits"}
              </TableHead>
              <TableHead scope="col" className="hidden md:table-cell">
                {saved ? "Stage" : "Verified"}
              </TableHead>
              {saved && (
                <TableHead scope="col" className="hidden md:table-cell">
                  Owner
                </TableHead>
              )}
              <TableHead scope="col" className="w-px text-right">
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const prospect = "evidence" in item ? item : undefined;
              const lead = "evidence" in item ? item.evidence : item;
              const area = location(lead);
              const fits = prospect
                ? [names[prospect.product] ?? prospect.product]
                : (item.recommendations ?? []).map(
                    (match) => names[match.product] ?? match.product,
                  );
              const params = new URLSearchParams(filters);
              params.set("record", String(item.id));
              const href = `/studio/${section}?${params}`;
              return (
                <TableRow key={item.id}>
                  <TableHead scope="row">
                    <Link
                      className="inline-flex max-w-full items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      href={href}
                      prefetch={false}
                    >
                      {lead.business}
                    </Link>
                    {area && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {area}
                      </span>
                    )}
                    {prospect && !lead.contact_allowed && (
                      <span className="mt-0.5 block text-xs text-muted-foreground inline-flex items-center gap-1.5">
                        Follow-up unavailable
                      </span>
                    )}
                    <span className="mt-0.5 block text-xs text-muted-foreground md:hidden">
                      {fits.join(", ") || "No product fit yet"}
                      {prospect && <Stage stage={prospect.stage} />}
                    </span>
                  </TableHead>
                  <TableCell className="hidden md:table-cell">
                    {fits.join(", ") || "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {prospect ? (
                      <Stage stage={prospect.stage} />
                    ) : (
                      verifiedDate(lead.verified)
                    )}
                  </TableCell>
                  {prospect && (
                    <TableCell className="hidden md:table-cell">
                      {prospect.owner}
                    </TableCell>
                  )}
                  <TableCell className="w-px text-right">
                    <ArrowRight size={19} aria-hidden="true" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <StudioEmpty
          filtered={filters.size > 0}
          section={section}
          listHref={`/studio/${section}`}
        />
      )}
    </section>
  );
}

const sources: Record<string, string> = {
  directory: "Directory",
  service: "Service page",
  chatbot: "Chat assistant",
  homepage: "Homepage",
  contact: "Contact page",
};

const goals: Record<string, string> = {
  demo: "Requested a demo",
  claim: "Claim a listing",
  listing: "Add a listing",
};

export function RecordDetail({
  section,
  lead,
  prospect,
  products,
  owners = [],
  back,
}: {
  section: "leads" | "prospects";
  lead: Lead;
  prospect?: Prospect;
  products: Product[];
  owners?: string[];
  back: string;
}) {
  const selected = products.find((product) => product.id === prospect?.product);
  const area = location(lead);
  const fits = prospect ? prospect.recommendations : lead.recommendations;
  return (
    <>
      <Link
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        href={back}
      >
        <ArrowLeft size={17} aria-hidden="true" />
        {section === "prospects" ? "Back to prospects" : "Back to AI leads"}
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight sm:[&_h1]:text-4xl [&_p]:mt-1 [&_p]:text-sm [&_p]:text-muted-foreground justify-start">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-primary">
          <Building2 size={24} aria-hidden="true" />
        </span>
        <div>
          <h1>{lead.business}</h1>
          {(area || selected) && (
            <p>
              {area && (
                <>
                  <MapPin size={15} aria-hidden="true" />
                  {area}
                </>
              )}
              {selected && (
                <span>
                  {area && "· "}
                  {selected.name}
                </span>
              )}
            </p>
          )}
        </div>
        {prospect && <Stage stage={prospect.stage} />}
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-2">
        <section
          className="min-w-0 overflow-hidden rounded-xl border bg-card xl:row-span-2"
          aria-labelledby="business-evidence"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground">
            <h2 id="business-evidence">Business evidence</h2>
          </div>
          <dl className="divide-y px-4 sm:px-5 [&>div]:grid [&>div]:grid-cols-[minmax(5rem,0.4fr)_minmax(0,1fr)] [&>div]:gap-3 [&>div]:py-3 [&_dt]:text-sm [&_dt]:font-medium [&_dd]:break-words [&_dd]:text-sm">
            <div>
              <dt>Contact verified</dt>
              <dd>{verifiedDate(lead.verified)}</dd>
            </div>
            {goals[lead.goal] && (
              <div>
                <dt>Request</dt>
                <dd>{goals[lead.goal]}</dd>
              </div>
            )}
            {lead.referral && (
              <div>
                <dt>Source</dt>
                <dd>{sources[lead.referral] ?? lead.referral}</dd>
              </div>
            )}
            <div>
              <dt>Follow-up</dt>
              <dd
                className={
                  lead.contact_allowed
                    ? "inline-flex items-center gap-1.5 font-medium text-primary"
                    : "inline-flex items-center gap-1.5 text-muted-foreground"
                }
              >
                {lead.contact_allowed ? (
                  <BadgeCheck size={16} aria-hidden="true" />
                ) : (
                  <CircleOff size={16} aria-hidden="true" />
                )}
                {lead.contact_allowed
                  ? "Allowed for this request"
                  : "Unavailable"}
              </dd>
            </div>
          </dl>
          {(lead.branch || lead.contact_allowed) && (
            <div className="flex flex-wrap gap-2 border-t p-4 sm:p-5">
              {lead.branch && (
                <Link href={`/businesses/${lead.branch}`}>
                  View business listing{" "}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              )}
              {lead.contact_allowed && (
                <Link
                  href={`/studio/contacts?${new URLSearchParams({ q: lead.business })}`}
                >
                  Find contact record{" "}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
        </section>
        {lead.contact_allowed ? (
          <ProductReview
            products={products}
            matches={fits ?? []}
            lead={lead.id}
            selectedProduct={prospect?.product}
          />
        ) : (
          <section
            className="min-w-0 overflow-hidden rounded-xl border bg-card"
            aria-labelledby="product-fit"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground">
              <h2 id="product-fit">Product fit</h2>
            </div>
            <div className="grid gap-3 p-4 sm:p-5 [&>h2]:text-lg [&>h2]:font-semibold [&>p]:text-sm">
              <p>Product recommendations are unavailable for this contact.</p>
            </div>
          </section>
        )}
        {prospect && (
          <section
            className="min-w-0 overflow-hidden rounded-xl border bg-card"
            aria-labelledby="follow-up"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground">
              <h2 id="follow-up">Manage prospect</h2>
            </div>
            <div className="grid gap-3 p-4 sm:p-5 [&>h2]:text-lg [&>h2]:font-semibold [&>p]:text-sm">
              {lead.contact_allowed ? (
                <StudioForm section="prospects" label="Save changes" primary>
                  <input type="hidden" name="id" value={prospect.id} />
                  <label>
                    Owner
                    <NativeSelect name="owner" defaultValue={prospect.owner}>
                      {!owners.includes(prospect.owner) && (
                        <option disabled>{prospect.owner}</option>
                      )}
                      {owners.map((owner) => (
                        <option key={owner}>{owner}</option>
                      ))}
                    </NativeSelect>
                  </label>
                  <label>
                    Stage
                    <NativeSelect name="stage" defaultValue={prospect.stage}>
                      {Object.entries(stages).map(([id, name]) => (
                        <option value={id} key={id}>
                          {name}
                        </option>
                      ))}
                    </NativeSelect>
                  </label>
                  <label>
                    Next action
                    <Input
                      name="next_action"
                      defaultValue={prospect.next_action}
                      maxLength={240}
                    />
                  </label>
                  <label>
                    Draft for human review
                    <Textarea
                      name="draft"
                      defaultValue={prospect.draft}
                      maxLength={2000}
                      rows={5}
                    />
                  </label>
                </StudioForm>
              ) : (
                <p>Sales follow-up is unavailable for this contact.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
