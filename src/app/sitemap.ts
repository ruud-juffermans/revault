import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/content";
import { SERVICE_SLUGS, WALLET_SLUGS } from "@/lib/services";
import { absoluteUrl } from "@/lib/seo";
import type { AppPathname } from "@/i18n/routing";

const STATIC_ROUTES: AppPathname[] = ["/", "/services", "/how-it-works", "/pricing", "/about", "/faq", "/blog", "/contact", "/privacy", "/terms"];
const BUILD_DATE = new Date();

function entry(href: AppPathname, params?: Record<string, string>, lastModified?: string): MetadataRoute.Sitemap {
  const nl = absoluteUrl(href, "nl", params);
  const en = absoluteUrl(href, "en", params);
  const languages = { nl, en, "x-default": nl };
  const lastMod = lastModified ? new Date(lastModified) : BUILD_DATE;
  return [
    { url: nl, lastModified: lastMod, alternates: { languages } },
    { url: en, lastModified: lastMod, alternates: { languages } },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_ROUTES.flatMap((href) => entry(href)),
    ...SERVICE_SLUGS.flatMap((slug) => entry("/services/[slug]", { slug })),
    ...WALLET_SLUGS.flatMap((slug) => entry("/wallets/[slug]", { slug })),
    ...getBlogPosts("nl").flatMap((p) => entry("/blog/[slug]", { slug: p.slug }, p.date)),
  ];
}
