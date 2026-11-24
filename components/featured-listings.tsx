import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Store } from "lucide-react";
import { api } from "@/lib/api";
import { getSampleListing } from "@/lib/sample-listings";
import type { Business } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PendingPublicLink } from "@/components/pending-public-link";
import { PublicEmpty, Stars } from "@/components/public-feedback";
import { FeaturedRail } from "@/components/featured-rail";

const featuredSlugs = [
  "salo-salo-inasal",
  "coffee-at-yellow-hauz-osm-370965013",
  "tindahan-ni-nena",
  "circuito-repair-lab",
];

export async function FeaturedListings() {
  const results = await Promise.allSettled(
    featuredSlugs.map((slug) =>
      api<Business>(`/businesses/${slug}/`, {
        signal: AbortSignal.timeout(2200),
      }),
    ),
  );
  const listings = results.flatMap((result) => {
    if (result.status !== "fulfilled" || !result.value) return [];
    const listing = result.value;
    return [
      { listing, sample: getSampleListing(listing.slug, listing.is_fixture) },
    ];
  });

  if (listings.length === 0) {
    return (
      <PublicEmpty
        title="Featured places will appear here"
        icon={<Store size={20} aria-hidden="true" />}
      >
        <Link className="text-primary underline" href="/directory">
          Browse the directory
        </Link>{" "}
        for nearby businesses.
      </PublicEmpty>
    );
  }

  return (
    <FeaturedRail>
      {listings.map(({ listing, sample }) => (
        <li key={listing.slug} className="min-w-0">
          <Card className="h-full gap-0 bg-card py-0 shadow-sm hover:ring-primary/35">
            <PendingPublicLink
              loadingLabel="Loading business details"
              href={`/businesses/${listing.slug}`}
              className="group flex h-full flex-col focus-visible:outline-offset-[-3px]"
            >
              <div className="relative aspect-[2] overflow-hidden bg-muted">
                <Image
                  src={sample?.image ?? "/art/featured-coffee.webp"}
                  alt={sample ? "" : "Illustrative photo of a cup of coffee"}
                  fill
                  sizes="(min-width: 768px) 25vw, 82vw"
                  className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1 px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[0.85rem] leading-tight font-bold">
                    {listing.name}
                  </h3>
                  <ArrowUpRight
                    size={15}
                    className="shrink-0 text-primary"
                    aria-hidden="true"
                  />
                </div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={13} className="shrink-0" aria-hidden="true" />
                  {listing.category_label} · {listing.barangay || listing.city}
                </p>
                <div className="mt-auto flex min-h-5 flex-wrap items-center gap-1.5 text-[0.67rem] text-muted-foreground">
                  {sample ? (
                    <>
                      <Stars rating={sample.reviews[0].stars} compact />
                      <span>Sample review</span>
                    </>
                  ) : (
                    <Badge variant="secondary">Directory listing</Badge>
                  )}
                </div>
              </div>
            </PendingPublicLink>
          </Card>
        </li>
      ))}
    </FeaturedRail>
  );
}
