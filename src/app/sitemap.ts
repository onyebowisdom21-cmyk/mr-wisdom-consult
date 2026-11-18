import type { MetadataRoute } from "next";
import { getList } from "@/lib/data";
import { siteBaseUrl } from "@/lib/env";
import { routeFor, type ContentKind } from "@/types/platform";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = siteBaseUrl();
  const kinds: ContentKind[] = [
    "services", "products", "articles", "scholarships", "grants", "jobs", "empowerment",
  ];
  const pages: MetadataRoute.Sitemap = [
    "/", "/services", "/products", "/news", "/announcements", "/opportunities", "/about", "/contact",
    "/opportunities/scholarships", "/opportunities/grants", "/opportunities/jobs", "/opportunities/empowerment",
  ].map((path) => ({ url: new URL(path, siteUrl).toString() }));

  const catalogs = await Promise.all(kinds.map((kind) => getList(kind)));
  catalogs.forEach((items, index) => {
    const kind = kinds[index];
    if (!kind) return;
    for (const item of items) {
      const category = "category" in item ? item.category : undefined;
      const path = routeFor(kind, item.slug, category);
      pages.push({
        url: new URL(path, siteUrl).toString(),
        lastModified: new Date(item.updatedAt),
      });
    }
  });
  return pages;
}
