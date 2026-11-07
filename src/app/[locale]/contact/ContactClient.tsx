"use client";

import { Alert, Box, Button, Checkbox, Container, FormControlLabel, MenuItem, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { submitIntake, type IntakeBody, type IssueType, type WalletType } from "@/lib/api";
import { radii } from "@/theme/theme";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { FOUNDER } from "@/lib/founder";

// "exchange" intentionally omitted: exchange accounts are not wallets Revault recovers (see FAQ).
const WALLET_TYPES: WalletType[] = ["software", "hardware", "paper", "unknown"];
const ISSUE_TYPES: IssueType[] = ["forgotten-password", "seed-phrase", "damaged-file", "legacy-wallet", "hardware-defect", "inheritance", "other"];

// Secret-free by design: the intake never asks for (and the copy explicitly
// tells the visitor not to share) seed phrases, private keys or passwords.
export default function ContactClient() {
  const t = useTranslations("contact");
  const tfo = useTranslations("founder");
  const locale = useLocale();
  const [form, setForm] = useState({ name: "", email: "", phone: "", walletType: "" as WalletType | "", walletSoftware: "", issueType: "" as IssueType | "", estimatedValue: "", description: "", consent: false, website: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [reference, setReference] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [touched, setTouched] = useState(false);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const missing = { name: !form.name.trim(), email: !emailOk, description: !form.description.trim(), walletType: !form.walletType, issueType: !form.issueType, consent: !form.consent };
  const hasMissing = Object.values(missing).some(Boolean);
  const showError = (k: keyof typeof missing) => touched && missing[k];

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: field === "consent" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (hasMissing || !form.walletType || !form.issueType) {
      setStatus("idle");
      setErrorMsg(t("form.missingFields"));
      // Banner sits above the fold; move the user to the first invalid control.
      requestAnimationFrame(() => (e.currentTarget as HTMLFormElement | null)?.querySelector<HTMLElement>(".Mui-error input, .Mui-error textarea, .Mui-error [role=combobox]")?.focus());
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const body: IntakeBody = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        walletType: form.walletType,
        walletSoftware: form.walletSoftware || undefined,
        issueType: form.issueType,
        estimatedValue: form.estimatedValue || undefined,
        description: form.description,
        locale,
        consent: true,
        website: form.website || undefined,
      };
      const res = await submitIntake(body);
      setReference(res.reference);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : t("form.genericError"));
    }
  };

  return (
    <Box sx={{ pt: { xs: 10, md: 14 }, pb: { xs: 10, md: 14 } }}>
      <Container>
        <Box sx={{ maxWidth: 640, mb: { xs: 6, md: 8 } }}>
          <Typography variant="overline" sx={{ mb: 2, display: "block" }}>{t("eyebrow")}</Typography>
          <Typography variant="h1" sx={{ mb: 3 }}>{t("title")}</Typography>
          <Typography variant="subtitle1">{t("subtitle")}</Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 8, gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" } }}>
          <Box>
            {status === "success" ? (
              <Alert severity="success" sx={{ py: 3, px: 4, backgroundColor: "var(--app-accent-muted)", border: "1px solid var(--app-accent)", "& .MuiAlert-icon": { color: "var(--app-accent)" } }}>
                <Typography variant="h4" component="h2" sx={{ mb: 1 }}>{t("success.title")}</Typography>
                <Typography>{t("success.body", { reference })}</Typography>
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Alert severity="warning" sx={{ mb: 3 }}>{t("form.secretWarning")}</Alert>
                {errorMsg && <Alert severity="error" role="alert" sx={{ mb: 3 }}>{errorMsg}</Alert>}
                {/* Honeypot: hidden from humans and screen readers; bots that fill it are dropped server-side. */}
                <input type="text" name="website" value={form.website} onChange={set("website")} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                  <TextField label={t("form.name")} required fullWidth value={form.name} onChange={set("name")} error={showError("name")} helperText={showError("name") ? t("form.required") : undefined} autoComplete="name" />
                  <TextField label={t("form.email")} type="email" required fullWidth value={form.email} onChange={set("email")} error={showError("email")} helperText={showError("email") ? t("form.invalidEmail") : undefined} autoComplete="email" />
                  <TextField label={t("form.phone")} type="tel" fullWidth value={form.phone} onChange={set("phone")} />
                  <TextField select label={t("form.walletType")} required fullWidth value={form.walletType} onChange={set("walletType")} error={showError("walletType")} helperText={showError("walletType") ? t("form.required") : undefined}>
                    {WALLET_TYPES.map((w) => <MenuItem key={w} value={w}>{t(`walletTypes.${w}`)}</MenuItem>)}
                  </TextField>
                  <TextField label={t("form.walletSoftware")} fullWidth value={form.walletSoftware} onChange={set("walletSoftware")} placeholder="Ledger, Electrum, MetaMask…" />
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField select label={t("form.issueType")} required fullWidth value={form.issueType} onChange={set("issueType")} error={showError("issueType")} helperText={showError("issueType") ? t("form.required") : undefined}>
                      {ISSUE_TYPES.map((i) => <MenuItem key={i} value={i}>{t(`issueTypes.${i}`)}</MenuItem>)}
                    </TextField>
                  </Box>
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField label={t("form.description")} required fullWidth multiline rows={6} value={form.description} onChange={set("description")} placeholder={t("form.descriptionPlaceholder")} error={showError("description")} helperText={showError("description") ? t("form.required") : undefined} />
                  </Box>
                  <TextField label={t("form.estimatedValue")} fullWidth value={form.estimatedValue} onChange={set("estimatedValue")} helperText={t("form.estimatedValueHelp")} />
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <FormControlLabel
                      control={<Checkbox checked={form.consent} onChange={set("consent")} sx={showError("consent") ? { color: "error.main" } : undefined} />}
                      label={
                        <Typography variant="body2" sx={showError("consent") ? { color: "error.main" } : undefined}>
                          {t.rich("form.consent", { privacy: (chunks) => <Link href="/privacy" style={{ color: "var(--app-accent)" }}>{chunks}</Link> })} *
                        </Typography>
                      }
                    />
                    {showError("consent") && <Typography variant="caption" sx={{ color: "error.main", display: "block", ml: 4 }}>{t("form.required")}</Typography>}
                  </Box>
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Button type="submit" variant="contained" size="large" disabled={status === "loading"} sx={{ width: { xs: "100%", sm: "auto" } }}>
                      {status === "loading" ? t("form.submitting") : t("form.submit")}
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ backgroundColor: "var(--app-surface)", borderRadius: `${radii.card}px`, p: { xs: 4, md: 5 }, border: "1px solid var(--app-border-soft)", alignSelf: "start" }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
              <Image src={FOUNDER.portrait.src} width={64} height={76} alt={tfo("portraitAlt")} sizes="64px" style={{ width: 64, height: 76, objectFit: "cover", borderRadius: 12, border: "1px solid var(--app-border-soft)", flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>{t("aside.personal")}</Typography>
            </Box>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>{t("aside.title")}</Typography>
            <Box component="ol" sx={{ pl: 2.5, display: "grid", gap: 1.5, mb: 3 }}>
              {(["one", "two", "three"] as const).map((k) => <Typography component="li" key={k} variant="body2">{t(`aside.steps.${k}`)}</Typography>)}
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{t("aside.direct")}</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
