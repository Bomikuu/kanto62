import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditorialBack, EditorialPage } from "@/components/editorial-page";
import { StructuredData } from "@/components/structured-data";
import { articleDate, articles } from "@/lib/articles";

type Props = { params: Promise<{ slug: string }> };

async function article({ params }: Props) {
  const { slug } = await params;
  return articles.find((item) => item.slug === slug) ?? notFound();
}

export async function generateMetadata(props: Props) {
  const item = await article(props);
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: "/articles/" + item.slug },
    openGraph: {
      type: "article",
      images: [item.image],
      publishedTime: articleDate,
    },
  };
}

export default async function Article(props: Props) {
  const item = await article(props);
  const origin = process.env.KANTO62_WEB_ORIGIN || "http://localhost:3063";
  const published = new Intl.DateTimeFormat("en-PH", {
    dateStyle: "long",
    timeZone: "Asia/Manila",
  }).format(new Date(articleDate));
  const related = articles.filter((entry) => entry.slug !== item.slug);
  return (
    <EditorialPage>
      <article className="mx-auto w-full max-w-7xl px-5 sm:px-8 grid gap-8 py-9 sm:py-12">
        <EditorialBack href="/articles">All articles</EditorialBack>
        <StructuredData
          value={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Article",
                headline: item.title,
                description: item.summary,
                image: new URL(item.image, origin).href,
                datePublished: articleDate,
                dateModified: articleDate,
                author: { "@type": "Organization", name: "kanto62 Studio" },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Articles",
                    item: new URL("/articles", origin).href,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: item.title,
                    item: new URL(`/articles/${item.slug}`, origin).href,
                  },
                ],
              },
            ],
          }}
        />
        <Card className="grid items-stretch overflow-hidden bg-muted/55 lg:grid-cols-[1.15fr_0.85fr] [&>img]:h-full [&>img]:min-h-50 [&>img]:w-full [&>img]:object-cover gap-0 py-0">
          <div className="grid content-center gap-3 p-6 sm:p-10 [&>h1]:text-4xl [&>h1]:font-semibold [&>h1]:tracking-tight sm:[&>h1]:text-5xl">
            <h1>{item.title}</h1>
            <p className="max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
              {item.summary}
            </p>
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>kanto62 Studio</span>
              <time dateTime={articleDate}>{published}</time>
            </p>
          </div>
          <img
            src={item.image}
            alt={item.imageAlt}
            width={724}
            height={724}
            fetchPriority="high"
          />
        </Card>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="grid max-w-[70ch] gap-6 text-base leading-relaxed [&_div]:space-y-3 [&_section]:space-y-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:text-muted-foreground [&_a]:text-primary [&_a]:underline">
            {item.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <Button asChild>
              <Link href={item.link}>
                {item.label} <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </Button>
          </div>
          {related.length > 0 && (
            <aside
              className="gap-3 px-5 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:space-y-2 [&_a]:text-sm [&_a]:text-primary [&_a:hover]:underline"
              aria-labelledby="related-guides"
            >
              <h2 id="related-guides">More merchant guides</h2>
              <ul>
                {related.map((entry) => (
                  <li key={entry.slug}>
                    <Link href={`/articles/${entry.slug}`}>
                      <span>{entry.title}</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </article>
    </EditorialPage>
  );
}
