import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // L'admin n'a aucune information à indexer et ne doit jamais apparaître dans un moteur
      // de recherche public.
      disallow: "/admin",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
