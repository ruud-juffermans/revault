import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { staticPageMetadata, type LocaleParams } from "@/lib/page";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import Steps from "@/components/Steps";
import TrustStrip from "@/components/TrustStrip";
import CtaBand from "@/components/CtaBand";
import PageViewTracker from "@/components/PageViewTracker";
import { Box, Typography } from "@mui/material";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "/how-it-works", "howItWorks");
}

export default async function HowItWorksPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("howItWorks");
  const tp = await getTranslations("process");
  const steps = (["intake", "verification", "agreement", "recovery", "handover"] as const).map((k) => ({ title: tp(`${k}.title`), body: tp(`${k}.body`) }));

  return (
    <>
      <PageViewTracker path="/how-it-works" locale={locale} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <TrustStrip />
      <Section>
        <Steps steps={steps} />
      </Section>
      <Section tone="surface" title={t("securityTitle")} lede={t("securityLede")}>
        <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {(["offline", "nda", "verification", "location"] as const).map((k) => (
            <Box key={k}>
              <Typography variant="h5" component="h3" sx={{ mb: 1 }}>{t(`security.${k}.title`)}</Typography>
              <Typography>{t(`security.${k}.body`)}</Typography>
            </Box>
          ))}
        </Box>
      </Section>
      <CtaBand />
    </>
  );
}
