import type { Metadata } from "next";
import { Box } from "@mui/material";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { staticPageMetadata, type LocaleParams } from "@/lib/page";
import { SERVICE_SLUGS, WALLET_SLUGS } from "@/lib/services";
import { Link } from "@/i18n/navigation";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import TrustStrip from "@/components/TrustStrip";
import CtaBand from "@/components/CtaBand";
import PageViewTracker from "@/components/PageViewTracker";
import { Chip } from "@mui/material";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "/services", "servicesPage");
}

export default async function ServicesPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("servicesPage");
  const ts = await getTranslations("services");
  const tw = await getTranslations("wallets");

  return (
    <>
      <PageViewTracker path="/services" locale={locale} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <TrustStrip />
      <Section>
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
          {SERVICE_SLUGS.map((slug) => (
            <ServiceCard key={slug} slug={slug} title={ts(`${slug}.name`)} desc={ts(`${slug}.short`)} />
          ))}
        </Box>
      </Section>
      <Section tone="surface" eyebrow={t("walletsEyebrow")} title={t("walletsTitle")} lede={t("walletsLede")}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {WALLET_SLUGS.map((slug) => (
            <Chip key={slug} component={Link} href={{ pathname: "/wallets/[slug]", params: { slug } }} clickable label={tw(`${slug}.name`)} variant="outlined" />
          ))}
        </Box>
      </Section>
      <CtaBand />
    </>
  );
}
