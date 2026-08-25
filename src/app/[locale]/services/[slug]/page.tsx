import type { Metadata } from "next";
import { Box, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { SERVICE_SLUGS, isServiceSlug } from "@/lib/services";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import TrustStrip from "@/components/TrustStrip";
import CtaBand from "@/components/CtaBand";
import Faq from "@/components/Faq";
import PageViewTracker from "@/components/PageViewTracker";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/seo";

type Params = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) return {};
  const t = await getTranslations({ locale, namespace: "services" });
  return {
    title: t(`${slug}.metaTitle`),
    description: t(`${slug}.metaDescription`),
    alternates: buildAlternates("/services/[slug]", locale, { slug }),
    openGraph: buildOpenGraph("/services/[slug]", locale, { slug }),
  };
}

export default async function ServicePage({ params }: Params) {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const tc = await getTranslations("serviceDetail");

  // Each service carries 3 "what we can do" bullets, 3 "what we need" bullets and 2 FAQs.
  const can = ["one", "two", "three"].map((k) => t(`${slug}.can.${k}`));
  const need = ["one", "two", "three"].map((k) => t(`${slug}.need.${k}`));
  const faq = ["one", "two"].map((k) => ({ q: t(`${slug}.faq.${k}.q`), a: t(`${slug}.faq.${k}.a`) }));

  return (
    <>
      <PageViewTracker path={`/services/${slug}`} locale={locale} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: t(`${slug}.name`), description: t(`${slug}.short`), provider: { "@type": "Organization", name: "Revault", url: SITE_URL }, offers: { "@type": "Offer", description: tc("offer") } }} />
      <PageHero eyebrow={tc("eyebrow")} title={t(`${slug}.name`)} subtitle={t(`${slug}.intro`)} />
      <TrustStrip />
      <Section>
        <Box sx={{ display: "grid", gap: 6, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <Box>
            <Typography variant="h3" component="h2" sx={{ mb: 2 }}>{tc("canTitle")}</Typography>
            <Box component="ul" sx={{ pl: 2.5, display: "grid", gap: 1 }}>
              {can.map((c) => <Typography component="li" key={c}>{c}</Typography>)}
            </Box>
          </Box>
          <Box>
            <Typography variant="h3" component="h2" sx={{ mb: 2 }}>{tc("needTitle")}</Typography>
            <Box component="ul" sx={{ pl: 2.5, display: "grid", gap: 1 }}>
              {need.map((n) => <Typography component="li" key={n}>{n}</Typography>)}
            </Box>
            <Typography variant="body2" sx={{ mt: 3, color: "text.secondary", fontStyle: "italic" }}>{tc("neverShare")}</Typography>
          </Box>
        </Box>
      </Section>
      <Section tone="surface" title={tc("faqTitle")}>
        <Faq items={faq} />
      </Section>
      <CtaBand />
    </>
  );
}
