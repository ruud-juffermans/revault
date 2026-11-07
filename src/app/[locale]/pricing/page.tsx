import type { Metadata } from "next";
import { Box, Typography } from "@mui/material";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { staticPageMetadata, type LocaleParams } from "@/lib/page";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import Faq from "@/components/Faq";
import TrustStrip from "@/components/TrustStrip";
import CtaBand from "@/components/CtaBand";
import PageViewTracker from "@/components/PageViewTracker";
import LinkButton from "@/components/LinkButton";
import { radii } from "@/theme/theme";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "/pricing", "pricing");
}

export default async function PricingPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pricing");
  const faq = (["upfront", "highValue", "hidden", "extra"] as const).map((k) => ({ q: t(`faq.${k}.q`), a: t(`faq.${k}.a`) }));

  return (
    <>
      <PageViewTracker path="/pricing" locale={locale} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <TrustStrip />
      <Section>
        <Typography sx={{ maxWidth: 760, mb: 5, color: "text.primary" }}>{t("summary")}</Typography>
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" }, alignItems: "start" }}>
          <Box sx={{ p: { xs: 4, md: 5 }, borderRadius: `${radii.card}px`, border: "2px solid var(--app-accent)", backgroundColor: "var(--app-surface-elevated)" }}>
            <Typography variant="overline" sx={{ display: "block", mb: 1 }}>{t("standard.eyebrow")}</Typography>
            <Typography variant="h1" component="p" sx={{ mb: 2, fontSize: "clamp(2rem, 3.5vw + 1rem, 3.25rem)" }}>{t("standard.headline")}</Typography>
            <Typography sx={{ color: "text.primary", mb: 2 }}>{t("standard.body")}</Typography>
            <Typography sx={{ mb: 3 }}>{t("note")}</Typography>
            <LinkButton href="/contact" variant="contained">{t("cta")}</LinkButton>
          </Box>
          <Box sx={{ p: 4, borderRadius: `${radii.card}px`, border: "1px solid var(--app-border-soft)", backgroundColor: "var(--app-surface-elevated)" }}>
            <Typography variant="overline" sx={{ display: "block", mb: 1 }}>{t("custom.eyebrow")}</Typography>
            <Typography variant="h3" component="p" sx={{ mb: 1.5 }}>{t("custom.headline")}</Typography>
            <Typography sx={{ mb: 3 }}>{t("custom.body")}</Typography>
            <LinkButton href="/contact" variant="outlined">{t("customCta")}</LinkButton>
          </Box>
        </Box>
      </Section>
      <Section tone="surface" title={t("faqTitle")}>
        <Faq items={faq} />
      </Section>
      <CtaBand />
    </>
  );
}
