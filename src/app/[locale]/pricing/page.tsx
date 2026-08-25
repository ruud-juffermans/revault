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
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {(["standard", "custom"] as const).map((k) => (
            <Box key={k} sx={{ p: 4, borderRadius: 3, border: "1px solid var(--app-border-soft)", backgroundColor: "var(--app-surface-elevated)" }}>
              <Typography variant="overline" sx={{ display: "block", mb: 1 }}>{t(`${k}.eyebrow`)}</Typography>
              <Typography variant="h2" component="p" sx={{ mb: 1.5 }}>{t(`${k}.headline`)}</Typography>
              <Typography>{t(`${k}.body`)}</Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="body2" sx={{ mt: 4, color: "text.secondary", maxWidth: 760 }}>{t("note")}</Typography>
      </Section>
      <Section tone="surface" title={t("faqTitle")}>
        <Faq items={faq} />
      </Section>
      <CtaBand />
    </>
  );
}
