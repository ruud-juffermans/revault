import { Box, Container, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { ART } from "@/lib/art";
import LinkButton from "./LinkButton";

/** Closing call-to-action on every content page: start a free assessment. */
export default function CtaBand() {
  const t = useTranslations("cta");
  return (
    <Box component="aside" sx={{ position: "relative", isolation: "isolate", overflow: "hidden", py: { xs: 9, md: 12 }, backgroundColor: "var(--app-cta-bg)", color: "var(--app-cta-fg)" }}>
      {/* Guilloché texture: screen-blended so only the gold linework shows, masked so it recedes behind the copy. */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          backgroundImage: `url(${ART.guillocheTile})`,
          backgroundRepeat: "repeat",
          backgroundSize: { xs: 320, md: 440 },
          backgroundPosition: "center",
          mixBlendMode: "screen",
          opacity: 0.38,
          // The dark-mode band is lighter than the tile's own black, so screen-blending shows less of it; compensate.
          "[data-mui-color-scheme='dark'] &": { opacity: 0.55 },
          maskImage: {
            xs: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.9) 100%)",
            md: "linear-gradient(90deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,1) 100%)",
          },
          WebkitMaskImage: {
            xs: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.9) 100%)",
            md: "linear-gradient(90deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,1) 100%)",
          },
        }}
      />
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
