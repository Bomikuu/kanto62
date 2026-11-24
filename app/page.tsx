import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChefHat,
  ChevronDown,
  Coffee,
  Compass,
  Cpu,
  FileCheck2,
  LayoutGrid,
  MapPin,
  PanelsTopLeft,
  Store,
  Wrench,
} from "lucide-react";
import { api } from "@/lib/api";
import { catalog } from "@/lib/catalog";
import { articleDate, articles } from "@/lib/articles";
import { sampleTestimonials } from "@/lib/sample-listings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingHero } from "@/components/landing-hero";
import { FeaturedListings } from "@/components/featured-listings";
import { ReviewCards } from "@/components/public-feedback";
import { SectionEntry } from "@/components/section-entry";
import { PendingPublicLink } from "@/components/pending-public-link";
import { Assistant } from "./assistant";

const browseLinks = [
  ["/directory?category=restaurant", "Food & dining", ChefHat],
  ["/directory?category=restaurant&q=cafe", "Cafés", Coffee],
  ["/directory?category=repair", "Electronics", Cpu],
  ["/directory?category=repair&q=repair", "Repair services", Wrench],
  ["/directory?category=sari-sari", "Small stores", Store],
  ["/directory?view=map", "Map view", MapPin],
  ["/services", "Studio services", LayoutGrid],
  ["/directory", "All places", Compass],
] as const;

const merchantBenefits = [
  [
    PanelsTopLeft,
    "Build your business profile",
    "Add hours, offerings, and contact details.",
  ],
  [
    Compass,
    "Reach more customers",
    "Be found by business name, area, or category.",
  ],
  [
    FileCheck2,
    "Manage customer requests",
    "Review bookings and stock inquiries.",
  ],
] as const;

const questions = [
  [
    "Do I need a website?",
    "You can apply with your trading name, barangay, and a public landmark. The studio reviews the listing before it goes live.",
  ],
  [
    "Can I keep my domain?",
    "Storefront and Bookings support a domain you own after DNS verification.",
  ],
  [
    "Do guests need an account?",
    "Customers can book without signing in when the merchant offers online bookings.",
  ],
  [
    "Can I update my business details later?",
    "Use the merchant workspace to update a listing you manage. You can also ask the studio to correct details on a listing you don’t manage.",
  ],
] as const;

const plans = [
  {
    id: "listing",
    name: "Listing",
    features: [
      "Public business profile",
      "Contact and location details",
      "Listing and correction requests",
    ],
  },
  {
    id: "storefront",
    name: "Storefront",
    features: [
      "Publish an online storefront",
      "Accept stock inquiries",
      "Connect your own domain",
    ],
  },
  {
    id: "bookings",
    name: "Bookings",
    features: [
      "Everything in Storefront",
      "Guest bookings without sign-in",
      "250 bookings per paid month",
    ],
  },
] as const;

const bureau =
  "https://davaocity.gov.ph/business-and-industry-support-development/biz-permit-applications-increase/";
const sectionTitle =
  "text-[clamp(1.85rem,3.4vw,3rem)] leading-[1.06] font-bold tracking-[-0.035em] text-balance";
const frame = "mx-auto w-[calc(100%-2.5rem)] max-w-7xl sm:w-[87%] lg:w-[84%]";
const outline =
  "rounded-none border-primary/40 text-primary hover:bg-accent hover:text-accent-foreground";
const entry = "motion-safe:data-entered:animate-section-entry";
const sectionSpacing = "mt-14 sm:mt-16 lg:mt-20";
const dateLabel = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(articleDate));

