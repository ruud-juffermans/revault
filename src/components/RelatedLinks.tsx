import { Box, Typography } from "@mui/material";
import ArrowIcon from "@mui/icons-material/ArrowForward";
import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { radii } from "@/theme/theme";

type LinkHref = ComponentProps<typeof Link>["href"];
export interface RelatedLink { label: string; href: LinkHref }

/** Contextual cluster links (service ↔ wallet ↔ article). Rendered as an <aside> so extractors keep <main> focused on the page's own content. */
export default function RelatedLinks({ title, items }: { title: string; items: RelatedLink[] }) {
  if (!items.length) return null;
  return (
    <Box component="aside" aria-label={title} sx={{ mt: 6, pt: 5, borderTop: "1px solid var(--app-border-soft)" }}>
      <Typography variant="h4" component="h2" sx={{ mb: 2.5 }}>{title}</Typography>
      <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        {items.map((it) => (
          <Box component="li" key={it.label}>
            <Box
              component={Link}
              href={it.href}
              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, minHeight: 48, px: 2.5, py: 1.5, borderRadius: `${radii.control}px`, border: "1px solid var(--app-border-strong)", color: "text.primary", textDecoration: "none", fontWeight: 600, "@media (hover: hover)": { "&:hover": { borderColor: "var(--app-accent)", backgroundColor: "var(--app-accent-muted)" } } }}
            >
              <span>{it.label}</span>
              <ArrowIcon aria-hidden sx={{ fontSize: 18, color: "var(--app-accent)" }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
