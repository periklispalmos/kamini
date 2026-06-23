import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Single-page site: one canonical entry. SITE_URL is a placeholder until the real domain is set.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
