import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Lead-gen site: every AI-assistant citation is a referral, so AI crawlers are
// welcome. Only pure scrapers with no referral value are blocked.
const AI_CRAWLERS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended", "Meta-ExternalAgent", "Amazonbot", "CCBot", "cohere-ai", "MistralAI-User", "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_CRAWLERS, allow: "/", disallow: "/api/" },
      { userAgent: ["Bytespider", "PetalBot", "ImagesiftBot"], disallow: "/" },
      { userAgent: "*", allow: "/", disallow: "/api/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
