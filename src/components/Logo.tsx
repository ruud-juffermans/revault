import { Box } from "@mui/material";

// Vault mark: a rounded square with a keyhole. Accent-colored so it follows
// the color scheme.
export default function Logo({ size = 26 }: { size?: number }) {
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1.25 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable="false" style={{ display: "block", flexShrink: 0 }}>
        <rect x="2" y="2" width="28" height="28" rx="8" fill="var(--app-accent)" />
        <circle cx="16" cy="13" r="4" fill="var(--app-on-accent)" />
        <path d="M14 15.5h4l1.5 8h-7z" fill="var(--app-on-accent)" />
      </svg>
      <Box
        component="span"
        sx={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.03em", color: "text.primary" }}
      >
        revault
      </Box>
    </Box>
  );
}
