import type { Metadata } from "next";
import { Box, Container, Typography } from "@mui/material";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { staticPageMetadata, type LocaleParams } from "@/lib/page";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(locale, "/terms", "terms");
}

export default async function LegalPage({ params }: LocaleParams) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");
  const sections = t.raw("sections") as { title: string; body: string }[];
  return (
    <Box sx={{ pt: { xs: 10, md: 14 }, pb: { xs: 10, md: 14 } }}>
      <Container maxWidth="md">
        <Typography variant="h1" sx={{ mb: 2 }}>{t("title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 6 }}>{t("updated")}</Typography>
        {sections.map((s) => (
          <Box key={s.title} sx={{ mb: 5 }}>
            <Typography variant="h3" component="h2" sx={{ mb: 1.5 }}>{s.title}</Typography>
            <Typography>{s.body}</Typography>
          </Box>
        ))}
      </Container>
    </Box>
  );
}
