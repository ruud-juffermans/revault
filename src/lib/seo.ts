import type { Metadata } from "next";
import { routing, type AppPathname, type Locale } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
export const SITE_NAME = "Revault — Crypto Wallet Recovery";

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
    siteName: SITE_NAME,
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
