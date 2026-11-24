import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Map as MapIcon,
  MapPin,
  PackageOpen,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicEmpty, ReviewCards } from "@/components/public-feedback";
import { SectionEntry } from "@/components/section-entry";
import { getSampleListing } from "@/lib/sample-listings";
import { SourceCredit } from "@/components/source-credit";
import { StructuredData } from "@/components/structured-data";
import { business } from "@/lib/business";
import { art, primary, type Business } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };
type ListingProps = { listing: Business; root: string };
type OfferingProps = {
  listing: Business;
  heading: string;
  empty: string;
};

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export async function generateMetadata({ params }: Props) {
  const b = await business((await params).slug);
  return {
    title: b.name + " in " + (b.barangay || b.city),
    description: b.description || [b.category_label, b.city].join(" · "),
    ...(b.is_fixture || b.ownership_status !== "claimed"
      ? { robots: { index: false, follow: true } }
      : {}),
    alternates: { canonical: "/businesses/" + b.slug },
  };
}

function Intro({ listing, category }: { listing: Business; category: string }) {
  return (
    <>
      <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
        {listing.name}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-primary">
        <p>
          {category} · {listing.barangay || listing.city}
        </p>
        {listing.is_fixture && <Badge variant="outline">Sample listing</Badge>}
      </div>
      {listing.description && (
        <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
          {listing.description}
        </p>
      )}
    </>
  );
}

function Photo({ listing }: { listing: Business }) {
  return (
    <figure className="relative min-w-0 overflow-hidden rounded-2xl bg-muted [&>img]:aspect-[4/3] [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>figcaption]:bg-card [&>figcaption]:px-3 [&>figcaption]:py-1.5 [&>figcaption]:text-xs [&>figcaption]:text-muted-foreground">
      <img
        src={"/art/" + art[listing.category] + ".jpg"}
        alt=""
        width={724}
        height={724}
      />
      <figcaption>Illustrative photo</figcaption>
    </figure>
  );
}

function VisitDetails({
  listing,
  landmarkFirst = false,
}: {
  listing: Business;
  landmarkFirst?: boolean;
}) {
  const location = [listing.landmark || listing.barangay, listing.city]
    .filter(Boolean)
    .join(", ");
  return (
    <dl className="mt-5 grid gap-3 sm:grid-cols-2 [&>div]:rounded-lg [&>div]:border [&>div]:bg-card [&>div]:p-3 [&_dt]:flex [&_dt]:items-center [&_dt]:gap-2 [&_dt]:text-sm [&_dt]:font-semibold [&_dt>svg]:text-primary [&_dd]:mt-1.5 [&_dd]:text-sm [&_dd]:text-muted-foreground">
      <div className={landmarkFirst ? "border-primary/30" : undefined}>
        <dt>
          <MapPin size={19} strokeWidth={1.65} aria-hidden="true" />
          {landmarkFirst ? "Find the store" : "Location"}
        </dt>
        <dd>{location}</dd>
      </div>
      <div>
        <dt>
          <Clock size={19} strokeWidth={1.65} aria-hidden="true" />
          Opening hours
        </dt>
        <dd>{listing.hours || "Hours unconfirmed"}</dd>
      </div>
    </dl>
  );
}

