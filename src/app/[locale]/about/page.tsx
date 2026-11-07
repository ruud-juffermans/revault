import type { Metadata } from "next";
import Image from "next/image";
import { Box, Container, Typography } from "@mui/material";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { staticPageMetadata, type LocaleParams } from "@/lib/page";
import { absoluteUrl } from "@/lib/seo";
import { FOUNDER, PERSON_ID } from "@/lib/founder";
import { radii } from "@/theme/theme";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import FounderCard from "@/components/FounderCard";
import JsonLd from "@/components/JsonLd";
import PageViewTracker from "@/components/PageViewTracker";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "/about", "about");
}

export default async function AboutPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tf = await getTranslations("founder");
  return (
    <>
      <PageViewTracker path="/about" locale={locale} />
      {/* The Person node itself is declared on every page via Organization.founder (layout); this marks /about as its profile page. */}
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ProfilePage", url: absoluteUrl("/about", locale), inLanguage: locale, mainEntity: { "@id": PERSON_ID } }} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <Container sx={{ mb: { xs: 2, md: 4 } }}>
        <Image
          src={FOUNDER.speaking.src}
          width={FOUNDER.speaking.width}
          height={FOUNDER.speaking.height}
          alt={tf("speakingAlt")}
          priority
          sizes="(min-width: 1200px) 1152px, 100vw"
          style={{ width: "100%", height: "auto", borderRadius: radii.panel, display: "block", border: "1px solid var(--app-border-soft)" }}
        />
      </Container>
      <Section>
        <Box sx={{ maxWidth: 760, display: "grid", gap: 3 }}>
          {(["one", "two", "three"] as const).map((k) => <Typography key={k}>{t(`story.${k}`)}</Typography>)}
        </Box>
      </Section>
      <Section tone="surface" eyebrow={t("whoEyebrow")} title={t("whoTitle")}>
        <FounderCard showMoreLink={false} />
      </Section>
      <Section title={t("valuesTitle")}>
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
