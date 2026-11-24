import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";
import { cookies } from "next/headers";
import { WorkspaceShell } from "@/components/workspace-shell";
import { AccessIllustration } from "@/components/merchant-frame";
import { WorkspaceAccount } from "@/components/workspace-account";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Contact,
  ListFilter,
  ScanSearch,
  Search,
  Store,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { catalog, type Product } from "@/lib/catalog";
import { currentSession, pilotEnabled } from "@/lib/oidc";
import { StudioForm } from "../form";
import { RecordDetail, RecordList } from "../records";
import {
  categories,
  sections,
  stages,
  type Lead,
  type Prospect,
  type Section,
  verifiedDate,
} from "../types";

export const metadata = {
  title: "Studio sales workspace",
  robots: { index: false, follow: false },
};

const sectionIcons = {
  prospects: ClipboardList,
  leads: ScanSearch,
  contacts: Contact,
  intakes: Store,
  report: ChartNoAxesColumnIncreasing,
};

const descriptions: Record<Section, string> = {
  prospects: "Track product opportunities and plan your next follow-up.",
  leads: "Review verified business requests and match them to studio products.",
  contacts: "Review the contact and permission attached to each request.",
  intakes: "Review business submissions before they enter the directory.",
  report:
    "See activity across the directory, storefronts, and studio products.",
};

type Data = {
  results?: (Lead | Prospect)[];
  owners?: string[];
  events?: { kind: string; product: string; count: number }[];
  verified_claims?: number;
  paid_subscriptions?: number;
  app_entitlements?: number;
};

const filterNames = [
  "q",
  "category",
  "barangay",
  "product",
  "stage",
  "owner",
] as const;
type Query = Record<string, string | string[] | undefined>;

export default async function StudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Query>;
}) {
  const { section: route } = await params;
  if (!Object.hasOwn(sections, route)) notFound();
  const section = route as Section;
  const query = await searchParams;
  const filters = new URLSearchParams();
  for (const key of filterNames) {
    const value = query[key];
    if (typeof value === "string" && value.trim())
      filters.set(key, value.trim());
  }
  const hasRecords = section === "leads" || section === "prospects";
  const record =
    hasRecords && typeof query.record === "string" ? query.record : "";
  const search = record ? new URLSearchParams({ id: record }) : filters;
  let data: Data;
  try {
    data = await api<Data>(`/studio/${section}/?${search}`, {}, true);
  } catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
      return <StudioSignIn />;
    }
    if (
      record &&
      error instanceof ApiError &&
      [400, 404].includes(error.status)
    ) {
      data = { results: [] };
    } else {
      throw error;
    }
  }
  const { products } = await catalog();
  const names = Object.fromEntries(
    products.map((product) => [product.id, product.name]),
  );
  const records = data.results ?? [];
  const base = `/studio/${section}`;
  const back = filters.size ? `${base}?${filters}` : base;
  const selected = records[0];
  const jar = await cookies();
  const [identity, studioSession] = await Promise.all([
    api<{ username: string | null }>("/auth/session/", {}, true).catch(
      (error) => {
        if (error instanceof ApiError && [401, 403].includes(error.status))
          return null;
        throw error;
      },
    ),
    currentSession(),
  ]);
  const recordTitle =
    record &&
    selected &&
    ("evidence" in selected ? selected.evidence.business : selected.business);
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
      <WorkspaceShell
        title="Studio sales"
        defaultOpen={jar.get("sidebar_state")?.value !== "false"}
        account={
          <WorkspaceAccount
            username={identity?.username ?? null}
            studio={Boolean(studioSession)}
          />
        }
        links={Object.entries(sections).map(([id, label]) => {
          const Icon = sectionIcons[id as Section];
          return {
            href: `/studio/${id}`,
            label,
            active: id === section,
            icon: <Icon size={17} aria-hidden="true" />,
          };
        })}
        breadcrumb={
          <Breadcrumb className="min-w-0" aria-label="Studio breadcrumb">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem className="shrink-0">
                <BreadcrumbLink asChild>
                  <Link href="/studio">Studio sales</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {recordTitle ? (
                <>
                  <BreadcrumbItem className="shrink-0">
                    <BreadcrumbLink asChild>
                      <Link href={back}>{sections[section]}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="min-w-0">
                    <BreadcrumbPage className="truncate">
                      {recordTitle}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>{sections[section]}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        }
      >
        {hasRecords && record ? (
          selected ? (
            <RecordDetail
              key={selected.id}
              section={section}
              lead={"evidence" in selected ? selected.evidence : selected}
              prospect={"evidence" in selected ? selected : undefined}
              products={products}
              owners={data.owners}
              back={back}
            />
          ) : (
            <div className="grid justify-items-start gap-3 p-5 sm:p-7 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground [&_a]:inline-flex [&_a]:items-center [&_a]:gap-2 [&_a]:text-sm [&_a]:font-semibold [&_a]:text-primary min-w-0 overflow-hidden rounded-xl border bg-card">
              <h1>
                {section === "prospects"
                  ? "Prospect unavailable"
                  : "Lead unavailable"}
              </h1>
              <p>This record may have been removed or is no longer eligible.</p>
              <Link href={back}>
                Back to {section === "prospects" ? "prospects" : "AI leads"}{" "}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight sm:[&_h1]:text-4xl [&_p]:mt-1 [&_p]:text-sm [&_p]:text-muted-foreground">
              <div>
                <h1>{sections[section]}</h1>
                <p>{descriptions[section]}</p>
              </div>
              {section === "prospects" && (
                <Button asChild>
                  <Link href="/studio/leads">
                    <ScanSearch size={17} aria-hidden="true" /> Discover leads
                  </Link>
                </Button>
              )}
            </div>
            {section !== "report" && (
              <StudioFilters
                key={back}
                section={section}
                products={products}
                owners={data.owners}
                filters={filters}
              />
            )}
            {hasRecords ? (
              <RecordList
                section={section}
                items={records}
                filters={filters}
                names={names}
              />
            ) : (
              <StudioSupporting section={section} data={data} names={names} />
            )}
          </>
        )}
      </WorkspaceShell>
    </section>
  );
}

function StudioSignIn() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 sm:px-8 py-7 sm:py-9 flex justify-center">
      <div className="grid w-full overflow-hidden rounded-2xl border bg-card lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid min-w-0 content-start justify-items-start gap-5 p-5 sm:p-8 lg:p-10 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_p]:mt-1 [&_p]:text-sm [&_p]:text-muted-foreground [&_form]:w-full">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-primary">
            <ClipboardList size={25} aria-hidden="true" />
          </div>
          <div>
            <h1>Studio sales</h1>
            <p>
              Sign in with a studio sales account to review leads and saved
              prospects.
            </p>
          </div>
          {pilotEnabled() && (
            <StudioForm section="login" label="Sign in to studio sales" primary>
              <label>
                Username
                <Input name="username" autoComplete="username" required />
              </label>
              <label>
                Password
                <Input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </label>
            </StudioForm>
          )}
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            href="/merchant"
          >
            Studio identity sign-in <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <AccessIllustration />
      </div>
    </section>
  );
}

