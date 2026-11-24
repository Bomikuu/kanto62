import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const enabled =
    process.env.KANTO62_INDEX_PUBLIC === "1" &&
    process.env.KANTO62_WEB_ORIGIN?.startsWith("https://");
  return enabled
    ? {
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/studio/",
            "/merchant/",
            "/intake",
            "/auth/",
            "/*/manage",
          ],
        },
        sitemap: process.env.KANTO62_WEB_ORIGIN + "/sitemap.xml",
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
