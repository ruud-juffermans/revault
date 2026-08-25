import { Box, Container, Typography } from "@mui/material";
import { getTranslations } from "next-intl/server";
import LinkButton from "@/components/LinkButton";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <Box sx={{ py: { xs: 14, md: 20 }, textAlign: "center" }}>
      <Container maxWidth="sm">
        <Typography variant="overline" sx={{ display: "block", mb: 2 }}>404</Typography>
        <Typography variant="h2" component="h1" sx={{ mb: 2 }}>{t("title")}</Typography>
        <Typography sx={{ mb: 4 }}>{t("description")}</Typography>
        <LinkButton href="/" variant="contained">{t("backHome")}</LinkButton>
      </Container>
    </Box>
  );
}
