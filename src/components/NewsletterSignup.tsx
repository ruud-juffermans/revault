"use client";

import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { subscribeNewsletter, type NewsletterSource } from "@/lib/api";

/**
 * Newsletter signup: one e-mail field. `source` tells the admin panel where
 * the signup came from. Compact in the footer, a full card on the blog index.
 */
export default function NewsletterSignup({ source, variant = "compact" }: { source: NewsletterSource; variant?: "compact" | "card" }) {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      setMessage(t("invalidEmail"));
      return;
    }
    setStatus("loading");
    try {
      await subscribeNewsletter({ email: email.trim(), locale, source, website: website || undefined });
      setStatus("success");
      setMessage(t("success"));
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(t("error"));
    }
  };

  const card = variant === "card";
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      noValidate
      aria-label={t("title")}
      sx={card ? { p: { xs: 3, md: 4 }, borderRadius: "16px", border: "1px solid var(--app-border-soft)", backgroundColor: "var(--app-surface)" } : undefined}
    >
      <Typography variant={card ? "h4" : "overline"} component={card ? "h2" : "p"} sx={{ display: "block", mb: card ? 1 : 1.5 }}>
        {t("title")}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, maxWidth: 520 }}>
        {t("body")}
      </Typography>
      {/* Honeypot: hidden from humans and screen readers; the server drops submissions that fill it. */}
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
      {status === "success" ? (
        <Alert severity="success" sx={{ maxWidth: 520 }}>{message}</Alert>
      ) : (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start", maxWidth: 520 }}>
          <TextField
            type="email"
            label={t("emailLabel")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            autoComplete="email"
            error={status === "error"}
            helperText={status === "error" ? message : undefined}
            sx={{ flex: "1 1 220px" }}
          />
          <Button type="submit" variant={card ? "contained" : "outlined"} disabled={status === "loading"} sx={{ minHeight: 40 }}>
            {status === "loading" ? t("submitting") : t("submit")}
          </Button>
        </Box>
      )}
      <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: "text.secondary" }}>
        {t("privacy")}
      </Typography>
    </Box>
  );
}
