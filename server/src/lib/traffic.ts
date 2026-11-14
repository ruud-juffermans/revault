/**
 * Pure helpers behind the admin analytics endpoints: how a page path maps to a
 * site section and how a referrer host maps to a recognisable source. They
 * produce the same shapes as the admin panel's own analytics (its
 * server/src/website/analytics.ts), so revault.nl gets the same traffic view
 * as the other sites there.
 */

const LOCALE_PREFIX = /^\/(nl|en)(?=\/|$)/;

/** Drop query/hash, an optional locale prefix and a trailing slash. */
export function normalisePath(path: string): string {
  let p = path.trim().split(/[?#]/)[0] ?? "";
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(LOCALE_PREFIX, "");
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

/** First path segment → section; Dutch and English slugs (src/i18n/routing.ts) share one. */
const SECTIONS: Record<string, string> = {
  "wallet-herstel": "services",
  "wallet-recovery": "services",
  wallets: "wallets",
  werkwijze: "how-it-works",
  "how-it-works": "how-it-works",
  tarieven: "pricing",
  pricing: "pricing",
  blog: "blog",
  faq: "faq",
  "over-mij": "about",
  about: "about",
  contact: "contact",
};

const SECTION_LABELS: Record<string, string> = {
  home: "Home",
  services: "Wallet recovery",
  wallets: "Wallets",
  "how-it-works": "How it works",
  pricing: "Pricing",
  blog: "Blog",
  faq: "FAQ",
  about: "About",
  contact: "Contact",
  other: "Other",
};

export function sectionOf(path: string): string {
  const p = normalisePath(path);
  if (p === "/") return "home";
  return SECTIONS[p.split("/")[1] ?? ""] ?? "other";
}

export function sectionLabel(section: string): string {
  return SECTION_LABELS[section] ?? section;
}

export interface PageSection {
  section: string;
  label: string;
  count: number;
  pages: Array<{ path: string; section: string; count: number }>;
}

/** Nest path counts under their section, sections ordered by total views. */
export function groupBySection(rows: Array<{ path: string; count: number }>): PageSection[] {
  const bySection = new Map<string, PageSection>();
  for (const row of rows) {
    const section = sectionOf(row.path);
    const entry = bySection.get(section) ?? { section, label: sectionLabel(section), count: 0, pages: [] };
    entry.count += row.count;
    entry.pages.push({ path: row.path, section, count: row.count });
    bySection.set(section, entry);
  }
  return [...bySection.values()].sort((a, b) => b.count - a.count);
}

export type ReferrerKind = "linkedin" | "github" | "google" | "udemy" | "internal" | "direct" | "other";

const OWN_HOSTS = ["revault.nl", "localhost", "127.0.0.1"];

function hostMatches(host: string, domains: string[]): boolean {
  return domains.some((d) => host === d || host.endsWith(`.${d}`));
}

/** "direct" = no referrer at all; "internal" = the site itself. */
export function referrerKind(host: string): ReferrerKind {
  let h = host.toLowerCase().replace(/^www\./, "");
  if (!h) return "direct";
  // Android apps report a reverse-domain package ("com.linkedin.android").
  const pkg = /^com\.(linkedin|google|github|udemy)\./.exec(h);
  if (pkg) h = `${pkg[1]}.com`;
  if (hostMatches(h, ["linkedin.com", "lnkd.in"])) return "linkedin";
  if (hostMatches(h, ["github.com", "github.io"])) return "github";
  if (/^(.*\.)?google\.(com|[a-z]{2,3}|co\.[a-z]{2}|com\.[a-z]{2})$/.test(h) || h === "googleusercontent.com") return "google";
  if (hostMatches(h, ["udemy.com"])) return "udemy";
  if (hostMatches(h, OWN_HOSTS)) return "internal";
  return "other";
}
