import type { Metadata } from "next";
import { routing, type AppPathname, type Locale } from "@/i18n/routing";

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  // Every canonical, hreflang, og:url and JSON-LD url derives from this; a
  // production build without it would canonicalize the whole site to localhost.
  throw new Error("NEXT_PUBLIC_SITE_URL must be set for production builds (e.g. https://revault.nl)");
}
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
export const SITE_NAME: Record<Locale, string> = { nl: "Revault — Crypto wallet herstel", en: "Revault — Crypto Wallet Recovery" };
/** Stable @id for the organization node, referenced from every Service/Article. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const OG_IMAGE_ALT: Record<Locale, string> = { nl: "Revault — Crypto wallet herstel", en: "Revault — Crypto wallet recovery" };

/** The file-convention OG image lives at /{locale}/opengraph-image regardless of localePrefix. */
export function ogImage(locale: Locale) {
  return { url: `${SITE_URL}/${locale}/opengraph-image`, width: 1200, height: 630, alt: OG_IMAGE_ALT[locale] };
}

type PathParams = Record<string, string>;

/**
 * Resolve an internal pathname key (e.g. "/services/[slug]") to the concrete
 * URL path for a locale. Re-implements next-intl's getPathname because the
 * createNavigation export is a client module that generateMetadata can't use.
 */
export function localizePathname(href: AppPathname, locale: Locale, params?: PathParams): string {
  const entry = routing.pathnames[href];
  let path: string = typeof entry === "string" ? entry : entry[locale];
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`[${key}]`, encodeURIComponent(value));
    }
  }
  if (locale === routing.defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function absoluteUrl(href: AppPathname, locale: Locale, params?: PathParams): string {
  return `${SITE_URL}${localizePathname(href, locale, params)}`;
}

/** Per-page canonical + hreflang. The layout intentionally sets none. */
export function buildAlternates(href: AppPathname, locale: Locale, params?: PathParams): Metadata["alternates"] {
  const nl = localizePathname(href, "nl", params);
  const en = localizePathname(href, "en", params);
  return {
    canonical: locale === "nl" ? nl : en,
    languages: { nl, en, "x-default": nl },
  };
}

export function buildOpenGraph(href: AppPathname, locale: Locale, params?: PathParams): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    url: localizePathname(href, locale, params),
    locale: locale === "nl" ? "nl_NL" : "en_US",
    alternateLocale: locale === "nl" ? ["en_US"] : ["nl_NL"],
    siteName: SITE_NAME[locale],
    // Child metadata replaces the layout's openGraph object wholesale, so the
    // image must be repeated here or inner pages ship without one.
    images: [ogImage(locale)],
  };
}

export function buildTwitter(locale: Locale): NonNullable<Metadata["twitter"]> {
  return { card: "summary_large_image", images: [ogImage(locale).url] };
}

/** BreadcrumbList JSON-LD from a trail of (label, route) pairs. */
export function breadcrumbJsonLd(locale: Locale, trail: { name: string; href: AppPathname; params?: PathParams }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: absoluteUrl(t.href, locale, t.params) })),
  };
}

/** Fallback content (Dutch MDX served under /en): canonicalize to Dutch. */
export function fallbackAlternates(href: AppPathname, params?: PathParams): Metadata["alternates"] {
  return { canonical: localizePathname(href, routing.defaultLocale, params) };
}

export function formatDate(isoDate: string, locale: Locale): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-US", { dateStyle: "long", timeZone: "UTC" }).format(parsed);
}
