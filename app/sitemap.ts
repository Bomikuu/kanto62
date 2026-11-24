import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { articles } from "@/lib/articles";
import { catalog } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.KANTO62_WEB_ORIGIN;
  if (process.env.KANTO62_INDEX_PUBLIC !== "1" || !base?.startsWith("https://"))
    return [];
  const [products, entries] = await Promise.all([
    catalog(),
    api<{ slug: string; updated_at: string }[]>("/indexable-businesses/"),
  ]);
  return [
    ...[
      "",
      "/directory",
      "/services",
      "/articles",
      "/about",
      "/contact",
      ...products.products.map((p) => "/services/" + p.id),
      ...articles.map((a) => "/articles/" + a.slug),
    ].map((path) => ({ url: base + path })),
    ...entries.map((entry) => ({
      url: base + "/businesses/" + entry.slug,
      lastModified: entry.updated_at,
    })),
  ];
}
