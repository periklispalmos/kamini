import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Allow everything; point crawlers at the sitemap and canonical host. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
