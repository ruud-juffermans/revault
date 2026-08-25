import type { Metadata } from "next";
import { Box, Container, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import { buildAlternates, buildOpenGraph, fallbackAlternates, formatDate, SITE_URL } from "@/lib/seo";
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
    title: post.meta.title,
    description: post.meta.excerpt,
    alternates: post.usedFallback ? fallbackAlternates("/blog/[slug]", { slug }) : buildAlternates("/blog/[slug]", locale, { slug }),
    openGraph: { ...buildOpenGraph("/blog/[slug]", locale, { slug }), type: "article", publishedTime: post.meta.date },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);
  if (!post) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  return (
    <>
      <PageViewTracker path={`/blog/${slug}`} locale={locale} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: post.meta.title, datePublished: post.meta.date, description: post.meta.excerpt, author: { "@type": "Organization", name: "Revault", url: SITE_URL } }} />
      <Box component="article" sx={{ pt: { xs: 10, md: 14 }, pb: { xs: 10, md: 14 } }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ display: "block", mb: 2 }}>{formatDate(post.meta.date, locale)} · {post.meta.readingTime}</Typography>
          <Typography variant="h1" sx={{ mb: 3 }}>{post.meta.title}</Typography>
          {post.usedFallback && <Typography variant="body2" sx={{ mb: 3, color: "text.secondary", fontStyle: "italic" }}>{t("fallbackNotice")}</Typography>}
          <Box sx={{ "& h2": { mt: 6, mb: 2 }, "& h3": { mt: 4, mb: 1.5 }, "& p": { mb: 2.5, color: "text.secondary", lineHeight: 1.75 }, "& li": { mb: 1, color: "text.secondary" }, "& a": { color: "var(--app-accent)" } }}>
            <MDXRemote source={post.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </Box>
        </Container>
      </Box>
      <CtaBand />
    </>
  );
}
