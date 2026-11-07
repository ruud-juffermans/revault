import { createTheme } from "@mui/material/styles";

// Fonts loaded via next/font in [locale]/layout.tsx:
//   --font-heading: Plus Jakarta Sans, --font-body: Outfit
//
// Brand: a vault. Deep graphite surfaces, a single amber/gold accent (the
// "key"), generous whitespace. Trust over flash — this is a service people
// reach in a stressful moment.

const ABS = {
  ink: "#0C0F14",
  inkLight: "#151A22",
  inkSurface: "#1D2430",
  white: "#FFFFFF",
};

const LIGHT = {
  bg: "#F7F6F2",
  surface: "#EFEDE6",
  surfaceElevated: "#FCFBF8",
  border: "#DDD9CE",
  borderStrong: "#8E897C", // ≥3:1 on bg for control boundaries
  borderSoft: "#E8E5DB",
  divider: "#ECE9E0",
  gray50: "#F3F1EA",
  gray100: "#EFEDE6",
  gray200: "#DDD9CE",
  gray300: "#C4C0B4",
  gray400: "#5F6674",
  gray500: "#535A68",
  gray600: "#414855",
  gray700: "#2E3440",
  gray800: "#1B2029",
  gray900: "#0C0F14",
  accent: "#8F5E17", // 5.1:1 on bg, white on it 5.6:1 (WCAG AA)
  accentHover: "#7A4F12",
  accentLight: "#D9A441",
  accentMuted: "rgba(143, 94, 23, 0.12)",
  accentGlow: "rgba(143, 94, 23, 0.28)",
  onAccent: "#FFFFFF",
  textPrimary: "#0C0F14",
  textSecondary: "#4A5160",
  textMuted: "#535A68",
  ctaBg: "#0C0F14",
  ctaFg: "#F7F6F2",
};

const DARK = {
  bg: "#0C0F14",
  surface: "#131820",
  surfaceElevated: "#1A202A",
  border: "#2B3342",
  borderStrong: "#4C5668",
  borderSoft: "#202734",
  divider: "#202734",
  gray50: "#1A202A",
  gray100: "#202734",
  gray200: "#2B3342",
  gray300: "#3C4658",
  gray400: "#6B7686",
  gray500: "#96A0B0",
  gray600: "#C3CAD5",
  gray700: "#D8DEE7",
  gray800: "#E7EBF1",
  gray900: "#F4F6F9",
  accent: "#E2B15A",
  accentHover: "#EDC57E",
  accentLight: "#F3D9A6",
  accentMuted: "rgba(226, 177, 90, 0.14)",
  accentGlow: "rgba(226, 177, 90, 0.30)",
  onAccent: "#0C0F14",
  textPrimary: "#F4F6F9",
  textSecondary: "#B8C0CD",
  textMuted: "#96A0B0",
  ctaBg: "#1A202A",
  ctaFg: "#F4F6F9",
};

const cssVarsFor = (t: typeof LIGHT) => ({
  "--app-bg": t.bg,
  "--app-surface": t.surface,
  "--app-surface-elevated": t.surfaceElevated,
  "--app-border": t.border,
  "--app-border-strong": t.borderStrong,
  "--app-border-soft": t.borderSoft,
  "--app-divider": t.divider,
  "--app-gray-50": t.gray50,
  "--app-gray-100": t.gray100,
  "--app-gray-200": t.gray200,
  "--app-gray-300": t.gray300,
  "--app-gray-400": t.gray400,
  "--app-gray-500": t.gray500,
  "--app-gray-600": t.gray600,
  "--app-gray-700": t.gray700,
  "--app-gray-800": t.gray800,
  "--app-gray-900": t.gray900,
  "--app-accent": t.accent,
  "--app-accent-hover": t.accentHover,
  "--app-accent-light": t.accentLight,
  "--app-on-accent": t.onAccent,
  "--app-accent-muted": t.accentMuted,
  "--app-accent-glow": t.accentGlow,
  "--app-text-primary": t.textPrimary,
  "--app-text-secondary": t.textSecondary,
  "--app-text-muted": t.textMuted,
  "--app-cta-bg": t.ctaBg,
  "--app-cta-fg": t.ctaFg,
});

