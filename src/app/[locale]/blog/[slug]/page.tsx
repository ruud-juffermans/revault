import type { Metadata } from "next";
import { FOUNDER, PERSON_ID } from "@/lib/founder";
import { Box, Container, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import { buildAlternates, buildOpenGraph, buildTwitter, fallbackAlternates, formatDate, breadcrumbJsonLd, absoluteUrl, ogImage, ORG_ID, SITE_URL } from "@/lib/seo";
import { postRelations } from "@/lib/services";
import RelatedLinks, { type RelatedLink } from "@/components/RelatedLinks";
import CtaBand from "@/components/CtaBand";
import JsonLd from "@/components/JsonLd";
import PageViewTracker from "@/components/PageViewTracker";

type Params = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getBlogPosts(locale).map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);
  if (!post) return {};
  return {
    title: post.meta.metaTitle,
    description: post.meta.excerpt,
    alternates: post.usedFallback ? fallbackAlternates("/blog/[slug]", { slug }) : buildAlternates("/blog/[slug]", locale, { slug }),
    openGraph: { ...buildOpenGraph("/blog/[slug]", locale, { slug }), type: "article", publishedTime: post.meta.date, modifiedTime: post.meta.updated },
    twitter: buildTwitter(locale),
    // A Dutch article served under <html lang="en"> is a mixed-language document; keep it out of the index.
    ...(post.usedFallback ? { robots: { index: false, follow: true } } : {}),
  };
}

const mdxComponents = {
  h2: (props: React.ComponentProps<"h2">) => <Typography variant="h3" component="h2" {...props} />,
  h3: (props: React.ComponentProps<"h3">) => <Typography variant="h5" component="h3" {...props} />,
  p: (props: React.ComponentProps<"p">) => <Typography component="p" sx={{ color: "text.primary" }} {...props} />,
};

export default async function BlogPostPage({ params }: Params) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);
  if (!post) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const tn = await getTranslations("nav");
  const ts = await getTranslations("services");
  const tw = await getTranslations("wallets");
  const rel = postRelations(slug);
  const related: RelatedLink[] = [
    ...rel.services.map((s) => ({ label: ts(`${s}.name`), href: { pathname: "/services/[slug]" as const, params: { slug: s } } })),
    ...rel.wallets.map((w) => ({ label: tw(`${w}.title`), href: { pathname: "/wallets/[slug]" as const, params: { slug: w } } })),
  ];

  return (
    <>
      <PageViewTracker path={`/blog/${slug}`} locale={locale} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: post.meta.title, datePublished: post.meta.date, dateModified: post.meta.updated, description: post.meta.excerpt, inLanguage: post.usedFallback ? "nl" : locale, image: [ogImage(locale).url], mainEntityOfPage: absoluteUrl("/blog/[slug]", locale, { slug }), isAccessibleForFree: true, author: { "@id": PERSON_ID }, publisher: { "@id": ORG_ID, "@type": "Organization", name: "Revault", logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` } } }} />
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: "Revault", href: "/" }, { name: tn("blog"), href: "/blog" }, { name: post.meta.title, href: "/blog/[slug]", params: { slug } }])} />
      <Box component="article" sx={{ pt: { xs: 10, md: 14 }, pb: { xs: 10, md: 14 } }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ display: "block", mb: 2 }}>{formatDate(post.meta.date, locale)} · {post.meta.readingTime} · {t("byline", { name: FOUNDER.name })}</Typography>
          <Typography variant="h1" sx={{ mb: 3 }}>{post.meta.title}</Typography>
          {post.usedFallback && <Typography variant="body2" sx={{ mb: 3, color: "text.secondary", fontStyle: "italic" }}>{t("fallbackNotice")}</Typography>}
          <Box sx={{ "& h2": { mt: 6, mb: 2 }, "& h3": { mt: 4, mb: 1.5 }, "& p": { mb: 2.5, lineHeight: 1.75 }, "& li": { mb: 1 }, "& a": { color: "var(--app-accent)" } }}>
            <MDXRemote source={post.content} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </Box>
          <RelatedLinks title={t("relatedTitle")} items={related} />
        </Container>
      </Box>
      <CtaBand />
    </>
  );
}
