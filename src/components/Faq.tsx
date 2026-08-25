"use client";

import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { palette } from "@/theme/theme";

export interface FaqItem {
  q: string;
  a: string;
}

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <>
      {items.map((item) => (
        <Accordion
          key={item.q}
          disableGutters
          elevation={0}
          square
          sx={{
            backgroundColor: "transparent",
            borderBottom: "1px solid var(--app-border-soft)",
            "&::before": { display: "none" },
            "&:first-of-type": { borderTop: "1px solid var(--app-border-soft)" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: palette.accent }} />} sx={{ px: 0, py: 1 }}>
            <Typography component="h3" sx={{ fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: "1.08rem", pr: 2 }}>
              {item.q}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0, pb: 3 }}>
            <Typography variant="body1" sx={{ maxWidth: 780 }}>
              {item.a}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
