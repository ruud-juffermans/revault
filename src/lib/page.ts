import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { AppPathname, Locale } from "@/i18n/routing";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export type LocaleParams = { params: Promise<{ locale: Locale }> };

/** Metadata for a static page whose title/description live under `<ns>.metaTitle/metaDescription`. */
export async function staticPageMetadata(locale: Locale, href: AppPathname, ns: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: ns });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates(href, locale),
    openGraph: buildOpenGraph(href, locale),
  };
}