function CustomerAction({
  listing,
  root,
  jump,
}: ListingProps & { jump: string }) {
  const unavailable = {
    reservation: "Online reservations are currently unavailable.",
    appointment: "Online appointments are currently unavailable.",
    stock_inquiry: "Online stock inquiries are currently unavailable.",
  };
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      {listing.accepting_requests ? (
        <Button asChild className="h-10 px-4">
          <Link href={root + "/book"}>
            {primary[listing.action]}{" "}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          {unavailable[listing.action]}
        </p>
      )}
      {listing.items.length > 0 && (
        <a
          href="#offerings"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          {jump} <ArrowRight size={16} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

function Offerings({ listing, heading, empty }: OfferingProps) {
  const sample = getSampleListing(listing.slug, listing.is_fixture);
  const itemImages: Record<string, string> = sample?.itemImages ?? {};

  return (
    <section
      id="offerings"
      data-section-entry
      className="scroll-mt-24 space-y-4 motion-safe:data-entered:animate-section-entry"
      aria-labelledby="offerings-heading"
    >
      <div className="space-y-1">
        <h2
          id="offerings-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {heading}
        </h2>
        {sample && (
          <p className="text-sm text-muted-foreground">
            Sample offerings with illustrative photos.
          </p>
        )}
      </div>
      {listing.items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listing.items.map((item) => {
            const image = Object.hasOwn(itemImages, item.name)
              ? itemImages[item.name]
              : undefined;
            return (
              <li key={item.name}>
                <Card className="h-full gap-0 py-0 hover:ring-primary/40 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1">
                  {image && (
                    <div className="relative aspect-[1.6] overflow-hidden bg-muted">
                      <Image
                        src={`/art/listings/${image}.webp`}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/card:scale-105"
                      />
                    </div>
                  )}
                  <CardContent className="grid flex-1 content-start gap-2 p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">
                        {item.name}
                      </h3>
                      <p
                        className={
                          item.price_php == null
                            ? "text-xs text-muted-foreground"
                            : "font-semibold tabular-nums text-primary"
                        }
                      >
                        {item.price_php == null
                          ? "Price on request"
                          : currency.format(Number(item.price_php))}
                      </p>
                    </div>
                    {item.detail && (
                      <p className="text-sm text-muted-foreground">
                        {item.detail}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : (
        <PublicEmpty
          title="Nothing listed yet"
          icon={<PackageOpen size={20} aria-hidden="true" />}
        >
          {empty}
        </PublicEmpty>
      )}
    </section>
  );
}

function ListingReviews({ listing }: { listing: Business }) {
  const sample = getSampleListing(listing.slug, listing.is_fixture);

  return (
    <section
      aria-labelledby="listing-reviews"
      data-section-entry
      className="space-y-4 motion-safe:data-entered:animate-section-entry"
    >
      <div className="space-y-1">
        <h2
          id="listing-reviews"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Reviews
        </h2>
        {sample && (
          <p className="text-sm text-muted-foreground">
            Sample reviews and ratings for this fictional listing.
          </p>
        )}
      </div>
      {sample ? (
        <ReviewCards reviews={sample.reviews} />
      ) : (
        <PublicEmpty title="No reviews to show">
          There are no reviews available for this listing.
        </PublicEmpty>
      )}
    </section>
  );
}

function Dining({ listing, root }: ListingProps) {
  return (
    <>
      <div className="grid items-center gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <div className="py-3">
          <Intro listing={listing} category="Food & dining" />
          <VisitDetails listing={listing} />
          <CustomerAction listing={listing} root={root} jump="View menu" />
        </div>
        <Photo listing={listing} />
      </div>
      <Offerings
        listing={listing}
        heading="On the menu"
        empty="Menu details haven’t been added."
      />
    </>
  );
}

function Electronics({ listing, root }: ListingProps) {
  const appointment = listing.action === "appointment";
  return (
    <>
      <div className="grid items-center gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <div>
          <Intro listing={listing} category="Electronics" />
          <CustomerAction
            listing={listing}
            root={root}
            jump="Browse offerings"
          />
        </div>
        <Photo listing={listing} />
      </div>
      <div className="grid items-start gap-7">
        <Offerings
          listing={listing}
          heading={
            appointment && listing.items.length
              ? "Repair services"
              : "Products & services"
          }
          empty="Product and service details haven’t been added."
        />
        <aside
          className="rounded-xl border bg-muted/45 p-5 [&>h2]:text-xl [&>h2]:font-semibold"
          aria-labelledby="shop-visit-heading"
        >
          <h2 id="shop-visit-heading">Visit the shop</h2>
          <VisitDetails listing={listing} />
        </aside>
      </div>
    </>
  );
}

function SmallStore({ listing, root }: ListingProps) {
  return (
    <>
      <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div className="lg:order-last">
          <Intro listing={listing} category="Small store" />
          <VisitDetails listing={listing} landmarkFirst />
          <CustomerAction listing={listing} root={root} jump="Browse items" />
        </div>
        <Photo listing={listing} />
      </div>
      <Offerings
        listing={listing}
        heading="At the counter"
        empty="Stock details haven’t been added."
      />
    </>
  );
}

function ListingOwnership({ listing, root }: ListingProps) {
  const community = Boolean(
    listing.source_url && listing.ownership_status === "unclaimed",
  );
  const claimed = listing.ownership_status === "claimed";
  const claim = "/intake?goal=claim&q=" + encodeURIComponent(listing.name);
  return (
    <aside
      className="flex flex-col items-start justify-between gap-5 rounded-xl border bg-muted/45 p-5 sm:p-6 md:flex-row md:items-center"
      aria-labelledby="ownership-heading"
    >
      <div className="space-y-2 [&>h2]:text-xl [&>h2]:font-semibold [&>p]:text-sm [&>p]:text-muted-foreground">
        <Store size={22} strokeWidth={1.65} aria-hidden="true" />
        <div>
          <h2 id="ownership-heading">
            {community
              ? "Community listing"
              : claimed
                ? "Merchant workspace"
                : "Own this business?"}
          </h2>
          <p>
            {community
              ? "These details come from OpenStreetMap. Current operations and ownership have yet to be confirmed."
              : claimed
                ? "Update the listing, opening hours, and storefront."
                : "Verify ownership to update your listing and publish a storefront."}
          </p>
          {listing.source_url && <SourceCredit source={listing.source_url} />}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {community && (
          <a
            href={listing.source_url}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Suggest a map correction
          </a>
        )}
        <Button asChild variant="outline">
          <Link href={listing.is_fixture || claimed ? root + "/manage" : claim}>
            {community
              ? "Request ownership review"
              : claimed
                ? "Manage storefront"
                : "Claim this business"}
          </Link>
        </Button>
      </div>
    </aside>
  );
}

const templates = {
  restaurant: Dining,
  repair: Electronics,
  "sari-sari": SmallStore,
};

export default async function Storefront({ params }: Props) {
  const listing = await business((await params).slug);
  const root = "/businesses/" + listing.slug;
  const Template = templates[listing.category];
  const mapQuery = new URLSearchParams({
    view: "map",
    selected: listing.slug,
    category: listing.category,
  });

  return (
    <article
      className="mx-auto w-full max-w-7xl px-5 sm:px-8 grid gap-8 py-7 sm:gap-10 sm:py-10"
      data-category={listing.category}
    >
      <nav
        className="flex flex-wrap items-center justify-between gap-3"
        aria-label="Listing navigation"
      >
        <Link
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          href="/directory"
        >
          <ArrowLeft size={17} aria-hidden="true" /> Directory
        </Link>
        {listing.latitude != null && listing.longitude != null && (
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            href={"/directory?" + mapQuery}
          >
            <MapIcon size={17} aria-hidden="true" /> View on map
          </Link>
        )}
      </nav>
      {!listing.is_fixture && listing.ownership_status === "claimed" && (
        <StructuredData
          value={{
            "@context": "https://schema.org",
            "@type":
              listing.category === "restaurant"
                ? "Restaurant"
                : "LocalBusiness",
            name: listing.name,
            description: listing.description,
            areaServed: [listing.barangay, listing.city]
              .filter(Boolean)
              .join(", "),
            url: new URL(
              root,
              process.env.KANTO62_WEB_ORIGIN || "http://localhost:3063",
            ).href,
          }}
        />
      )}
      <Template listing={listing} root={root} />
      <ListingReviews listing={listing} />
      <SectionEntry />
      <ListingOwnership listing={listing} root={root} />
    </article>
  );
}
