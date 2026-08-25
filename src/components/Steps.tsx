import { Box, Typography } from "@mui/material";

export interface Step {
  title: string;
  body: string;
}

/** Numbered process steps (intake → verification → agreement → recovery → handover). */
export default function Steps({ steps }: { steps: Step[] }) {
  return (
    <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(auto-fit, minmax(220px, 1fr))" } }}>
      {steps.map((s, i) => (
        <Box component="li" key={s.title} sx={{ p: 3.5, borderRadius: 2.5, border: "1px solid var(--app-border-soft)", backgroundColor: "var(--app-surface-elevated)" }}>
          <Typography variant="overline" sx={{ display: "block", mb: 1 }}>
            {String(i + 1).padStart(2, "0")}
          </Typography>
          <Typography variant="h5" component="h3" sx={{ mb: 1 }}>
            {s.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {s.body}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
