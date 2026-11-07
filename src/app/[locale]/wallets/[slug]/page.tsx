import type { Metadata } from "next";
import { Box } from "@mui/material";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildAlternates, buildOpenGraph, buildTwitter, breadcrumbJsonLd, ORG_ID, absoluteUrl } from "@/lib/seo";
import { WALLET_SLUGS, WALLET_SERVICES, WALLET_POSTS, isWalletSlug } from "@/lib/services";
import { getBlogPost } from "@/lib/content";
import RelatedLinks, { type RelatedLink } from "@/components/RelatedLinks";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import TrustStrip from "@/components/TrustStrip";
import CtaBand from "@/components/CtaBand";
import PageViewTracker from "@/components/PageViewTracker";
import JsonLd from "@/components/JsonLd";

type Params = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return WALLET_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isWalletSlug(slug)) return {};
  const t = await getTranslations({ locale, namespace: "wallets" });
  return {
    title: t(`${slug}.metaTitle`),
    description: t(`${slug}.metaDescription`),
    alternates: buildAlternates("/wallets/[slug]", locale, { slug }),
    openGraph: buildOpenGraph("/wallets/[slug]", locale, { slug }),
    twitter: buildTwitter(locale),
    // Thin, templated pages until each wallet has its own content (see docs/seo-review-2026-08-25.md C1).
    // Flip to index once `wallets.<slug>.sections` exists, and re-add WALLET_SLUGS to sitemap.ts.
    robots: { index: false, follow: true },
  };
}

export default async function WalletPage({ params }: Params) {
  const { locale, slug } = await params;
  if (!isWalletSlug(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("wallets");
  const ts = await getTranslations("services");
  const tn = await getTranslations("nav");
  const related: RelatedLink[] = (WALLET_POSTS[slug] ?? []).map((p) => getBlogPost(locale, p)).filter((p) => p !== null).map((p) => ({ label: p.meta.title, href: { pathname: "/blog/[slug]" as const, params: { slug: p.meta.slug } } }));

  return (
    <>
      <PageViewTracker path={`/wallets/${slug}`} locale={locale} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: t(`${slug}.title`),
          description: t(`${slug}.metaDescription`),
          serviceType: WALLET_SERVICES[slug].map((s) => ts(`${s}.name`)),
          provider: { "@id": ORG_ID },
          areaServed: ["NL", "BE", "DE", "EU"],
          url: absoluteUrl("/wallets/[slug]", locale, { slug }),
        }}
      />
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: "Revault", href: "/" }, { name: tn("services"), href: "/services" }, { name: t(`${slug}.title`), href: "/wallets/[slug]", params: { slug } }])} />
      <PageHero eyebrow={t("eyebrow")} title={t(`${slug}.title`)} subtitle={t(`${slug}.intro`)} />
      <TrustStrip />
      <Section title={t("relatedTitle")}>
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {WALLET_SERVICES[slug].map((s) => (
            <ServiceCard key={s} slug={s} title={ts(`${s}.name`)} desc={ts(`${s}.short`)} />
          ))}
        </Box>
        <RelatedLinks title={t("readMoreTitle")} items={related} />
      </Section>
      <CtaBand />
    </>
  );
}
