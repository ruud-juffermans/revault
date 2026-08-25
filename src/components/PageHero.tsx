import { Box, Container, Typography } from "@mui/material";

/** Shared page header: eyebrow, h1, lede. */
export default function PageHero({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <Box sx={{ pt: { xs: 10, md: 14 }, pb: { xs: 6, md: 8 } }}>
      <Container>
        <Box sx={{ maxWidth: 760 }}>
          {eyebrow && (
            <Typography variant="overline" sx={{ mb: 2, display: "block" }}>
              {eyebrow}
            </Typography>
          )}
          <Typography variant="h1" sx={{ mb: 3 }}>
            {title}
          </Typography>
          {subtitle && <Typography variant="subtitle1">{subtitle}</Typography>}
          {children}
        </Box>
      </Container>
    </Box>
  );
}
