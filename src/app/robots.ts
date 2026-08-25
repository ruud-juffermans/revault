import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: ["GPTBot", "OAI-SearchBot", "ClaudeBot", "Claude-Web", "PerplexityBot", "Google-Extended"], allow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
