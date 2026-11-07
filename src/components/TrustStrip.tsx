import { Box, Container, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/CheckCircleOutline";
import { useTranslations } from "next-intl";

/** The three promises repeated on every page: no cure no pay, non-custodial, on-site or remote. */
export default function TrustStrip() {
  const t = useTranslations("trust");
  const items = ["noCureNoPay", "nonCustodial", "onSiteOrRemote", "contractFirst"] as const;
  return (
    <Box component="aside" sx={{ borderTop: "1px solid var(--app-border-soft)", borderBottom: "1px solid var(--app-border-soft)", py: 3 }}>
      <Container>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 3 }}>
          {items.map((k) => (
            <Box key={k} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <CheckIcon sx={{ color: "var(--app-accent)", fontSize: 22, mt: 0.25 }} />
              <Box>
                <Typography sx={{ fontWeight: 650, fontSize: "0.95rem", color: "text.primary" }}>{t(`${k}.title`)}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>{t(`${k}.body`)}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
