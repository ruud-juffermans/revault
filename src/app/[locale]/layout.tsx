import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import ThemeRegistry from "@/theme/ThemeRegistry";
import Header from "@/components/Header";
import SkipLink from "@/components/SkipLink";
import Footer from "@/components/Footer";
import { SERVICE_SLUGS } from "@/lib/services";
import JsonLd from "@/components/JsonLd";
import { routing } from "@/i18n/routing";
import { ORG_ID, SITE_URL, absoluteUrl } from "@/lib/seo";
import { FOUNDER, PERSON_ID } from "@/lib/founder";

// Self-hosted fonts via next/font (preloaded, size-adjusted fallback → no CLS).
const headingFont = localFont({
  src: "../../assets/fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-heading",
});
const bodyFont = localFont({
  src: "../../assets/fonts/outfit-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-body",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    metadataBase: new URL(SITE_URL),
    openGraph: { type: "website", locale: locale === "nl" ? "nl_NL" : "en_US", siteName: t("siteName") },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tc = await getTranslations({ locale, namespace: "common" });
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL;

  const ts = await getTranslations({ locale, namespace: "services" });
  const tf = await getTranslations({ locale, namespace: "founder" });
  // TODO(identity): add legalName, identifier (KvK), vatID, address, email and telephone once available.
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: "Revault",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: tc("orgDescription"),
    areaServed: ["NL", "BE", "DE", "EU"],
    knowsLanguage: ["nl", "en"],
    numberOfEmployees: { "@type": "QuantitativeValue", value: 1 },
    founder: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: FOUNDER.name,
      jobTitle: tf("role"),
      image: `${SITE_URL}${FOUNDER.portrait.src}`,
      url: absoluteUrl("/about", locale),
      worksFor: { "@id": ORG_ID },
      sameAs: [FOUNDER.linkedin],
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: tc("offerCatalogName"),
      itemListElement: SERVICE_SLUGS.map((slug) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: ts(`${slug}.name`), url: absoluteUrl("/services/[slug]", locale, { slug }) },
        description: tc("offerDescription"),
      })),
    },
  };
  const siteJsonLd = { "@context": "https://schema.org", "@type": "WebSite", url: SITE_URL, name: "Revault", inLanguage: locale, publisher: { "@id": ORG_ID } };

  return (
    <html lang={locale} className={`${headingFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <head>
        {apiOrigin ? <link rel="preconnect" href={apiOrigin} /> : null}
        <InitColorSchemeScript defaultMode="light" attribute="data-mui-color-scheme" modeStorageKey="revault-color-mode" />
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <NextIntlClientProvider>
          <ThemeRegistry>
            <JsonLd data={orgJsonLd} />
            <JsonLd data={siteJsonLd} />
            <SkipLink label={tc("skipToContent")} />
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </ThemeRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
