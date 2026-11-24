import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeInfo } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionEntry } from "@/components/section-entry";
import { StudioBanner } from "@/components/studio-services";
import { catalog, demoLink } from "@/lib/catalog";
import { capabilities, serviceArtwork } from "@/lib/studio-services";

type Props = { params: Promise<{ slug: string }> };

async function service({ params }: Props) {
  const { slug } = await params;
  const { products } = await catalog();
  const item = products.find((product) => product.id === slug);
  if (!item) notFound();
  return { item, products };
}

export async function generateMetadata(props: Props) {
  const { item } = await service(props);
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: "/services/" + item.id },
  };
}

export default async function ServicePage(props: Props) {
  const { item, products } = await service(props);
  const features = capabilities[item.id] ?? [];
  return (
    <>
      <StudioBanner
        title={item.name}
        description={item.description}
        artwork={serviceArtwork[item.id]}
      >
        <Button asChild>
          <Link href={demoLink(item.id)}>
            Book a demo <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/services">All services</Link>
        </Button>
      </StudioBanner>
      <div className="mx-auto max-w-7xl space-y-12 px-5 py-14 sm:px-8">
        {features.length > 0 && (
          <section
            aria-labelledby="service-capabilities"
            data-section-entry
            className="space-y-5 motion-safe:data-entered:animate-section-entry"
          >
            <h2
              id="service-capabilities"
              className="text-3xl font-semibold tracking-tight"
            >
              What you can do
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {features.map(([title, description]) => (
                <Card
                  key={title}
                  className="py-0 hover:ring-primary/40 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1"
                >
                  <CardContent className="space-y-2 p-6">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
        <section
          aria-labelledby="service-example"
          data-section-entry
          className="space-y-3 rounded-xl border bg-muted/50 p-6 motion-safe:data-entered:animate-section-entry"
        >
          <h2 id="service-example" className="text-2xl font-semibold">
            How it works in practice
          </h2>
          <p className="max-w-prose text-muted-foreground">{item.example}</p>
          <p className="flex items-start gap-2 text-sm font-medium">
            <BadgeInfo
              size={17}
              className="shrink-0 text-primary"
              aria-hidden="true"
            />{" "}
            {item.status}
          </p>
          <Button asChild variant="outline">
            <Link href="/#pricing">See pricing</Link>
          </Button>
        </section>
        <aside aria-labelledby="related-services" className="space-y-3">
          <h2 id="related-services" className="text-xl font-semibold">
            More studio services
          </h2>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {products
              .filter((product) => product.id !== item.id)
              .map((product) => (
                <li key={product.id}>
                  <Link
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    href={`/services/${product.id}`}
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
          </ul>
        </aside>
      </div>
      <SectionEntry />
    </>
  );
}
