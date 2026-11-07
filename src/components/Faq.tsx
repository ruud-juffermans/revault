"use client";

import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface FaqItem {
  q: string;
  a: string;
}

export default function Faq({ items, headingLevel = "h3" }: { items: FaqItem[]; headingLevel?: "h2" | "h3" }) {
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
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "var(--app-accent)" }} />} sx={{ px: 0, py: 1 }}>
            <Typography variant="h6" component={headingLevel} sx={{ pr: 2 }}>
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
