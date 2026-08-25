import { Box } from "@mui/material";

/** "Skip to content" link (WCAG 2.4.1): hidden until keyboard-focused. */
export default function SkipLink({ label }: { label: string }) {
  return (
    <Box
      component="a"
      href="#main"
      sx={{
        position: "fixed",
        top: 12,
        left: 12,
        zIndex: 2000,
        px: 2.5,
        py: 1.25,
        borderRadius: 999,
        backgroundColor: "var(--app-surface-elevated)",
        color: "var(--app-text-primary)",
        border: "1px solid var(--app-border)",
        fontWeight: 600,
        fontSize: "0.9rem",
        textDecoration: "none",
        transform: "translateY(-200%)",
        "&:focus-visible": { transform: "translateY(0)" },
      }}
    >
      {label}
    </Box>
  );
}
