"use client";

import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

// AppRouterCacheProvider flushes emotion's SSR styles into the HTML, so the
// page never paints unstyled first.
export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui", prepend: true }}>
      {/* modeStorageKey must match InitColorSchemeScript in [locale]/layout.tsx, or the page flashes the wrong theme before hydration. */}
      <ThemeProvider theme={theme} defaultMode="light" modeStorageKey="revault-color-mode">
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