function StudioFilters({
  section,
  products,
  owners,
  filters,
}: {
  section: Exclude<Section, "report">;
  products: Product[];
  owners?: string[];
  filters: URLSearchParams;
}) {
  const productFilter = section === "leads" || section === "prospects";
  const extraFilters = filterNames.some(
    (name) => name !== "q" && filters.has(name),
  );
  return (
    <form
      className="grid min-w-0 gap-4 [&>label]:grid [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium [&>[data-slot=button]]:justify-self-start rounded-xl border bg-card p-4"
      action={`/studio/${section}`}
      aria-label={`Filter ${sections[section]}`}
    >
      <div className="flex items-end gap-2">
        <label className="grid min-w-0 flex-1 gap-1.5 text-sm font-medium [&>span]:text-muted-foreground">
          Search businesses
          <span className="relative">
            <Search
              className="pointer-events-none absolute top-3 left-3 size-4"
              aria-hidden="true"
            />
            <Input
              name="q"
              type="search"
              className="pl-9"
              defaultValue={filters.get("q") ?? ""}
              maxLength={120}
              placeholder="Business name"
            />
          </span>
        </label>
        <Button type="submit">Search</Button>
      </div>
      <details open={extraFilters || undefined} className="group">
        <summary className="inline-flex list-none items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-primary hover:bg-accent">
          <ListFilter size={17} aria-hidden="true" /> Filters
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>label]:grid [&>label]:min-w-0 [&>label]:gap-1.5 [&>label]:text-sm [&>label]:font-medium">
          <label>
            Category
            <NativeSelect
              name="category"
              defaultValue={filters.get("category") ?? ""}
            >
              <option value="">Any category</option>
              {Object.entries(categories).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </NativeSelect>
          </label>
          <label>
            Barangay
            <Input
              name="barangay"
              defaultValue={filters.get("barangay") ?? ""}
              maxLength={80}
            />
          </label>
          {productFilter && (
            <label>
              Product
              <NativeSelect
                name="product"
                defaultValue={filters.get("product") ?? ""}
              >
                <option value="">Any product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </NativeSelect>
            </label>
          )}
          {section === "prospects" && (
            <>
              <label>
                Stage
                <NativeSelect
                  name="stage"
                  defaultValue={filters.get("stage") ?? ""}
                >
                  <option value="">Any stage</option>
                  {Object.entries(stages).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </NativeSelect>
              </label>
              <label>
                Owner
                <NativeSelect
                  name="owner"
                  defaultValue={filters.get("owner") ?? ""}
                >
                  <option value="">Any owner</option>
                  {owners?.map((owner) => (
                    <option key={owner}>{owner}</option>
                  ))}
                </NativeSelect>
              </label>
            </>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 [&>a]:text-sm [&>a]:text-primary [&>a:hover]:underline">
          <Button type="submit" variant="outline">
            Apply filters
          </Button>
          {filters.size > 0 && (
            <Link href={`/studio/${section}`}>Clear filters</Link>
          )}
        </div>
      </details>
    </form>
  );
}

function StudioSupporting({
  section,
  data,
  names,
}: {
  section: "contacts" | "intakes" | "report";
  data: Data;
  names: Record<string, string>;
}) {
  if (section === "report") {
    return (
      <section
        className="min-w-0 overflow-hidden rounded-xl border bg-card"
        aria-label="Sales activity"
      >
        <dl className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 [&>div]:grid [&>div]:gap-1 [&>div]:p-4 [&_dt]:text-sm [&_dt]:text-muted-foreground [&_dd]:text-2xl [&_dd]:font-semibold [&_dd]:tabular-nums">
          <div>
            <dt>Verified ownership grants</dt>
            <dd>{data.verified_claims}</dd>
          </div>
          <div>
            <dt>Paid invoices</dt>
            <dd>{data.paid_subscriptions}</dd>
          </div>
          <div>
            <dt>Active app entitlements</dt>
            <dd>{data.app_entitlements}</dd>
          </div>
        </dl>
        <Table
          className="[&_th]:bg-muted/55 [&_th]:px-3 [&_td]:px-3 [&_td]:py-2.5 sm:[&_th]:px-4 sm:[&_td]:px-4"
          aria-label="Funnel events"
        >
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Event</TableHead>
              <TableHead scope="col">Product</TableHead>
              <TableHead scope="col">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.events?.map((event) => (
              <TableRow key={event.kind + event.product}>
                <TableHead scope="row">
                  {event.kind.replaceAll("_", " ")}
                </TableHead>
                <TableCell>{names[event.product] || "All products"}</TableCell>
                <TableCell>{event.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    );
  }
  const leads = (data.results ?? []) as Lead[];
  if (!leads.length) {
    return (
      <div className="grid justify-items-start gap-3 p-5 sm:p-7 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground [&_a]:inline-flex [&_a]:items-center [&_a]:gap-2 [&_a]:text-sm [&_a]:font-semibold [&_a]:text-primary min-w-0 overflow-hidden rounded-xl border bg-card">
        <Search size={22} aria-hidden="true" />
        <h2>No results for these filters</h2>
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {leads.map((lead) => (
        <article
          className="min-w-0 overflow-hidden rounded-xl border bg-card grid gap-3 p-4 sm:p-5 [&>h2]:text-lg [&>h2]:font-semibold [&>p]:text-sm"
          key={lead.id}
        >
          <h2>{lead.business}</h2>
          <p className="text-muted-foreground">
            <BadgeCheck
              className="mr-1.5 inline size-4 align-text-bottom"
              aria-hidden="true"
            />
            Verified {verifiedDate(lead.verified)}
            {lead.barangay && " · " + lead.barangay}
            {lead.demo && " · Demo booked"}
          </p>
          {lead.branch && (
            <Link href={`/businesses/${lead.branch}`}>
              View business listing
            </Link>
          )}
          {section === "contacts" ? (
            <>
              <p className="wrap-anywhere">
                {lead.name} · {lead.destination} ({lead.channel})
              </p>
              <p>
                {lead.marketing
                  ? "Product updates permitted"
                  : "Follow-up limited to the original request"}
              </p>
              <StudioForm section="contacts" label="Record opt-out">
                <input type="hidden" name="lead" value={lead.id} />
              </StudioForm>
            </>
          ) : (
            <>
              <p>
                {lead.goal === "claim"
                  ? "Ownership evidence required"
                  : lead.reviewed
                    ? "Published after review"
                    : "Pending listing review"}
              </p>
              {lead.goal === "listing" && (
                <p>
                  {[
                    categories[lead.category],
                    lead.landmark,
                    lead.hours,
                    lead.description,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              {lead.goal === "listing" && !lead.reviewed && (
                <StudioForm section="intakes" label="Approve public listing">
                  <input type="hidden" name="lead" value={lead.id} />
                </StudioForm>
              )}
            </>
          )}
        </article>
      ))}
    </div>
  );
}
