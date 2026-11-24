import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditorialPage } from "@/components/editorial-page";
import { articles } from "@/lib/articles";

export const metadata = {
  title: "Articles and merchant guides",
  description: "Practical guides for Davao shops and neighborhood businesses.",
  alternates: { canonical: "/articles" },
};

export default function Articles() {
  return (
    <EditorialPage>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 grid gap-8 py-9 sm:py-12">
        <section className="grid gap-2 [&>h1]:text-4xl [&>h1]:font-semibold [&>h1]:tracking-tight sm:[&>h1]:text-5xl">
          <h1>Articles</h1>
          <p className="max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
            Practical guides for Davao shop and restaurant owners.
          </p>
        </section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card
              className="overflow-hidden [&_img]:aspect-[16/9] [&_img]:w-full [&_img]:object-cover [&>a:hover]:bg-muted gap-0 py-0"
              key={article.slug}
            >
              <Link href={`/articles/${article.slug}`}>
                <img src={article.image} alt="" width={724} height={724} />
                <div className="grid gap-2 p-5 [&>h2]:text-xl [&>h2]:font-semibold [&>p]:text-sm [&>p]:leading-relaxed [&>p]:text-muted-foreground">
                  <Badge variant="secondary">{article.category}</Badge>
                  <h2>{article.title}</h2>
                  <p>{article.summary}</p>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    aria-hidden="true"
                  >
                    Read guide <ArrowRight size={17} />
                  </span>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </EditorialPage>
  );
}
