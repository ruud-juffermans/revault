"use client";

import { AppBar, Toolbar, Button, Box, Container, IconButton, Drawer, Divider } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import ThemeSwitcher from "./ThemeSwitcher";

type StaticPathname = Exclude<AppPathname, `${string}[${string}]${string}`>;

export default function Header() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const navItems: { label: string; href: StaticPathname }[] = [
    { label: t("services"), href: "/services" },
    { label: t("howItWorks"), href: "/how-it-works" },
    { label: t("pricing"), href: "/pricing" },
    { label: t("about"), href: "/about" },
    { label: t("faq"), href: "/faq" },
    { label: t("blog"), href: "/blog" },
  ];

  return (
    <AppBar position="sticky">
      <Container>
        <Toolbar disableGutters sx={{ justifyContent: "space-between", minHeight: { xs: 60, lg: 68 } }}>
          <Box component={Link} href="/" aria-label="Revault" sx={{ textDecoration: "none", display: "flex" }}>
            <Logo />
          </Box>

          <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 0.5 }}>
            {navItems.map((item) => (
              <Button key={item.href} component={Link} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} sx={{ color: "text.primary", fontWeight: 500, px: 1.75, "&[aria-current=page]": { color: "var(--app-accent)", fontWeight: 600 } }}>
                {item.label}
              </Button>
            ))}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1.5 }}>
              <ThemeSwitcher />
              <LanguageSwitcher />
              <Button component={Link} href="/contact" variant="contained" size="small" sx={{ ml: 1 }}>
                {t("cta")}
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center", gap: 1 }}>
            <Button component={Link} href="/contact" variant="contained" size="small">
              {t("cta")}
            </Button>
            <IconButton onClick={() => setOpen(true)} aria-label={t("openMenu")} sx={{ width: 44, height: 44 }}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: "min(360px, 100vw)", p: 3 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Logo />
          <IconButton onClick={() => setOpen(false)} aria-label={t("closeMenu")}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {navItems.map((item) => (
            <Button key={item.href} component={Link} href={item.href} onClick={() => setOpen(false)} aria-current={isActive(item.href) ? "page" : undefined} sx={{ justifyContent: "flex-start", color: "text.primary", fontSize: "1.05rem", "&[aria-current=page]": { color: "var(--app-accent)", fontWeight: 600 } }}>
              {item.label}
            </Button>
          ))}
        </Box>
        <Divider sx={{ my: 3 }} />
        <Button component={Link} href="/contact" variant="contained" fullWidth onClick={() => setOpen(false)}>
          {t("cta")}
        </Button>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 3 }}>
          <ThemeSwitcher />
          <LanguageSwitcher />
        </Box>
      </Drawer>
    </AppBar>
  );
}
