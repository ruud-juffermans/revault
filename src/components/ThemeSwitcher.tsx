"use client";

import * as React from "react";
import { IconButton, Tooltip, Skeleton } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useTranslations } from "next-intl";

export default function ThemeSwitcher() {
  const { mode, systemMode, setMode } = useColorScheme();
  const t = useTranslations("common");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted || !mode) return <Skeleton variant="circular" width={32} height={32} />;

  const effective = mode === "system" ? (systemMode ?? "light") : mode;
  const label = effective === "dark" ? t("themeLight") : t("themeDark");

  return (
    <Tooltip title={label} arrow>
      <IconButton
        size="small"
        onClick={() => setMode(effective === "dark" ? "light" : "dark")}
        aria-label={label}
        sx={{ width: 32, height: 32, border: "1px solid var(--app-border-strong)", color: "text.secondary", "& svg": { fontSize: 18 } }}
      >
        {effective === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
}
