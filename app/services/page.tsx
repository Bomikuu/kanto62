import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionEntry } from "@/components/section-entry";
import {
  BrowseServicesButton,
  StudioBanner,
  StudioServiceCards,
} from "@/components/studio-services";
import { catalog } from "@/lib/catalog";

export const metadata = {
  title: "Studio services",
  description:
    "Explore studio tools for storefronts, bookings, payments, automation, and business chat.",
  alternates: { canonical: "/services" },
};

export default async function Services() {
  const { products } = await catalog();

  return (
    <>
      <StudioBanner
        title="Tools for your local business."
        description="Launch a storefront, take bookings and payments, and give your team less manual work."
      >
        <BrowseServicesButton />
        <Button asChild variant="outline">
          <Link href="/#booking">Book a demo</Link>
        </Button>
      </StudioBanner>
      <section
        id="service-offerings"
        data-section-entry
        className="mx-auto max-w-7xl scroll-mt-20 space-y-6 px-5 py-14 motion-safe:data-entered:animate-section-entry sm:px-8 sm:py-20"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What we offer
          </h2>
          <p className="max-w-prose text-muted-foreground">
            Choose the tools that fit how your business works.
          </p>
        </div>
        <StudioServiceCards products={products} />
        <Button asChild variant="outline">
          <Link href="/#pricing">See pricing</Link>
        </Button>
      </section>
      <SectionEntry />
    </>
  );
}
