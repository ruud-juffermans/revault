// The recovery services and the wallet landing pages. Copy lives in
// messages/{nl,en}.json under `services.<slug>` and `wallets.<slug>`; this
// module only defines the slugs (routing, sitemap, nav) and the relations.

export const SERVICE_SLUGS = [
  "password-recovery",
  "seed-phrase-reconstruction",
  "damaged-wallet",
  "legacy-wallet",
  "hardware-wallet",
  "inheritance",
] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const WALLET_SLUGS = [
  "ledger",
  "trezor",
  "metamask",
  "electrum",
  "bitcoin-core",
  "blockchain-com",
  "multibit",
  "jaxx",
] as const;
export type WalletSlug = (typeof WALLET_SLUGS)[number];

/** Which services are most relevant for a given wallet landing page. */
export const WALLET_SERVICES: Record<WalletSlug, ServiceSlug[]> = {
  ledger: ["hardware-wallet", "seed-phrase-reconstruction", "password-recovery"],
  trezor: ["hardware-wallet", "seed-phrase-reconstruction", "password-recovery"],
  metamask: ["password-recovery", "seed-phrase-reconstruction"],
  electrum: ["password-recovery", "damaged-wallet", "seed-phrase-reconstruction"],
  "bitcoin-core": ["password-recovery", "damaged-wallet", "legacy-wallet"],
  "blockchain-com": ["password-recovery", "legacy-wallet"],
  multibit: ["legacy-wallet", "damaged-wallet", "password-recovery"],
  jaxx: ["legacy-wallet", "seed-phrase-reconstruction"],
};

export function isServiceSlug(s: string): s is ServiceSlug {
  return (SERVICE_SLUGS as readonly string[]).includes(s);
}
export function isWalletSlug(s: string): s is WalletSlug {
  return (WALLET_SLUGS as readonly string[]).includes(s);
}
