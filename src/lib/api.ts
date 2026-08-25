// The platform API (ruudjuffermans-server, api.ruudjuffermans.nl) — this
// site's backend is its "revault" module. Production bakes the absolute origin
// in at build time; in dev this stays "" and the Next rewrite proxies /api/*
// to the local platform server (see next.config.ts).
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data as T;
}

export type WalletType =
  | "software"
  | "hardware"
  | "exchange"
  | "paper"
  | "unknown";

export type IssueType =
  | "forgotten-password"
  | "seed-phrase"
  | "damaged-file"
  | "legacy-wallet"
  | "hardware-defect"
  | "inheritance"
  | "other";

// The intake form. Deliberately no field for secrets: we never ask for seed
// phrases, private keys or passwords over the web (see PRD §7).
export interface IntakeBody {
  name: string;
  email: string;
  phone?: string;
  walletType: WalletType;
  walletSoftware?: string;
  issueType: IssueType;
  estimatedValue?: string;
  description: string;
  locale: string;
  consent: true;
}

export async function submitIntake(body: IntakeBody) {
  return request<{ success: boolean; reference: string }>("/api/revault/intake", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Fire-and-forget page-view beacon. Never throws.
export function recordPageView(path: string, locale?: string) {
  const body = JSON.stringify({
    path,
    locale,
    referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
  });
  void fetch(`${API_URL}/api/revault/analytics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
