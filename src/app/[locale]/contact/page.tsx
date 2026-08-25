import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { staticPageMetadata, type LocaleParams } from "@/lib/page";
import PageViewTracker from "@/components/PageViewTracker";
import ContactClient from "./ContactClient";

// The form is a client component; this server wrapper carries the metadata.
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "/contact", "contact");
}

export default async function ContactPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PageViewTracker path="/contact" locale={locale} />
      <ContactClient />
    </>
  );
}
