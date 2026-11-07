import type { Metadata } from "next";
import { Box, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildAlternates, buildOpenGraph, buildTwitter, breadcrumbJsonLd, ORG_ID, absoluteUrl } from "@/lib/seo";
import { SERVICE_SLUGS, SERVICE_WALLETS, SERVICE_POSTS, isServiceSlug } from "@/lib/services";
import { getBlogPost } from "@/lib/content";
import RelatedLinks, { type RelatedLink } from "@/components/RelatedLinks";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import TrustStrip from "@/components/TrustStrip";
import CtaBand from "@/components/CtaBand";
import Faq from "@/components/Faq";
import PageViewTracker from "@/components/PageViewTracker";
import JsonLd from "@/components/JsonLd";
import LinkButton from "@/components/LinkButton";

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
    twitter: buildTwitter(locale),
  };
}

export default async function ServicePage({ params }: Params) {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const tc = await getTranslations("serviceDetail");

  // Each service carries 3 "what I can do" bullets, 3 "what I need" bullets and 2 FAQs.
  const can = ["one", "two", "three"].map((k) => t(`${slug}.can.${k}`));
  const need = ["one", "two", "three"].map((k) => t(`${slug}.need.${k}`));
  const faq = ["one", "two"].map((k) => ({ q: t(`${slug}.faq.${k}.q`), a: t(`${slug}.faq.${k}.a`) }));
  const tn = await getTranslations("nav");
  const tw = await getTranslations("wallets");
  const related: RelatedLink[] = [
    ...SERVICE_WALLETS[slug].map((w) => ({ label: tw(`${w}.title`), href: { pathname: "/wallets/[slug]" as const, params: { slug: w } } })),
    ...(SERVICE_POSTS[slug] ?? []).map((p) => getBlogPost(locale, p)).filter((p) => p !== null).map((p) => ({ label: p.meta.title, href: { pathname: "/blog/[slug]" as const, params: { slug: p.meta.slug } } })),
  ];

  return (
    <>
      <PageViewTracker path={`/services/${slug}`} locale={locale} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: t(`${slug}.name`), description: t(`${slug}.short`), provider: { "@id": ORG_ID }, url: absoluteUrl("/services/[slug]", locale, { slug }), areaServed: ["NL", "BE", "DE", "EU"], offers: { "@type": "Offer", description: tc("offer") } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: "Revault", href: "/" }, { name: tn("services"), href: "/services" }, { name: t(`${slug}.name`), href: "/services/[slug]", params: { slug } }])} />
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
        <Box sx={{ mt: 6, pt: 5, borderTop: "1px solid var(--app-border-soft)", display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, gap: 3 }}>
          <Typography sx={{ maxWidth: 560 }}>{tc("ctaLede")}</Typography>
          <LinkButton href="/contact" variant="contained" sx={{ flexShrink: 0 }}>{tc("cta")}</LinkButton>
        </Box>
      </Section>
      <Section tone="surface" title={tc("faqTitle")}>
        <Faq items={faq} />
        <RelatedLinks title={tc("relatedTitle")} items={related} />
      </Section>
      <CtaBand />
    </>
  );
}
