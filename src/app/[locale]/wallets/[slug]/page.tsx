import type { Metadata } from "next";
import { Box } from "@mui/material";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { WALLET_SLUGS, WALLET_SERVICES, isWalletSlug } from "@/lib/services";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import TrustStrip from "@/components/TrustStrip";
import CtaBand from "@/components/CtaBand";
import PageViewTracker from "@/components/PageViewTracker";

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
  };
}

export default async function WalletPage({ params }: Params) {
  const { locale, slug } = await params;
  if (!isWalletSlug(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("wallets");
  const ts = await getTranslations("services");

  return (
    <>
      <PageViewTracker path={`/wallets/${slug}`} locale={locale} />
      <PageHero eyebrow={t("eyebrow")} title={t(`${slug}.title`)} subtitle={t(`${slug}.intro`)} />
      <TrustStrip />
      <Section title={t("relatedTitle")}>
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {WALLET_SERVICES[slug].map((s) => (
            <ServiceCard key={s} slug={s} title={ts(`${s}.name`)} desc={ts(`${s}.short`)} />
          ))}
        </Box>
      </Section>
      <CtaBand />
    </>
  );
}
