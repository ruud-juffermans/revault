import Image from "next/image";
import { Box, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { FOUNDER } from "@/lib/founder";
import { radii } from "@/theme/theme";
import LinkButton from "./LinkButton";

/**
 * Portrait + short bio of the one person behind Revault. Used on the home
 * page (with a link to the about page) and on the about page itself.
 */
export default function FounderCard({ showMoreLink = true }: { showMoreLink?: boolean }) {
  const t = useTranslations("founder");
  return (
    <Box sx={{ display: "grid", gap: { xs: 4, md: 8 }, gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" }, alignItems: "center" }}>
      <Box sx={{ maxWidth: { xs: 360, md: "none" } }}>
        <Image
          src={FOUNDER.portrait.src}
          width={FOUNDER.portrait.width}
          height={FOUNDER.portrait.height}
          alt={t("portraitAlt")}
          sizes="(min-width: 900px) 40vw, 360px"
          style={{ width: "100%", height: "auto", borderRadius: radii.panel, display: "block", border: "1px solid var(--app-border-soft)" }}
        />
      </Box>
      <Box>
        <Typography variant="h3" component="p" sx={{ mb: 0.5 }}>{t("name")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>{t("role")}</Typography>
        <Box sx={{ display: "grid", gap: 2 }}>
          <Typography sx={{ fontWeight: 500 }}>{t("intro")}</Typography>
          {(["one", "two", "three"] as const).map((k) => <Typography key={k}>{t(`bio.${k}`)}</Typography>)}
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 4 }}>
          {showMoreLink && <LinkButton href="/about" variant="outlined">{t("moreAbout")}</LinkButton>}
          <Box component="a" href={FOUNDER.linkedin} target="_blank" rel="noopener noreferrer me" sx={{ alignSelf: "center", color: "var(--app-accent)", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
            {t("linkedin")} ↗
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