export const metadata = {
  title: "Find and support local businesses in Davao",
  alternates: { canonical: "/" },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; referral?: string }>;
}) {
  const [query, { products, prices }, listing] = await Promise.all([
    searchParams,
    catalog(),
    api<{ count: number }>("/businesses/"),
  ]);
  const product = products.find((item) => item.id === query.product);
  const demo =
    "/intake?" +
    new URLSearchParams({
      goal: "demo",
      product: product?.id || "",
      referral: query.referral === "service" ? "service" : "homepage",
    });

  const metrics = [
    [Store, listing.count, "Directory listings"],
    [LayoutGrid, products.length, "Studio products"],
    [MapPin, 3, "Listing categories"],
    [FileCheck2, 45621, "Jan 2026 permit applications", bureau],
  ] as const;
  const format = new Intl.NumberFormat("en-PH");
  const availablePlans = plans.flatMap((plan) => {
    const price = prices[plan.id];
    return typeof price === "number" ? [{ ...plan, price }] : [];
  });

  return (
    <div
      data-landing
      className="isolate bg-linear-to-b from-background via-muted/25 to-background [&_[data-slot=badge]]:rounded-none [&_[data-slot=card]]:rounded-none"
    >
      <LandingHero />
      <div className={frame + " pb-12 lg:pb-16"}>
        <nav
          aria-labelledby="home-categories"
          className="relative z-10 -mt-7 border border-primary/10 bg-card p-4 shadow-[0_8px_24px_#243e6a12] sm:p-5"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4">
            <h2 id="home-categories" className="text-sm font-bold sm:text-base">
              Browse by category
            </h2>
            <Link
              href="/directory"
              className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              View all categories <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-4 lg:grid-cols-8">
            {browseLinks.map(([href, label, Icon]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex h-full min-h-[4.65rem] min-w-0 flex-col items-center justify-center gap-2 bg-muted/65 px-1 py-2 text-center text-[0.7rem] leading-tight sm:text-xs font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon
                    size={22}
                    strokeWidth={1.9}
                    className="text-primary"
                    aria-hidden="true"
                  />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section
          aria-labelledby="featured-heading"
          data-section-entry
          className={`grid items-center gap-6 lg:grid-cols-[minmax(14rem,1.1fr)_minmax(0,3fr)] lg:gap-7 lg:pr-9 ${sectionSpacing} ${entry}`}
        >
          <div>
            <h2
              id="featured-heading"
              className="max-w-[15ch] text-[clamp(1.85rem,3vw,2.6rem)] leading-[1.06] font-bold tracking-[-0.035em] text-balance"
            >
              Featured places in the city
            </h2>
            <p className="mt-3 max-w-[27ch] text-sm leading-relaxed text-muted-foreground">
              Browse local listings and see what each place offers.
            </p>
            <Button asChild variant="outline" className={outline + " mt-5"}>
              <Link href="/directory">
                Explore the directory <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <FeaturedListings />
        </section>

        <section
          id="services"
          aria-labelledby="merchant-heading"
          data-section-entry
          className={`grid items-center gap-6 bg-linear-to-br from-accent/55 to-accent px-5 py-8 sm:px-8 md:grid-cols-2 lg:-mx-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1.03fr)] lg:gap-7 lg:py-10 ${sectionSpacing} ${entry}`}
        >
          <div>
            <h2
              id="merchant-heading"
              className="max-w-[19ch] text-[clamp(1.65rem,2.55vw,2.5rem)] leading-[1.08] font-bold tracking-tight"
            >
              Grow your business with{" "}
              <span className="text-primary">kanto62</span>
            </h2>
            <p className="mt-3 max-w-[33ch] text-sm leading-relaxed text-muted-foreground">
              Help customers in Davao find your business, manage your listing,
              and showcase what you offer.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button asChild className="rounded-none">
                <Link href="/intake?goal=listing">Add your business</Link>
              </Button>
              <Button asChild variant="outline" className={outline}>
                <PendingPublicLink
                  href="/services"
                  loadingLabel="Loading studio services"
                >
                  Learn more
                </PendingPublicLink>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-[1.55] w-full max-w-sm lg:max-w-none">
            <Image
              src="/art/merchant-illustrated.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 31vw, (min-width: 640px) 384px, 88vw"
              className="object-contain"
            />
          </div>
          <ul className="grid gap-4 md:col-span-2 md:grid-cols-3 lg:col-span-1 lg:grid-cols-1">
            {merchantBenefits.map(([Icon, title, description]) => (
              <li key={title} className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center bg-card text-primary">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="home-evidence"
          className="border-b py-8 sm:py-11"
        >
          <h2 id="home-evidence" className="sr-only">
            Davao’s businesses in numbers
          </h2>
          <dl className="grid grid-cols-2 gap-y-6 lg:grid-cols-4">
            {metrics.map(([Icon, value, label, source], index) => (
              <div
                key={label}
                className={`grid grid-cols-[auto_minmax(0,1fr)] content-start items-center gap-x-2.5 gap-y-1 px-2 first:pl-0 sm:px-4 ${index % 2 ? "border-l" : "lg:not-first:border-l"}`}
              >
                <Icon
                  size={25}
                  strokeWidth={1.8}
                  className="col-start-1 row-start-1 row-span-2 self-start text-primary"
                  aria-hidden="true"
                />
                <dt className="col-start-2 row-start-2 text-xs leading-tight text-muted-foreground sm:text-sm">
                  {source ? (
                    <a href={source} className="underline underline-offset-2">
                      {label}
                    </a>
                  ) : (
                    label
                  )}
                </dt>
                <dd className="col-start-2 row-start-1 text-2xl leading-none font-bold tracking-tight tabular-nums">
                  {format.format(value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          aria-labelledby="home-testimonials"
          data-section-entry
          className={`grid gap-5 sm:gap-6 ${sectionSpacing} ${entry}`}
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="home-testimonials" className={sectionTitle}>
              What locals might say
            </h2>
            <p className="text-sm text-muted-foreground">Sample testimonials</p>
          </div>
          <ReviewCards reviews={sampleTestimonials} compact />
        </section>

        <section
          id="pricing"
          aria-labelledby="home-pricing"
          data-section-entry
          className={`scroll-mt-16 border-t pt-10 sm:pt-12 ${sectionSpacing} ${entry}`}
        >
          <h2 id="home-pricing" className={sectionTitle}>
            Simple plans for every business
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Monthly prices in Philippine pesos per business. Paid plans renew by
            invoice.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {availablePlans.map((plan) => (
              <li key={plan.id}>
                <Card className="h-full gap-0 border border-primary/15 py-0 ring-0 transition-colors hover:border-primary/45">
                  <CardContent className="flex h-full flex-col p-5 lg:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold">{plan.name}</h3>
                      {plan.price === 0 && (
                        <Badge variant="secondary">Free</Badge>
                      )}
                    </div>
                    <p className="mt-4 flex flex-wrap items-baseline gap-1.5">
                      <span className="text-3xl font-bold tracking-tight tabular-nums">
                        ₱{format.format(plan.price / 100)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / month
                      </span>
                    </p>
                    <ul className="mt-4 mb-5 grid gap-2.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check
                            size={16}
                            className="mt-0.5 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      variant={plan.id === "storefront" ? "default" : "outline"}
                      className={
                        plan.id === "storefront"
                          ? "mt-auto w-full rounded-none"
                          : outline + " mt-auto w-full"
                      }
                    >
                      <Link href={`/intake?goal=listing&plan=${plan.id}`}>
                        Get started with {plan.name}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="home-articles"
          data-section-entry
          className={`border-t pt-10 sm:pt-12 ${sectionSpacing} ${entry}`}
        >
          <p className="mb-2 text-xs font-bold tracking-wider text-primary uppercase">
            Latest articles
          </p>
          <h2 id="home-articles" className={sectionTitle}>
            Tips, guides, and stories for local businesses
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4">
            {articles.slice(0, 3).map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="group grid min-w-0 overflow-hidden border bg-card transition-colors hover:border-primary/45 focus-visible:outline-offset-[-3px] sm:min-h-36 sm:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)]"
                >
                  <span className="relative block aspect-[2.3] overflow-hidden bg-muted sm:aspect-auto">
                    <Image
                      src={article.image}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 375px, (min-width: 640px) 27vw, 92vw"
                      className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
                    />
                  </span>
                  <div className="flex flex-col justify-center gap-2 px-4 py-5 sm:px-6">
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                      <span className="font-semibold text-primary">
                        {article.category}
                      </span>
                      <time dateTime={articleDate}>{dateLabel}</time>
                    </p>
                    <h3 className="flex items-center justify-between gap-3 text-lg leading-tight font-bold sm:text-xl">
                      {article.title}
                      <ArrowRight
                        size={18}
                        className="shrink-0 text-primary"
                        aria-hidden="true"
                      />
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {article.summary}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className={outline + " mt-6"}>
            <Link href="/articles">
              View all articles <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </section>

        <section
          aria-labelledby="home-faq"
          data-section-entry
          className={`border-t pt-10 sm:pt-12 ${sectionSpacing} ${entry}`}
        >
          <h2 id="home-faq" className={sectionTitle + " scroll-mt-20"}>
            Have questions?
          </h2>
          <div className="mt-6 grid gap-2.5">
            {questions.map(([question, answer]) => (
              <details
                key={question}
                className="group border bg-card open:border-primary/30"
              >
                <summary className="flex min-h-12 list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold hover:bg-muted/65 sm:px-5 [&::-webkit-details-marker]:hidden">
                  {question}
                  <ChevronDown
                    size={17}
                    className="shrink-0 text-primary group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="max-w-[70ch] px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-5">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <Card
          id="booking"
          className={`theme-dark scroll-mt-20 bg-linear-to-r from-[#254b94] to-[#2d62bc] py-0 text-white ring-0 lg:-mx-4 ${sectionSpacing}`}
        >
          <CardContent className="relative isolate grid items-center gap-5 px-6 py-8 sm:px-9 lg:min-h-36 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] lg:gap-8 lg:pl-[17%]">
            <Image
              src="/art/davao-landmarks.webp"
              fill
              alt=""
              sizes="260px"
              className="pointer-events-none -z-10 hidden object-cover object-left opacity-45 lg:block lg:max-w-[16%]"
            />
            <h2 className="max-w-[23ch] text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
              {product
                ? "Book a " + product.name + " demo"
                : "Be part of Davao’s growing local network."}
            </h2>
            <p className="max-w-[37ch] text-sm leading-relaxed text-blue-50">
              {product
                ? "Pick a time in Philippine time and tell us what your business needs."
                : "List your business, reach more customers, and share what you offer with your neighborhood."}
            </p>
            <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end lg:gap-2">
              <Button
                asChild
                className="rounded-none bg-white text-blue-950 hover:bg-blue-50"
              >
                <Link href={product ? demo : "/intake?goal=listing"}>
                  {product ? "Choose a demo time" : "Add your business"}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              {!product && (
                <Link
                  className="inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline"
                  href={demo}
                >
                  <CalendarDays size={14} aria-hidden="true" />
                  Book a demo
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <SectionEntry />
      <Assistant
        host={process.env.KANTO62_SMOKEY_ORIGIN}
        site={process.env.KANTO62_SMOKEY_SITE_ID}
      />
    </div>
  );
}
