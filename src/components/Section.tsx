import { Box, Container, Typography, type SxProps } from "@mui/material";

/** A vertically padded page section with an optional eyebrow + heading. */
export default function Section({ eyebrow, title, lede, children, sx, tone = "default" }: { eyebrow?: string; title?: string; lede?: string; children: React.ReactNode; sx?: SxProps; tone?: "default" | "surface" }) {
  return (
    <Box component="section" sx={{ py: { xs: 9, md: 13 }, backgroundColor: tone === "surface" ? "var(--app-surface)" : "transparent", ...sx }}>
      <Container>
        {(eyebrow || title) && (
          <Box sx={{ maxWidth: 720, mb: { xs: 5, md: 7 } }}>
            {eyebrow && (
              <Typography variant="overline" sx={{ display: "block", mb: 1.5 }}>
                {eyebrow}
              </Typography>
            )}
            {title && (
              <Typography variant="h2" sx={{ mb: lede ? 2 : 0 }}>
                {title}
              </Typography>
            )}
            {lede && <Typography variant="subtitle1">{lede}</Typography>}
          </Box>
        )}
        {children}
      </Container>
    </Box>
  );
}