// Public palette: absolute hex + CSS-var references that swap per scheme.
export const palette = {
  ink: ABS.ink,
  inkLight: ABS.inkLight,
  inkSurface: ABS.inkSurface,
  white: ABS.white,
  accent: "var(--app-accent)",
  accentHover: "var(--app-accent-hover)",
  accentLight: "var(--app-accent-light)",
  accentMuted: "var(--app-accent-muted)",
  accentGlow: "var(--app-accent-glow)",
  offWhite: "var(--app-surface)",
  surfaceElevated: "var(--app-surface-elevated)",
  bg: "var(--app-bg)",
  border: "var(--app-border)",
  borderStrong: "var(--app-border-strong)",
  gray50: "var(--app-gray-50)",
  gray100: "var(--app-gray-100)",
  gray200: "var(--app-gray-200)",
  gray300: "var(--app-gray-300)",
  gray400: "var(--app-gray-400)",
  gray500: "var(--app-gray-500)",
  gray600: "var(--app-gray-600)",
  gray700: "var(--app-gray-700)",
  gray800: "var(--app-gray-800)",
  gray900: "var(--app-gray-900)",
};

const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
export const radii = { panel: 24, card: 16, control: 12, pill: 999 };

const heading = "var(--font-heading), 'Segoe UI', sans-serif";

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "data-mui-color-scheme" },
  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        primary: { main: LIGHT.accent, dark: LIGHT.accentHover, light: LIGHT.accentLight, contrastText: ABS.white },
        secondary: { main: ABS.ink, dark: ABS.ink, light: ABS.inkLight },
        background: { default: LIGHT.bg, paper: LIGHT.surface },
        text: { primary: LIGHT.textPrimary, secondary: LIGHT.textSecondary },
        divider: LIGHT.divider,
      },
    },
    dark: {
      palette: {
        mode: "dark",
        primary: { main: DARK.accent, dark: DARK.accentHover, light: DARK.accentLight, contrastText: DARK.onAccent },
        secondary: { main: ABS.inkLight, dark: ABS.ink, light: ABS.inkSurface },
        background: { default: DARK.bg, paper: DARK.surface },
        text: { primary: DARK.textPrimary, secondary: DARK.textSecondary },
        divider: DARK.divider,
      },
    },
  },
  typography: {
    fontFamily: "var(--font-body), 'Segoe UI', sans-serif",
    h1: { fontFamily: heading, fontWeight: 800, fontSize: "clamp(2.5rem, 5.2vw + 1rem, 4.25rem)", lineHeight: 1.04, letterSpacing: "-0.035em" },
    h2: { fontFamily: heading, fontWeight: 700, fontSize: "clamp(1.9rem, 2.6vw + 1rem, 2.75rem)", lineHeight: 1.12, letterSpacing: "-0.025em" },
    h3: { fontFamily: heading, fontWeight: 650, fontSize: "clamp(1.4rem, 1.2vw + 1rem, 1.75rem)", lineHeight: 1.22, letterSpacing: "-0.015em" },
    h4: { fontFamily: heading, fontWeight: 650, fontSize: "1.3rem", lineHeight: 1.3, letterSpacing: "-0.01em" },
    h5: { fontFamily: heading, fontWeight: 600, fontSize: "1.15rem", lineHeight: 1.4 },
    h6: { fontFamily: heading, fontWeight: 600, fontSize: "1.0625rem", lineHeight: 1.4 },
    body1: { fontSize: "1.0625rem", fontWeight: 400, lineHeight: 1.7, color: "var(--app-text-secondary)" },
    body2: { fontSize: "0.95rem", fontWeight: 400, lineHeight: 1.65 },
    subtitle1: { fontSize: "clamp(1.05rem, 0.6vw + 0.9rem, 1.25rem)", lineHeight: 1.6, fontWeight: 400, color: "var(--app-text-secondary)" },
    button: { fontFamily: "var(--font-body), 'Segoe UI', sans-serif", fontWeight: 600, textTransform: "none" as const, letterSpacing: "0.01em" },
    overline: { fontFamily: "var(--font-body), 'Segoe UI', sans-serif", fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase" as const },
  },
  shape: { borderRadius: 12 },
  spacing: 6,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root, [data-mui-color-scheme='light']": cssVarsFor(LIGHT),
        "[data-mui-color-scheme='dark']": cssVarsFor(DARK),
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            animationIterationCount: "1 !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
          ".MuiButton-root:hover, .MuiButton-root:active, .MuiCard-root:hover": { transform: "none !important" },
        },
        html: {
          scrollBehavior: "smooth",
          colorScheme: "light dark",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "optimizeLegibility",
        },
        body: {
          overflowX: "hidden",
          backgroundColor: "var(--app-bg)",
          color: "var(--app-text-primary)",
          WebkitTapHighlightColor: "transparent",
          transition: "background-color 0.3s ease, color 0.3s ease",
        },
        "::selection": { backgroundColor: "var(--app-accent-muted)", color: "var(--app-text-primary)" },
        ":focus-visible": { outline: "2px solid var(--app-accent)", outlineOffset: 2 },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: "lg" },
      styleOverrides: {
        root: { paddingLeft: 20, paddingRight: 20, "@media (min-width:600px)": { paddingLeft: 32, paddingRight: 32 } },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        // MUI resets outline:0 on ButtonBase, which beats the global :focus-visible rule.
        root: { "&.Mui-focusVisible": { outline: "2px solid var(--app-accent)", outlineOffset: 2 } },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radii.pill,
          padding: "10px 26px",
          fontSize: "0.95rem",
          fontWeight: 600,
          minHeight: 44,
          transition: `all 0.25s ${EASE}`,
          "&:active": { transform: "scale(0.98)" },
        },
        sizeLarge: { padding: "14px 34px", fontSize: "1rem", minHeight: 52 },
        sizeSmall: { padding: "7px 18px", fontSize: "0.875rem", minHeight: 38 },
        containedPrimary: {
          backgroundColor: "var(--app-accent)",
          color: "var(--app-on-accent)",
          "@media (hover: hover)": {
            "&:hover": {
              backgroundColor: "var(--app-accent-hover)",
              transform: "translateY(-1px)",
              boxShadow: "0 10px 28px var(--app-accent-glow)",
            },
          },
        },
        outlinedPrimary: {
          borderColor: "var(--app-border-strong)",
          color: "var(--app-text-primary)",
          borderWidth: 1.5,
          "@media (hover: hover)": {
            "&:hover": { borderColor: "var(--app-accent)", backgroundColor: "var(--app-accent-muted)", borderWidth: 1.5 },
          },
        },
        text: {
          color: "var(--app-accent)",
          "@media (hover: hover)": { "&:hover": { backgroundColor: "var(--app-accent-muted)" } },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          display: "block",
          color: "inherit",
          textDecoration: "none",
          backgroundColor: "var(--app-surface-elevated)",
          border: "1px solid var(--app-border-soft)",
          borderRadius: radii.card,
          transition: `transform 0.35s ${EASE}, box-shadow 0.35s ${EASE}, border-color 0.35s`,
          "@media (hover: hover)": {
            "&:hover": { borderColor: "var(--app-border)", boxShadow: "0 16px 44px rgba(12, 15, 20, 0.09)", transform: "translateY(-3px)" },
            "[data-mui-color-scheme='dark'] &:hover": { boxShadow: "0 16px 44px rgba(0, 0, 0, 0.55)" },
          },
          "&:focus-visible": { outline: "2px solid var(--app-accent)", outlineOffset: 2 },
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: "color-mix(in srgb, var(--app-bg) 78%, transparent)",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          borderBottom: "1px solid var(--app-border-soft)",
          color: "var(--app-text-primary)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, borderRadius: radii.pill, fontSize: "0.8125rem" },
        outlined: { borderColor: "var(--app-border-strong)", color: "var(--app-text-secondary)" },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: radii.control,
            "&.Mui-focused": { boxShadow: "0 0 0 4px var(--app-accent-muted)" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--app-accent)", borderWidth: 1.5 },
          },
        },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: "var(--app-divider)" } } },
    MuiTypography: {
      defaultProps: { variantMapping: { subtitle1: "p", subtitle2: "p" } },
      styleOverrides: { overline: { color: "var(--app-accent)" } },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: radii.control } } },
  },
});

export default theme;
