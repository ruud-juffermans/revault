import type { Metadata } from "next";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { staticPageMetadata, type LocaleParams } from "@/lib/page";
import { getBlogPosts } from "@/lib/content";
import { formatDate } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import CtaBand from "@/components/CtaBand";
import PageViewTracker from "@/components/PageViewTracker";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "/blog", "blog");
}

export default async function BlogPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const posts = getBlogPosts(locale);
  return (
    <>
      <PageViewTracker path="/blog" locale={locale} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <Section sx={{ pt: 0 }}>
        {posts.length === 0 ? (
          <Typography>{t("empty")}</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            {posts.map((p) => (
              <Card key={p.slug} component={Link} href={{ pathname: "/blog/[slug]", params: { slug: p.slug } }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>{formatDate(p.date, locale)} · {p.readingTime}</Typography>
                  <Typography variant="h4" component="h2" sx={{ mb: 1 }}>{p.title}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>{p.excerpt}</Typography>
                  <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {p.tags.map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Section>
      <CtaBand />
    </>
  );
}
