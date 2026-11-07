import type { MetadataRoute } from "next";
import { getBlogPosts, hasLocalizedPost } from "@/lib/content";
import { SERVICE_SLUGS } from "@/lib/services";
import { absoluteUrl } from "@/lib/seo";
import type { AppPathname } from "@/i18n/routing";

// Real last-edit dates per route. Bump when the page's copy changes; a build
// timestamp on every URL teaches Google to ignore lastmod entirely.
const STATIC_ROUTES: Partial<Record<AppPathname, string>> = {
  "/": "2026-08-25",
  "/services": "2026-08-25",
  "/how-it-works": "2026-08-25",
  "/pricing": "2026-08-25",
  "/about": "2026-08-20",
  "/faq": "2026-08-25",
  "/blog": "2026-08-24",
  "/contact": "2026-08-25",
  "/privacy": "2026-08-20",
  "/terms": "2026-08-20",
};
const SERVICES_UPDATED = "2026-08-25";
// Wallet landing pages are noindex until they carry wallet-specific content;
// see wallets/[slug]/page.tsx. They are deliberately absent here.

function entry(href: AppPathname, lastModified: string, params?: Record<string, string>, includeEn = true): MetadataRoute.Sitemap {
  const nl = absoluteUrl(href, "nl", params);
  const en = absoluteUrl(href, "en", params);
  const languages = includeEn ? { nl, en, "x-default": nl } : { nl, "x-default": nl };
  const lastMod = new Date(lastModified);
  const rows: MetadataRoute.Sitemap = [{ url: nl, lastModified: lastMod, alternates: { languages } }];
  if (includeEn) rows.push({ url: en, lastModified: lastMod, alternates: { languages } });
  return rows;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...(Object.entries(STATIC_ROUTES) as [AppPathname, string][]).flatMap(([href, date]) => entry(href, date)),
    ...SERVICE_SLUGS.flatMap((slug) => entry("/services/[slug]", SERVICES_UPDATED, { slug })),
    // An EN post served via the Dutch fallback canonicalizes to NL, so it must
    // not be listed (or declared as the `en` alternate) here.
    ...getBlogPosts("nl").flatMap((p) => entry("/blog/[slug]", p.updated || p.date, { slug: p.slug }, hasLocalizedPost("en", p.slug))),
  ];
}
