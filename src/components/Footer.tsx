import { Box, Container, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SERVICE_SLUGS, WALLET_SLUGS } from "@/lib/services";
import Logo from "./Logo";

const linkSx = { color: "text.secondary", textDecoration: "none", fontSize: "0.92rem", "&:hover": { color: "var(--app-accent)" } };

export default function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const ts = useTranslations("services");
  const tw = useTranslations("wallets");
  const year = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ borderTop: "1px solid var(--app-border-soft)", py: { xs: 8, md: 10 }, mt: "auto" }}>
      <Container>
        <Box sx={{ display: "grid", gap: 5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "2fr 1fr 1fr 1fr" } }}>
          <Box sx={{ maxWidth: 380 }}>
            <Logo />
            <Typography variant="body2" sx={{ mt: 2.5, color: "text.secondary" }}>
              {t("blurb")}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2.5, color: "text.secondary" }}>
              {t("noScamRecovery")}
            </Typography>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ display: "block", mb: 1.5 }}>{t("servicesHeading")}</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {SERVICE_SLUGS.map((slug) => (
                <Box key={slug} component={Link} href={{ pathname: "/services/[slug]", params: { slug } }} sx={linkSx}>
                  {ts(`${slug}.name`)}
                </Box>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ display: "block", mb: 1.5 }}>{t("walletsHeading")}</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {WALLET_SLUGS.map((slug) => (
                <Box key={slug} component={Link} href={{ pathname: "/wallets/[slug]", params: { slug } }} sx={linkSx}>
                  {tw(`${slug}.name`)}
                </Box>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ display: "block", mb: 1.5 }}>{t("companyHeading")}</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box component={Link} href="/how-it-works" sx={linkSx}>{tn("howItWorks")}</Box>
              <Box component={Link} href="/pricing" sx={linkSx}>{tn("pricing")}</Box>
              <Box component={Link} href="/about" sx={linkSx}>{tn("about")}</Box>
              <Box component={Link} href="/faq" sx={linkSx}>{tn("faq")}</Box>
              <Box component={Link} href="/blog" sx={linkSx}>{tn("blog")}</Box>
              <Box component={Link} href="/contact" sx={linkSx}>{tn("contact")}</Box>
              <Box component={Link} href="/privacy" sx={linkSx}>{t("privacy")}</Box>
              <Box component={Link} href="/terms" sx={linkSx}>{t("terms")}</Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 7, pt: 3, borderTop: "1px solid var(--app-border-soft)", display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            © {year} Revault. {t("rights")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("legal")}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
