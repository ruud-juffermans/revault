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
import { radii } from "@/theme/theme";
import { Typography } from "@mui/material";
import ArrowIcon from "@mui/icons-material/ArrowForward";

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
      <Section title={t("gridTitle")}>
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
          {SERVICE_SLUGS.map((slug) => (
            <ServiceCard key={slug} slug={slug} title={ts(`${slug}.name`)} desc={ts(`${slug}.short`)} />
          ))}
        </Box>
      </Section>
      <Section tone="surface" eyebrow={t("walletsEyebrow")} title={t("walletsTitle")} lede={t("walletsLede")}>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" } }}>
          {WALLET_SLUGS.map((slug) => (
            <Box
              key={slug}
              component={Link}
              href={{ pathname: "/wallets/[slug]", params: { slug } }}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2,
                minHeight: 56, px: 3, py: 2, borderRadius: `${radii.control}px`,
                border: "1px solid var(--app-border-strong)", backgroundColor: "var(--app-surface-elevated)",
                color: "text.primary", textDecoration: "none", fontWeight: 600,
                "@media (hover: hover)": { "&:hover": { borderColor: "var(--app-accent)", backgroundColor: "var(--app-accent-muted)" } },
              }}
            >
              <Typography component="span" sx={{ fontWeight: 600 }}>{tw(`${slug}.name`)}</Typography>
              <ArrowIcon aria-hidden sx={{ fontSize: 18, color: "var(--app-accent)" }} />
            </Box>
          ))}
        </Box>
      </Section>
      <CtaBand />
    </>
  );
}
