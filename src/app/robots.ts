import type { MetadataRoute } from "next";
import { siteBaseUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = siteBaseUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
