import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { staticPageMetadata, type LocaleParams } from "@/lib/page";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import Faq from "@/components/Faq";
import CtaBand from "@/components/CtaBand";
import JsonLd from "@/components/JsonLd";
import PageViewTracker from "@/components/PageViewTracker";

const FAQ_KEYS = ["needToStart", "whoInNl", "cost", "duration", "trust", "custody", "chances", "littleInfo", "currencies", "wrongAddress", "stolen", "lostSeed", "inheritance", "location"] as const;

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "/faq", "faq");
}

export default async function FaqPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const items = FAQ_KEYS.map((k) => ({ q: t(`items.${k}.q`), a: t(`items.${k}.a`) }));
  return (
    <>
      <PageViewTracker path="/faq" locale={locale} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <Section sx={{ pt: 0 }}>
        <Faq items={items} headingLevel="h2" />
      </Section>
      <CtaBand />
    </>
  );
}
