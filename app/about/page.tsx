import Link from "next/link";
import { ArrowRight, MapPin, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditorialPage } from "@/components/editorial-page";

export const metadata = {
  title: "About kanto62",
  description:
    "How the kanto62 studio helps neighbors discover Davao businesses and gives merchants tools to manage their listing.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <EditorialPage>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 grid gap-8 py-9 sm:py-12">
        <Card className="grid items-stretch overflow-hidden bg-muted/55 lg:grid-cols-[0.95fr_1.05fr] [&>img]:h-full [&>img]:min-h-55 [&>img]:w-full [&>img]:object-cover gap-0 py-0">
          <div className="grid content-center gap-3 p-6 sm:p-10 [&>h1]:text-4xl [&>h1]:font-semibold [&>h1]:tracking-tight sm:[&>h1]:text-5xl">
            <h1>
              Find your corner of <span>Davao.</span>
            </h1>
            <p className="max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
              kanto62 is a neighborhood directory and merchant workspace from
              PixelsByMiku Studio. Find a place nearby, or help customers find
              your own shop.
            </p>
            <Button asChild>
              <Link href="/directory">
                Explore the directory{" "}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <img
            src="/art/market.jpg"
            alt="Illustrated Davao street with a sari-sari store, an eatery, a repair shop, and a tricycle"
            width={1536}
            height={1024}
            fetchPriority="high"
          />
        </Card>

        <section
          className="grid gap-6 border-t pt-7 [&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold"
          aria-labelledby="about-directory"
        >
          <div>
            <h2 id="about-directory">
              The details that help neighbors find you
            </h2>
            <p className="max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
              A barangay, a public landmark, and up-to-date opening hours help
              people plan a visit. Owners can also publish a storefront and take
              bookings or inquiries.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 [&_[data-slot=card]]:gap-3 [&_p]:text-sm [&_p]:text-muted-foreground">
            <article>
              <MapPin size={23} aria-hidden="true" />
              <div>
                <h3>Put your shop on the map</h3>
                <p>
                  Send your trading name, barangay, and a nearby public landmark
                  for listing review.
                </p>
                <Link
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  href="/intake?goal=listing"
                >
                  Add a business <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </article>
            <article>
              <Store size={23} aria-hidden="true" />
              <div>
                <h3>Keep your listing current</h3>
                <p>
                  Community listings show their source. Request a correction or
                  claim your shop to manage its details after ownership review.
                </p>
                <Link
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  href="/intake?goal=claim"
                >
                  Find your listing <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </article>
          </div>
        </section>
        <section
          id="studio-work"
          aria-labelledby="studio-work-heading"
          className="space-y-4 border-t pt-7"
        >
          <h2 id="studio-work-heading" className="text-2xl font-semibold">
            Studio work and references
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="space-y-2">
                <h3 className="font-semibold">Studio work for Cortico</h3>
                <p className="text-sm text-muted-foreground">
                  936K clicks and 137M impressions in{" "}
                  <a
                    className="text-primary underline"
                    href="/art/cortico-search-console.png"
                  >
                    Cortico’s Search Console report
                  </a>
                  , March 2025 to July 2026.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <figure className="space-y-2 text-sm text-muted-foreground">
                  <blockquote>
                    “Mico took ownership of the frontend experience and
                    translated a complex map-based product into an interface
                    that feels clear and usable.”
                  </blockquote>
                  <figcaption className="font-semibold text-foreground">
                    Bernardita Calinao · CEO, Walkspan
                  </figcaption>
                </figure>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </EditorialPage>
  );
}
