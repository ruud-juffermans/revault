import type { Metadata } from "next";
import { Box, Typography } from "@mui/material";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { staticPageMetadata, type LocaleParams } from "@/lib/page";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import PageViewTracker from "@/components/PageViewTracker";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "/about", "about");
}

export default async function AboutPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  return (
    <>
      <PageViewTracker path="/about" locale={locale} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <Section>
        <Box sx={{ maxWidth: 760, display: "grid", gap: 3 }}>
          {(["one", "two", "three"] as const).map((k) => <Typography key={k}>{t(`story.${k}`)}</Typography>)}
        </Box>
      </Section>
      <Section tone="surface" title={t("valuesTitle")}>
        <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {(["honesty", "security", "control"] as const).map((k) => (
            <Box key={k}>
              <Typography variant="h5" component="h3" sx={{ mb: 1 }}>{t(`values.${k}.title`)}</Typography>
              <Typography>{t(`values.${k}.body`)}</Typography>
            </Box>
          ))}
        </Box>
      </Section>
      <CtaBand />
    </>
  );
}
