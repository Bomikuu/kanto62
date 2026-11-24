import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SourceCredit } from "@/components/source-credit";
import type { Metadata } from "next";
import Link from "next/link";
import { PendingPublicLink } from "@/components/pending-public-link";
import Image from "next/image";
import {
  ArrowUpRight,
  ChefHat,
  Cpu,
  Store,
  MapPin,
  Search,
  SlidersHorizontal,
  Map as MapIcon,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { notFound } from "next/navigation";
import { type Business } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Explorer } from "./map";
const categoryIcons = { restaurant: ChefHat, repair: Cpu, "sari-sari": Store };

export const metadata: Metadata = {
  title: "Davao City business directory",
  alternates: { canonical: "/directory" },
};
type Query = {
  q?: string;
  category?: string;
  view?: string;
  page?: string;
  barangay?: string;
  selected?: string;
  bbox?: string;
};
export default async function Directory({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const {
    q = "",
    category = "",
    view = "list",
    page = "1",
    barangay = "",
    selected = "",
    bbox = "",
  } = await searchParams;
  const params = new URLSearchParams({ q, category, barangay });
  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
  const { results, count, next } = await api<{
    results: Business[];
    count: number;
    next: string | null;
  }>(
    "/businesses/?" + params + "&page=" + (view === "map" ? 1 : pageNumber),
  ).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  const href = (changes: Record<string, string>) =>
    "/directory?" +
    new URLSearchParams({
      q,
      category,
      barangay,
      view,
      ...(selected ? { selected } : {}),
      ...(bbox ? { bbox } : {}),
      ...changes,
    });
  const map = view === "map";
  const controls = (
    <>
      <form
        className="flex items-center gap-2 [&>svg]:hidden [&>svg]:shrink-0 [&>svg]:text-muted-foreground sm:[&>svg]:block"
        action="/directory"
      >
        <Search size={21} />
        <Input
          name="q"
          aria-label="Search businesses"
          defaultValue={q}
          placeholder="Shop, service, or area"
        />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="view" value={view} />
        <input type="hidden" name="barangay" value={barangay} />
        <Button>Search</Button>
      </form>
      <details className="[&>summary]:flex [&>summary]:w-fit [&>summary]:cursor-pointer [&>summary]:items-center [&>summary]:gap-2 [&>summary]:rounded-lg [&>summary]:px-2 [&>summary]:py-1.5 [&>summary]:text-sm [&>summary]:font-medium [&>summary]:text-muted-foreground hover:[&>summary]:bg-muted">
        <summary>
          <SlidersHorizontal size={15} aria-hidden="true" /> Filter by barangay
        </summary>
        <form
          className="mt-2 flex items-end gap-2 [&>label]:grid [&>label]:min-w-0 [&>label]:gap-1 [&>label]:text-sm"
          action="/directory"
        >
          <label>
            Barangay{" "}
            <Input name="barangay" defaultValue={barangay} maxLength={80} />
          </label>
          <input type="hidden" name="q" value={q} />
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="view" value={view} />
          <Button variant="outline">Filter area</Button>
        </form>
      </details>
      <div className="flex flex-wrap items-center gap-2 [&>a]:inline-flex [&>a]:items-center [&>a]:rounded-lg [&>a]:border [&>a]:bg-card [&>a]:px-3 [&>a]:py-1.5 [&>a]:text-sm [&>a]:font-medium hover:[&>a]:bg-muted [&>a[aria-current]]:border-primary/25 [&>a[aria-current]]:bg-accent [&>a[aria-current]]:text-primary">
        {[
          ["", "All businesses"],
          ["restaurant", "Food & dining"],
          ["repair", "Electronics"],
          ["sari-sari", "Small stores"],
        ].map(([id, label]) => (
          <Link
            aria-current={id === category ? "true" : undefined}
            key={id}
            href={href({ category: id })}
          >
            {label}
          </Link>
        ))}
      </div>
    </>
  );
  if (map) {
    const bounds = bbox.split(",").map(Number);
    const valid =
      bounds.length === 4 &&
      -180 <= bounds[0] &&
      bounds[0] < bounds[2] &&
      bounds[2] <= 180 &&
      -90 <= bounds[1] &&
      bounds[1] < bounds[3] &&
      bounds[3] <= 90;
    const points = await api<{ results: Business[] }>("/map/?" + params);
    const initialBounds = valid
      ? (bounds as [number, number, number, number])
      : undefined;

    return (
      <Explorer
        key={params.toString()}
        businesses={points.results}
        initialBounds={initialBounds}
        initialSelected={selected}
        listHref={href({ view: "list" })}
        controls={
          <>
            <form
              className="flex items-center gap-2 rounded-lg border border-input bg-background p-1 pl-2 focus-within:ring-2 focus-within:ring-ring/45 [&>svg]:shrink-0 [&>svg]:text-muted-foreground [&>input]:min-w-0 [&>input]:flex-1 [&>input]:border-0 [&>input]:bg-transparent [&>input]:shadow-none [&>input]:focus-visible:ring-0"
              action="/directory"
            >
              <Search size={18} aria-hidden="true" />
              <Input
                name="q"
                aria-label="Search businesses"
                placeholder="Find a shop or service"
                defaultValue={q}
                maxLength={120}
              />
              <input type="hidden" name="view" value="map" />
              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="barangay" value={barangay} />
              <Button>Search</Button>
            </form>
            <div
              className="flex flex-wrap gap-1 [&>a]:rounded-md [&>a]:px-2 [&>a]:py-1 [&>a]:text-xs [&>a]:font-medium hover:[&>a]:bg-muted [&>a[aria-current]]:bg-accent [&>a[aria-current]]:text-primary"
              aria-label="Filter by category"
            >
              {[
                ["", "All"],
                ["restaurant", "Food & dining"],
                ["repair", "Electronics"],
                ["sari-sari", "Small stores"],
              ].map(([id, label]) => (
                <Link
                  key={id}
                  aria-current={id === category ? "true" : undefined}
                  href={href({ category: id, selected: "" })}
                  prefetch={false}
                >
                  {label}
                </Link>
              ))}
            </div>
            <details
              className="[&>summary]:flex [&>summary]:w-fit [&>summary]:cursor-pointer [&>summary]:items-center [&>summary]:gap-1.5 [&>summary]:rounded-md [&>summary]:px-1.5 [&>summary]:py-1 [&>summary]:text-xs [&>summary]:text-muted-foreground hover:[&>summary]:bg-muted [&>form]:mt-2 [&>form]:flex [&>form]:gap-2"
              open={barangay ? true : undefined}
            >
              <summary>
                <SlidersHorizontal size={15} aria-hidden="true" />{" "}
                {barangay || "Filter by barangay"}
              </summary>
              <form action="/directory">
                <label className="sr-only" htmlFor="atlas-barangay">
                  Barangay
                </label>
                <Input
                  id="atlas-barangay"
                  name="barangay"
                  defaultValue={barangay}
                  maxLength={80}
                  placeholder="Barangay"
                />
                <input type="hidden" name="view" value="map" />
                <input type="hidden" name="q" value={q} />
                <input type="hidden" name="category" value={category} />
                <Button variant="outline">Apply</Button>
              </form>
            </details>
          </>
        }
      />
    );
  }
  return (
    <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
      <section className="grid gap-6 py-8 sm:gap-7 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight sm:[&_h1]:text-5xl [&_p]:mt-2 [&_p]:text-muted-foreground">
          <div>
            <h1>Neighborhood directory</h1>
            <p>Find an eatery, repair shop, or sari-sari store in Davao.</p>
          </div>
          <Button asChild variant="outline" className="lg:hidden">
            <Link href={href({ view: "map" })}>
              <MapIcon aria-hidden="true" /> Map view
            </Link>
          </Button>
        </div>
        <Card className="gap-3 rounded-xl bg-muted/45 px-4 py-4 sm:px-5">
          {controls}
        </Card>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="grid min-w-0 gap-4">
            <div className="flex items-center justify-between gap-3 border-b pb-3 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:tracking-tight [&>span]:text-sm [&>span]:text-muted-foreground">
              <h2>{q ? "Search results" : "Businesses"}</h2>
              <span>
                {new Intl.NumberFormat("en-PH").format(count)}{" "}
                {count === 1 ? "result" : "results"}
              </span>
            </div>
            {results.length > 0 && (
              <Card className="overflow-hidden [&_ul]:divide-y [&_a]:grid [&_a]:min-h-18 [&_a]:grid-cols-[auto_minmax(0,1fr)_auto] [&_a]:items-center [&_a]:gap-3 [&_a]:px-3 [&_a]:py-3 hover:[&_a]:bg-muted/55 sm:[&_a]:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:[&_a]:gap-4 sm:[&_a]:px-5 [&_h3]:font-semibold [&_p]:mt-1 [&_p]:flex [&_p]:items-center [&_p]:gap-1 [&_p]:text-sm [&_p]:text-muted-foreground gap-0 py-0">
                <ul>
                  {results.map((item) => {
                    const Icon = categoryIcons[item.category] ?? MapPin;
                    return (
                      <li key={item.slug}>
                        <PendingPublicLink
                          href={"/businesses/" + item.slug}
                          loadingLabel="Loading business details"
                        >
                          <span
                            className="inline-grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-primary"
                            data-category={item.category}
                          >
                            <Icon size={18} aria-hidden="true" />
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <h3>{item.name}</h3>
                              {item.is_fixture && (
                                <Badge variant="outline">Sample listing</Badge>
                              )}
                            </div>
                            <p>
                              <MapPin size={14} aria-hidden="true" />
                              {[item.barangay, item.city]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="hidden sm:inline-flex"
                          >
                            {item.category_label}
                          </Badge>
                          <ArrowUpRight
                            className="text-primary"
                            size={17}
                            aria-hidden="true"
                          />
                        </PendingPublicLink>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
            {(pageNumber > 1 || next) && (
              <nav
                className="flex flex-wrap items-center gap-3 text-sm text-primary [&>a:hover]:underline"
                aria-label="Directory pages"
              >
                {pageNumber > 1 && (
                  <Link href={href({ page: String(pageNumber - 1) })}>
                    Previous page
                  </Link>
                )}
                {next && (
                  <Link href={href({ page: String(pageNumber + 1) })}>
                    Next page
                  </Link>
                )}
              </nav>
            )}
            <SourceCredit />
            {!count && (
              <Card className="grid justify-items-start gap-2 p-5 [&_h3]:text-lg [&_h3]:font-semibold [&_a]:text-sm [&_a]:text-primary [&_a:hover]:underline">
                <h3>No matching businesses</h3>
                <Link href="/directory">Clear search and filters</Link>
              </Card>
            )}
          </div>
          <aside className="hidden lg:block">
            <Card className="overflow-hidden gap-0 py-0">
              <div className="relative aspect-[1.6] border-b bg-muted">
                <Image
                  src="/maps/davao-hero.webp"
                  alt="Street map of central Davao City"
                  fill
                  sizes="19rem"
                  className="object-cover dark:brightness-75"
                />
              </div>
              <div className="grid justify-items-start gap-3 p-4">
                <p className="text-lg font-semibold tracking-tight">
                  Explore Davao by map
                </p>
                <Button asChild variant="outline">
                  <Link href={href({ view: "map" })}>
                    <MapIcon aria-hidden="true" /> Open map
                  </Link>
                </Button>
                <a
                  href="https://www.openstreetmap.org/copyright"
                  className="text-xs text-muted-foreground hover:underline"
                >
                  © OpenStreetMap contributors
                </a>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}
