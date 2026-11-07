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

/** Wallet pages that are relevant for a given service (inverse of WALLET_SERVICES). */
export const SERVICE_WALLETS: Record<ServiceSlug, WalletSlug[]> = SERVICE_SLUGS.reduce((acc, s) => {
  acc[s] = WALLET_SLUGS.filter((w) => WALLET_SERVICES[w].includes(s));
  return acc;
}, {} as Record<ServiceSlug, WalletSlug[]>);

/** Blog posts (by slug) that belong to a service or wallet page — the pillar/cluster links. */
export const SERVICE_POSTS: Partial<Record<ServiceSlug, string[]>> = {
  "password-recovery": ["wallet-toegang-kwijt-eerste-stappen", "wallet-dat-bitcoin-core-herstel"],
  "seed-phrase-reconstruction": ["wallet-toegang-kwijt-eerste-stappen"],
  "damaged-wallet": ["wallet-dat-bitcoin-core-herstel"],
  "legacy-wallet": ["wallet-dat-bitcoin-core-herstel"],
  "hardware-wallet": ["wallet-toegang-kwijt-eerste-stappen"],
  inheritance: ["crypto-wallet-geerfd-nabestaanden"],
};
export const WALLET_POSTS: Partial<Record<WalletSlug, string[]>> = {
  "bitcoin-core": ["wallet-dat-bitcoin-core-herstel"],
  ledger: ["wallet-toegang-kwijt-eerste-stappen"],
  trezor: ["wallet-toegang-kwijt-eerste-stappen"],
};
/** Which service/wallet pages a blog post should link to (inverse of the two maps above). */
export function postRelations(slug: string): { services: ServiceSlug[]; wallets: WalletSlug[] } {
  return {
    services: SERVICE_SLUGS.filter((s) => SERVICE_POSTS[s]?.includes(slug)),
    wallets: WALLET_SLUGS.filter((w) => WALLET_POSTS[w]?.includes(slug)),
  };
}

export function isServiceSlug(s: string): s is ServiceSlug {
  return (SERVICE_SLUGS as readonly string[]).includes(s);
}
export function isWalletSlug(s: string): s is WalletSlug {
  return (WALLET_SLUGS as readonly string[]).includes(s);
}
