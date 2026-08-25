"use client";

import { Alert, Box, Button, Checkbox, Container, FormControlLabel, MenuItem, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { submitIntake, type IntakeBody, type IssueType, type WalletType } from "@/lib/api";
import { palette } from "@/theme/theme";

const WALLET_TYPES: WalletType[] = ["software", "hardware", "exchange", "paper", "unknown"];
const ISSUE_TYPES: IssueType[] = ["forgotten-password", "seed-phrase", "damaged-file", "legacy-wallet", "hardware-defect", "inheritance", "other"];

// Secret-free by design: the intake never asks for (and the copy explicitly
// tells the visitor not to share) seed phrases, private keys or passwords.
export default function ContactClient() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [form, setForm] = useState({ name: "", email: "", phone: "", walletType: "" as WalletType | "", walletSoftware: "", issueType: "" as IssueType | "", estimatedValue: "", description: "", consent: false });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [reference, setReference] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: field === "consent" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.walletType || !form.issueType || !form.consent) return;
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
              <Alert severity="success" sx={{ py: 3, px: 4, backgroundColor: palette.accentMuted, border: `1px solid ${palette.accent}`, "& .MuiAlert-icon": { color: palette.accent } }}>
                <Typography variant="h4" component="h2" sx={{ mb: 1 }}>{t("success.title")}</Typography>
                <Typography>{t("success.body", { reference })}</Typography>
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                <Alert severity="warning" sx={{ mb: 3 }}>{t("form.secretWarning")}</Alert>
                {status === "error" && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                  <TextField label={t("form.name")} required fullWidth value={form.name} onChange={set("name")} />
                  <TextField label={t("form.email")} type="email" required fullWidth value={form.email} onChange={set("email")} />
                  <TextField label={t("form.phone")} type="tel" fullWidth value={form.phone} onChange={set("phone")} />
                  <TextField label={t("form.estimatedValue")} fullWidth value={form.estimatedValue} onChange={set("estimatedValue")} helperText={t("form.estimatedValueHelp")} />
                  <TextField select label={t("form.walletType")} required fullWidth value={form.walletType} onChange={set("walletType")}>
                    {WALLET_TYPES.map((w) => <MenuItem key={w} value={w}>{t(`walletTypes.${w}`)}</MenuItem>)}
                  </TextField>
                  <TextField label={t("form.walletSoftware")} fullWidth value={form.walletSoftware} onChange={set("walletSoftware")} placeholder="Ledger, Electrum, MetaMask…" />
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField select label={t("form.issueType")} required fullWidth value={form.issueType} onChange={set("issueType")}>
                      {ISSUE_TYPES.map((i) => <MenuItem key={i} value={i}>{t(`issueTypes.${i}`)}</MenuItem>)}
                    </TextField>
                  </Box>
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <TextField label={t("form.description")} required fullWidth multiline rows={6} value={form.description} onChange={set("description")} placeholder={t("form.descriptionPlaceholder")} />
                  </Box>
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <FormControlLabel control={<Checkbox required checked={form.consent} onChange={set("consent")} />} label={<Typography variant="body2">{t("form.consent")}</Typography>} />
                  </Box>
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Button type="submit" variant="contained" size="large" disabled={status === "loading"} sx={{ px: 7, width: { xs: "100%", sm: "auto" } }}>
                      {status === "loading" ? t("form.submitting") : t("form.submit")}
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ backgroundColor: palette.offWhite, borderRadius: "20px", p: { xs: 4, md: 5 }, border: "1px solid var(--app-border-soft)", alignSelf: "start" }}>
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
