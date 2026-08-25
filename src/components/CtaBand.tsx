import { Box, Container, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import LinkButton from "./LinkButton";

/** Closing call-to-action on every content page: start a free assessment. */
export default function CtaBand() {
  const t = useTranslations("cta");
  return (
    <Box sx={{ py: { xs: 9, md: 12 }, backgroundColor: "var(--app-gray-900)", color: "var(--app-bg)" }}>
      <Container>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, justifyContent: "space-between", gap: 4 }}>
          <Box sx={{ maxWidth: 640 }}>
            <Typography variant="h2" sx={{ color: "inherit", mb: 1.5 }}>
              {t("title")}
            </Typography>
            <Typography sx={{ color: "inherit", opacity: 0.8 }}>{t("body")}</Typography>
          </Box>
          <LinkButton href="/contact" variant="contained" size="large">
            {t("button")}
          </LinkButton>
        </Box>
      </Container>
    </Box>
  );
}
