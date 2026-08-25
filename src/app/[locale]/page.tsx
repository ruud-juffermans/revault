import type { Metadata } from "next";
import { Box, Container, Typography, Chip } from "@mui/material";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import type { LocaleParams } from "@/lib/page";
import { SERVICE_SLUGS } from "@/lib/services";
import LinkButton from "@/components/LinkButton";
import TrustStrip from "@/components/TrustStrip";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import Steps from "@/components/Steps";
import Faq from "@/components/Faq";
import CtaBand from "@/components/CtaBand";
import PageViewTracker from "@/components/PageViewTracker";
import JsonLd from "@/components/JsonLd";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: { absolute: t("metaTitle") }, description: t("metaDescription"), alternates: buildAlternates("/", locale), openGraph: buildOpenGraph("/", locale) };
}

export default async function HomePage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const ts = await getTranslations("services");
  const tp = await getTranslations("process");
  const tf = await getTranslations("faq");

  const steps = (["intake", "verification", "agreement", "recovery", "handover"] as const).map((k) => ({ title: tp(`${k}.title`), body: tp(`${k}.body`) }));
  const faqKeys = ["needToStart", "cost", "duration", "trust", "stolen", "lostSeed"] as const;
  const faq = faqKeys.map((k) => ({ q: tf(`items.${k}.q`), a: tf(`items.${k}.a`) }));

  return (
    <>
      <PageViewTracker path="/" locale={locale} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />

      {/* Hero */}
      <Box sx={{ pt: { xs: 10, md: 16 }, pb: { xs: 8, md: 12 } }}>
        <Container>
          <Box sx={{ maxWidth: 820 }}>
            <Chip label={t("hero.badge")} size="small" variant="outlined" sx={{ mb: 3 }} />
            <Typography variant="h1" sx={{ mb: 3 }}>{t("hero.title")}</Typography>
            <Typography variant="subtitle1" sx={{ mb: 4, maxWidth: 640 }}>{t("hero.subtitle")}</Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, mb: 5, display: "grid", gap: 1 }}>
              {(["one", "two", "three"] as const).map((k) => (
                <Typography component="li" key={k} sx={{ color: "text.primary", "&::before": { content: '"✓ "', color: "var(--app-accent)", fontWeight: 700 } }}>
                  {t(`hero.points.${k}`)}
                </Typography>
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <LinkButton href="/contact" variant="contained" size="large">{t("hero.primaryCta")}</LinkButton>
              <LinkButton href="/how-it-works" variant="outlined" size="large">{t("hero.secondaryCta")}</LinkButton>
            </Box>
          </Box>
        </Container>
      </Box>

      <TrustStrip />

      <Section eyebrow={t("services.eyebrow")} title={t("services.title")} lede={t("services.lede")}>
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
          {SERVICE_SLUGS.map((slug) => (
            <ServiceCard key={slug} slug={slug} title={ts(`${slug}.name`)} desc={ts(`${slug}.short`)} />
          ))}
        </Box>
      </Section>

      <Section tone="surface" eyebrow={tp("eyebrow")} title={tp("title")} lede={tp("lede")}>
        <Steps steps={steps} />
        <Box sx={{ mt: 5 }}>
          <LinkButton href="/how-it-works" variant="text">{tp("readMore")} →</LinkButton>
        </Box>
      </Section>

      <Section eyebrow={t("why.eyebrow")} title={t("why.title")}>
        <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {(["confidential", "proven", "noCureNoPay", "direct"] as const).map((k) => (
            <Box key={k}>
              <Typography variant="h4" component="h3" sx={{ mb: 1 }}>{t(`why.${k}.title`)}</Typography>
              <Typography>{t(`why.${k}.body`)}</Typography>
            </Box>
          ))}
        </Box>
      </Section>

      <Section tone="surface" eyebrow={tf("eyebrow")} title={tf("title")}>
        <Faq items={faq} />
        <Box sx={{ mt: 4 }}>
          <LinkButton href="/faq" variant="text">{tf("allQuestions")} →</LinkButton>
        </Box>
      </Section>

      <CtaBand />
    </>
  );
}
