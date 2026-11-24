import Image from "next/image";
import { PendingPublicLink } from "@/components/pending-public-link";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  PanelsTopLeft,
  Workflow,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Product } from "@/lib/catalog";
import { studioGroups } from "@/lib/studio-services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const icons = {
  online: PanelsTopLeft,
  operations: CalendarDays,
  automation: Workflow,
};

const overviewArtwork = {
  src: "/art/studio-counter.webp",
  alt: "Illustration of a merchant using a booking tablet at a neighborhood storefront",
};

export function StudioBanner({
  title,
  description,
  children,
  artwork = overviewArtwork,
}: {
  title: string;
  description: string;
  children: ReactNode;
  artwork?: { src: string; alt: string };
}) {
  return (
    <section className="flex min-h-[calc(100svh-4rem)] items-center border-b bg-accent/60">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="space-y-5">
          <h1 className="max-w-xl text-5xl leading-[1.03] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="flex flex-wrap gap-3">{children}</div>
        </div>
        <div
          className={`relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-accent ${artwork === overviewArtwork ? "aspect-[4/3]" : "aspect-[3/2]"}`}
        >
          <Image
            src={artwork.src}
            alt={artwork.alt}
            fill
            preload
            sizes="(min-width: 1024px) 50vw, 90vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export function StudioServiceCards({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {studioGroups.map(({ id, title, description, products: ids }) => {
        const Icon = icons[id];
        const offerings = ids.flatMap(
          (id) => products.find((product) => product.id === id) ?? [],
        );

        return (
          <Card
            key={id}
            className="h-full border border-transparent py-0 transition-colors hover:border-primary/40 focus-within:border-primary/40 motion-safe:transition-[transform,border-color,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-1 hover:shadow-md"
          >
            <CardContent className="flex h-full flex-col gap-4 p-5 sm:p-6">
              <span className="grid size-11 place-items-center rounded-lg bg-accent text-primary">
                <Icon size={21} aria-hidden="true" />
              </span>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
              <ul className="mt-auto grid divide-y border-t pt-1">
                {offerings.length ? (
                  offerings.map((product) => (
                    <li key={product.id}>
                      <PendingPublicLink
                        loadingLabel="Loading service details"
                        href={`/services/${product.id}`}
                        className="flex min-h-11 items-center justify-between gap-2 rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {product.name}{" "}
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </PendingPublicLink>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-sm text-muted-foreground">
                    Services will appear here when available.
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function BrowseServicesButton() {
  return (
    <Button asChild>
      <a href="#service-offerings">
        Explore services <ArrowDown aria-hidden="true" />
      </a>
    </Button>
  );
}
