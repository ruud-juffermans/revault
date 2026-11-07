# revault.nl — SEO review (agency-agents)

Two personas from `agency-agents/marketing/` reviewed the site on 2026-08-25 against source + the dev server.



---

# 1. SEO Specialist (technical + on-page)

I now have everything I need: source, rendered heads for 14 URLs, sitemap (56 URLs), robots, status codes, copy, blog content, and the component tree. Here is the audit.

# SEO Audit — revault.nl (Next.js 15 + next-intl, NL primary / EN)

Scope: code in `/Users/ruudjuffermans/Projects/revault/src`, copy in `messages/{nl,en}.json`, blog MDX, and rendered HTML from `http://localhost:3001` for `/`, `/wallet-herstel`, `/wallet-herstel/password-recovery`, `/tarieven`, `/werkwijze`, `/contact`, `/faq`, `/blog`, `/blog/wallet-dat-bitcoin-core-herstel`, `/wallets/ledger`, `/over-ons`, `/privacy`, `/en`, `/en/blog/…`, `/en/wallets/ledger`, plus `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`. No GSC access, so cannibalization is assessed with the sitemap + title/H1 method.

---

## Prioritized findings

### CRITICAL

**C1. Wallet landing pages are thin, templated near-duplicates (16 indexable URLs).**
`src/app/[locale]/wallets/[slug]/page.tsx:55-63` renders only: H1, one ~20-word intro sentence (`messages/nl.json:391-443`), a `TrustStrip` shared by every page, and 2–3 `ServiceCard`s whose text is identical to the cards on `/wallet-herstel` and `/`. `/wallets/ledger`, `/wallets/trezor`, `/wallets/metamask` etc. differ by roughly 25 unique words. This is exactly the "doorway / scaled templated content" pattern the Helpful Content system demotes, and it dilutes the site-wide quality signal for the money pages too.
Fix (pick one, in order of preference):
1. Give each wallet page real substance (target 500–800 words NL): "Veelvoorkomende problemen met [wallet]" (3–4 H2s: kapot apparaat, pincode/passphrase vergeten, herstelzin met fouten, oude firmware/app), "Wat wij van u nodig hebben", "Wat niet kan", 3 wallet-specific FAQs (with `FAQPage` JSON-LD), and a contextual link to the matching blog post (e.g. bitcoin-core → `/blog/wallet-dat-bitcoin-core-herstel`). Add a `wallets.<slug>.sections[]` structure in messages and render it in the page.
2. Until that copy exists, add `robots: { index: false, follow: true }` in `generateMetadata` (`wallets/[slug]/page.tsx:26-31`) and drop `WALLET_SLUGS` from `src/app/sitemap.ts:25`. Do not ship 16 thin URLs to a fresh domain.

**C2. `NEXT_PUBLIC_SITE_URL` falls back to `http://localhost:3001` — every canonical, hreflang, og:url, JSON-LD `url` and the sitemap/robots reference derive from it.**
`src/lib/seo.ts:4` `export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";` and `.env.example` sets it to localhost. If the production build is missing this var, the site will canonicalize itself to localhost and Google will drop every page. Fix: fail the build when unset in production, e.g. in `seo.ts`:
```ts
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) throw new Error("NEXT_PUBLIC_SITE_URL is required");
```
and set `NEXT_PUBLIC_SITE_URL=https://revault.nl` in the deploy environment. Add a post-deploy smoke test that greps `<link rel="canonical"` for `https://revault.nl`.

### HIGH

**H1. `og:image` / `twitter:image` are missing on every page except `/` and `/en`.**
Rendered `<head>` of `/wallet-herstel`, `/tarieven`, `/wallets/ledger`, blog posts etc. has no `og:image`. Cause: each page's `generateMetadata` returns its own `openGraph` object (`src/lib/page.ts:15`, `src/lib/seo.ts:40-47`), which replaces the layout's `openGraph` field wholesale, and the file-convention image from `src/app/[locale]/opengraph-image.tsx` is not carried into the child metadata. Shared links (WhatsApp/LinkedIn — where inheritance cases and notaries come from) will render text-only. Fix in `src/lib/seo.ts` `buildOpenGraph`:
```ts
images: [{ url: `${SITE_URL}/${locale}/opengraph-image`, width: 1200, height: 630, alt: "Revault — Crypto wallet herstel" }],
```
and also add `twitter: { card: "summary_large_image", images: [...] }` in `staticPageMetadata`. Note the OG route path is `/{locale}/opengraph-image` even for NL (as-needed prefix does not apply to metadata files) — verify after fix with `curl -I /nl/opengraph-image`.

**H2. E-E-A-T: no verifiable company or people behind a trust-critical service.**
- Footer literally says `"Gevestigd in Nederland · KvK-nummer volgt"` (`messages/nl.json:38`) — a placeholder that reads as a red flag to exactly the notaris/erfgenaam audience the copy targets.
- No address, no e-mail, no phone anywhere in copy (grep on `@revault`, `telefoon`, `adres` finds only form labels).
- `/over-ons` (`src/app/[locale]/about/page.tsx`) has no founder/engineer names, credentials, photo, or history.
- `Article` JSON-LD author is the Organization (`blog/[slug]/page.tsx:49`); no Person, no author bio on posts.
- `ProfessionalService` schema (`layout.tsx:54-62`) has no `address`, `telephone`, `email`, `legalName`, `vatID`/`taxID`, `sameAs`, `logo`, `foundingDate`.
Fix: publish KvK + BTW + address + e-mail in the footer and on `/contact` and `/over-ons`; add a "Wie zit er achter Revault" section with at least one named specialist and a short bio (link to LinkedIn); add `author: { "@type": "Person", name, url }` and `dateModified` to Article; extend the org schema (see S1). Consider a "Zo werken wij met notarissen" page — that is the highest-trust referral channel and a natural E-E-A-T asset.

**H3. H1s and titles on money pages carry no query terms.**
Rendered H1s: `/` "Weer toegang tot de wallet die van u is.", `/tarieven` "No cure, no pay.", `/werkwijze` "Van eerste contact tot overdracht.", `/over-ons` "Herstel, zonder het schimmige deel.", `/blog` "Gidsen en inzichten", `/contact` "Vertel ons wat er is gebeurd." Brand voice is good, but Google leans heavily on H1 + title for topical relevance, and none of these contains "crypto wallet herstel", "bitcoin wallet", "wachtwoord", etc. Fix (keep the voice, add the entity), e.g. `messages/nl.json:73` `home.hero.title` → "Crypto wallet herstel: weer toegang tot de wallet die van u is." ; `pricing.title` (`nl.json:477`) → "Tarieven voor wallet herstel: no cure, no pay." ; `howItWorks.title` → "Zo werkt crypto wallet herstel bij Revault" ; `blog.title` → "Gidsen over wallet herstel en toegang".

**H4. Internal linking is nav/footer-only; no contextual cluster links.**
Every page has the same ~28 footer links (rendered link lists are identical across pages), but: blog posts link only to `/contact` (0–2 links per post, `grep -c` shows 0/1/1/2); service pages do not link to related wallet pages or blog posts; wallet pages do not link to the blog post that covers them (`/wallets/bitcoin-core` ↔ `/blog/wallet-dat-bitcoin-core-herstel`, `/wallet-herstel/inheritance` ↔ `/blog/crypto-wallet-geerfd-nabestaanden`). Sitewide boilerplate links carry little weight; in-content links define the pillar/cluster. Fix: add a "Gerelateerd" block to `services/[slug]/page.tsx` and `wallets/[slug]/page.tsx` (use `WALLET_SERVICES` in reverse plus a `relatedPosts` list), and add 3–5 inline links per blog post to `/wallet-herstel/<slug>` and `/wallets/<slug>` with descriptive anchors ("wachtwoordherstel voor wallet.dat").

### MEDIUM

**M1. Sitemap `lastmod` is the build timestamp for all static/service/wallet pages.**
`src/app/sitemap.ts:8` `const BUILD_DATE = new Date();` — every deploy rewrites lastmod for 48 URLs. Google documents that it ignores lastmod when it is consistently inaccurate, which also hurts the blog entries that are correct. Fix: keep a `lastModified` per route (e.g. a map in `sitemap.ts`, or read git mtime of the messages file), or omit lastmod on static entries.

**M2. Latent hreflang/canonical conflict on blog fallback.**
`src/lib/seo.ts:50-52` `fallbackAlternates` cross-canonicalizes `/en/blog/<slug>` to the NL URL with no hreflang, while `sitemap.ts:26` still lists `/en/blog/<slug>` with `hreflang="en"` pointing at it, and the NL post's `<head>` also declares `hreflang="en"` → that URL. A canonical pointing away from a URL that other pages declare as their `en` alternate is a contradictory set; Google discards it. Today all 4 posts have EN files so it is dormant, but the first NL-only post will trigger it. Fix: in `sitemap.ts` build per-locale entries from `getBlogPosts(locale)` and only emit the `en` alternate when `resolveFile("en", slug).usedFallback === false`; in `blog/[slug]/page.tsx:28` when `usedFallback` is true also set `robots: { index: false }` (a Dutch article under `<html lang="en">` is a mixed-language document — see also M3).

**M3. `/en/blog` lists Dutch posts under `lang="en"` when fallback triggers.**
`src/lib/content.ts:50-51` merges NL slugs into the EN listing. Same mixed-language risk as M2; either hide fallback posts from the EN index or mark the card with `lang="nl"`.

**M4. Heading hierarchy skips levels on hub pages.**
`/wallet-herstel`: h1 → h3 (service cards) with no h2 (`services/page.tsx:34-40` renders `<Section>` without `title`; `ServiceCard.tsx:10` hardcodes h3). `/werkwijze`: h1 → h3 (`Steps.tsx:18` hardcodes h3). FAQ accordion headings are inside a `<button>` (`Faq.tsx:27-30`) — valid but unusual; fine to leave. Fix: give those `<Section>`s a `title` (h2) — e.g. "Onze hersteldiensten" and "De vijf stappen" — or make `ServiceCard`/`Steps` accept a `headingLevel` prop.

**M5. Duplicate `FAQPage` schema (home and `/faq` share 6 identical questions).**
`src/app/[locale]/page.tsx:38` and `faq/page.tsx:26`. Since Aug 2023 Google only shows FAQ rich results for authoritative government/health sites, so the markup has near-zero SERP value and the duplication is pure risk. Fix: keep `FAQPage` on `/faq` only (it still helps AI Overview/LLM extraction) and remove it from the home page. Keep the visible accordion.

**M6. No `BreadcrumbList` anywhere.**
Service, wallet and blog pages are 2 levels deep with localized parent paths. Add `BreadcrumbList` JSON-LD (Home → Wallet herstel → Wachtwoordherstel; Home → Blog → post) in `services/[slug]`, `wallets/[slug]`, `blog/[slug]`; use `absoluteUrl()` from `seo.ts` so the localized paths are correct. Optional visible breadcrumb above `PageHero`.

**M7. Titles and descriptions: length and template issues.**
- Blog post titles are frontmatter + " · Revault": `"wallet.dat gevonden: wat er te herstellen valt uit een oude Bitcoin Core wallet · Revault"` = 99 chars (truncates ~60). Add an optional `metaTitle` frontmatter field and use it in `blog/[slug]/page.tsx:26`; e.g. "wallet.dat herstellen: oude Bitcoin Core wallet openen".
- `/over-ons` title is "Over Revault · Revault" (brand twice) — use `title: { absolute: "Over Revault — crypto wallet herstel in Nederland" }`.
- Home NL description is 185 chars (`nl.json:70`), services hub 175 chars (`nl.json:204`) — trim to ≤155 so the "No cure, no pay" hook survives truncation.
- `/faq` title "Veelgestelde vragen" is generic → "Veelgestelde vragen over crypto wallet herstel".
- Wallet titles ("Ledger wallet herstel", 21 chars) have room: "Ledger wallet herstel — kapot apparaat, pincode of herstelzin".

**M8. `Article` schema is minimal.**
`blog/[slug]/page.tsx:49` lacks `dateModified`, `image`, `mainEntityOfPage`, `inLanguage`, `publisher` (with logo), `author` as Person. Also `datePublished` is a bare date; fine, but add `dateModified` from a frontmatter `updated` field. Without an `image` the post is ineligible for Discover and most article rich results.

**M9. Scam-post is thin.**
`content/blog/nl/wallet-herstel-scams-herkennen.mdx` is 236 words for a topic ("crypto recovery scam herkennen") with strong PAA demand. Expand to 800+ words with real examples, a checklist table (snippet bait), and an "Wat wij wél/niet doen" section linking `/werkwijze` and `/tarieven`.

**M10. Core Web Vitals risks visible in code (no field data yet).**
- Good: two self-hosted variable fonts via `next/font/local` with `display: swap` and size-adjusted fallback (`layout.tsx:16-27`); no raster images anywhere so LCP is the H1 text; OG image is `force-static`.
- Risk: MUI + Emotion runtime CSS-in-JS (`ThemeRegistry`, `"use client"` in `Header.tsx`, `Faq.tsx`, `LanguageSwitcher`, `ThemeSwitcher`, `ContactClient`) ships a large hydration bundle for what is mostly static content; Emotion inserts styles at runtime, which can produce a flash/CLS if the SSR style cache is misconfigured. Sticky `AppBar` + `Drawer` mount on every page. Action: run Lighthouse on `/` and `/wallets/ledger` on a throttled mobile profile after the first production build; target JS < 200 KB gz on the home route; if INP/TBT is poor, convert `Faq` to native `<details>`/`<summary>` (no JS, still crawlable) and lazy-load the `Drawer`.
- `PageViewTracker` fires a fetch on mount to the API on every page (`PageViewTracker.tsx:8-10`) — cheap, but make sure `NEXT_PUBLIC_API_URL` is set so the `<link rel="preconnect">` (`layout.tsx:67`) actually renders.

### LOW

**L1. Unprefixed EN path redirects to the Dutch page.** `/pricing` → 307 `/tarieven` (next-intl matching). Harmless unless someone links the bare English slug, but note that `/nl/*` → 307 too; prefer 308/301 for permanent normalization (next-intl `localePrefix: "as-needed"` uses 307 by design — acceptable).

**L2. Home canonical has no trailing slash** (`<link rel="canonical" href="http://localhost:3001"/>`) while the sitemap uses `…/`. Google normalizes, but use `canonical: "/"` → ensure `metadataBase` yields `https://revault.nl/`. Check after C2.

**L3. `og:site_name` differs by source.** `seo.ts:5` hardcodes English "Revault — Crypto Wallet Recovery" for `buildOpenGraph`, while the layout uses `t("siteName")` (NL). Use the translated value in `buildOpenGraph`.

**L4. `og:locale:alternate` not emitted.** Add `alternateLocale: ["en_US"]` / `["nl_NL"]` in `buildOpenGraph`.

**L5. robots.txt does not disallow `/api/`.** The rewrite in `next.config.ts:53-62` proxies `/api/*` publicly. Add `{ userAgent: "*", allow: "/", disallow: "/api/" }` in `robots.ts:9`.

**L6. `ProfessionalService.priceRange: "No cure, no pay"`** is not a price range; validators accept any string, but use `"€€€"` or drop it, and express the model via `offers` / `hasOfferCatalog` instead.

**L7. Blog slugs are Dutch under `/en`** (`/en/blog/wallet-dat-bitcoin-core-herstel`). Cosmetic; an English `slug` frontmatter field would need a slug map — only worth it if EN becomes a real acquisition channel.

**L8. Manifest icons: SVG only.** Add a 192/512 PNG and `apple-touch-icon` (`src/app/apple-icon.png`). Google uses a ≥48px square favicon in mobile SERPs; SVG generally works but PNG is safer.

**L9. Blog tags are non-link `Chip`s** (`blog/page.tsx:39`) — fine, avoids thin tag pages; leave as is.

---

## Structured data summary

| Page type | Present | Validity | Gaps |
|---|---|---|---|
| All (layout) | `ProfessionalService` | Valid but sparse | `@id`, `logo`, `image`, `address` (PostalAddress), `telephone`, `email`, `legalName`, `vatID`, `sameAs`, `knowsLanguage`, `hasOfferCatalog` listing the 6 services. Add `WebSite` with `inLanguage`. |
| `/faq`, `/` | `FAQPage` | Valid | Duplicate across two URLs (M5). |
| `/wallet-herstel/*` | `Service` | Valid | `@id`, `url`, `areaServed`, `serviceType`, `provider` should reference the org `@id`. |
| `/wallets/*` | `Service` | Valid | `description` reuses the meta description; no FAQ. |
| `/blog/*` | `Article` | Valid | `image`, `dateModified`, `mainEntityOfPage`, `inLanguage`, `publisher`, Person author (M8). |
| any | `BreadcrumbList` | missing | M6 |

Suggested org block (S1) for `src/app/[locale]/layout.tsx:54`:
```ts
{
  "@context": "https://schema.org", "@type": ["ProfessionalService","Organization"], "@id": `${SITE_URL}/#org`,
  name: "Revault", legalName: "…", url: SITE_URL, logo: `${SITE_URL}/icon.svg`,
  address: { "@type": "PostalAddress", addressLocality: "…", postalCode: "…", addressCountry: "NL" },
  email: "…", telephone: "…", vatID: "NL…", sameAs: ["https://www.linkedin.com/company/…"],
  areaServed: ["NL","BE"], knowsLanguage: ["nl","en"],
  hasOfferCatalog: { "@type": "OfferCatalog", name: "Wallet herstel", itemListElement: SERVICE_SLUGS.map(...) }
}
```

---

## Keyword → page mapping (NL-first; volumes to be validated in GSC/Keyword Planner before any title change)

| Query cluster | Intent | Owner URL | Current title / H1 fit | Action |
|---|---|---|---|---|
| crypto wallet herstel / crypto wallet herstellen | Commercial | `/` | Title ✓, H1 ✗ | H3 fix; keep as pillar |
| bitcoin wallet herstellen / bitcoin wallet openen | Commercial | `/wallet-herstel` | Title "Wallet hersteldiensten" ✗ | Title → "Bitcoin & crypto wallet herstel: alle diensten"; H1 → "Bitcoin en crypto wallet herstel" |
| wallet wachtwoord vergeten / bitcoin wallet wachtwoord vergeten | Commercial | `/wallet-herstel/password-recovery` | Title "Wallet wachtwoord herstel" ~ | Title → "Wallet wachtwoord vergeten? Wachtwoordherstel — Revault"; link from blog "eerste stappen" |
| wallet.dat wachtwoord vergeten / wallet.dat openen | Commercial | `/wallets/bitcoin-core` | ✓ | Expand page (C1), link ↔ blog |
| wallet.dat herstellen (how-to) | Informational | `/blog/wallet-dat-bitcoin-core-herstel` | Title too long | M7; link to `/wallets/bitcoin-core` + password-recovery |
| herstelzin kwijt / seed phrase kwijt / 12 woorden kwijt | Commercial | `/wallet-herstel/seed-phrase-reconstruction` | Title "Herstelzin reconstructie" ~ | Add "herstelzin kwijt of onvolledig" to title/H1 |
| crypto wallet erfenis / crypto nalatenschap / bitcoin erfenis notaris | Commercial | `/wallet-herstel/inheritance` | Title "Herstel van geërfde crypto wallets" ✓ | Add "erfenis" & "nalatenschap" to H1/description; link from blog |
| crypto geërfd wat nu / bitcoin overleden ouder | Informational | `/blog/crypto-wallet-geerfd-nabestaanden` | ✓ | Link to inheritance service + `/contact` |
| ledger kapot / ledger pincode vergeten | Commercial | `/wallets/ledger` | ✓ thin | C1 |
| trezor herstelzin fout / trezor kapot | Commercial | `/wallets/trezor` | ✓ thin | C1 |
| metamask wachtwoord vergeten | Commercial | `/wallets/metamask` | ✓ thin | C1 — high-volume NL query, prioritize |
| hardware wallet herstel | Commercial | `/wallet-herstel/hardware-wallet` | ✓ | Keep; ensure wallet pages link up to it |
| oude wallet openen / multibit / jaxx | Commercial | `/wallet-herstel/legacy-wallet`, `/wallets/multibit`, `/wallets/jaxx` | ✓ | Avoid overlap: legacy page owns generic "oude wallet", wallet pages own brand |
| crypto recovery scam / herstelbedrijf betrouwbaar | Informational | `/blog/wallet-herstel-scams-herkennen` | ✓ thin | M9 |
| wallet toegang kwijt wat doen | Informational | `/blog/wallet-toegang-kwijt-eerste-stappen` | ✓ | Link to services |
| wallet herstel kosten / no cure no pay crypto | Commercial | `/tarieven` | H1 ✗ | H3 |
| crypto wallet recovery netherlands / europe (EN) | Commercial | `/en` | ✓ | Add "Netherlands / EU" to EN title |

Content gaps worth new pages/posts (no current owner): Trust Wallet, Exodus, Coinbase Wallet, Phantom, Ethereum keystore/JSON (`/wallets/ethereum-keystore`), "bitcoin op usb-stick gevonden", "paper wallet herstellen", "hoe werkt een notaris met crypto in een nalatenschap" (link-earning asset for notaris referrals), a Dutch glossary (seed phrase, passphrase, wallet.dat, keystore).

Cannibalization checks (sitemap method): `password-recovery` vs `/wallets/metamask`/`bitcoin-core` both mention "wachtwoord vergeten" — keep brand modifier on wallet pages and the generic term on the service page. Blog "wallet.dat" vs `/wallets/bitcoin-core` — informational vs commercial; keep the blog title question-shaped and the wallet page service-shaped. No title/H1 pair currently shares a primary keyword — good.

---

## What is already good

- Clean localized URL architecture with `localePrefix: "as-needed"` (`src/i18n/routing.ts`); NL at the root, EN under `/en`; localized slugs (`/wallet-herstel`, `/tarieven`, `/werkwijze`, `/over-ons`, `/voorwaarden`).
- Self-referencing canonicals and reciprocal `hreflang` (nl, en, x-default → nl) on every page, and repeated in the sitemap `xhtml:link` alternates — the implementation in `seo.ts:31-38` is correct and consistent.
- `<html lang>` set per locale (`layout.tsx:65`).
- Sitemap is complete: 56 URLs = 10 static + 6 services + 8 wallets + 4 posts × 2 locales, matching `routing.ts`; blog entries use real `date` for lastmod; excludes 404 catch-all.
- Trailing-slash 308 normalization, `/nl/*` → root redirect, www → apex 301 (`next.config.ts:42-51`), real 404 status for unknown slugs.
- robots.txt allows everything, references the sitemap, explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) — sensible for AI Overview visibility — blocks Bytespider.
- Titles are unique across all 28 NL pages; title template `%s · Revault` with `absolute` on home (`page.tsx:20`).
- Exactly one H1 per page on every URL tested; FAQ accordions are server-rendered (content is in the HTML, not client-only).
- Dynamic per-locale OG image (`opengraph-image.tsx`) with `force-static`, correct 1200×630, `og:image:alt`.
- Self-hosted variable fonts with `next/font/local`, `display: swap`, no third-party font requests; no raster images → text LCP; strong security headers (HSTS, CSP in prod, nosniff, frame-ancestors).
- JSON-LD rendered server-side with `</script>` escape (`JsonLd.tsx`); FAQPage, Service and Article types validate.
- Copy is genuinely intent-matched and honest ("wat niet kan", scam warnings, "wij herstellen geen gestolen tegoeden") — that is real E-E-A-T substance; it just needs an identifiable company and person behind it (H2).
- Blog posts (500–650 words) are specific, technically correct (non-HD pre-0.13 Bitcoin Core key pool, Berkeley DB, Jaxx shutdown) and use H2 structure that suits featured snippets.

---

## Suggested order of work

1. C2 env guard + set production URL (minutes).
2. H1 og:image in `buildOpenGraph` (30 min).
3. H2 footer KvK/BTW/address/e-mail + named specialist on `/over-ons`; extend org schema (copy needed).
4. C1 wallet pages: write real content for the 3 highest-volume (MetaMask, Ledger, Bitcoin Core) first; noindex the rest until written.
5. H3 H1/title rewrites per mapping table; M7 blog `metaTitle` frontmatter.
6. H4 related-content blocks + inline blog links; M6 breadcrumbs.
7. M1/M2/M5/M8 sitemap lastmod, fallback hreflang guard, FAQ dedupe, Article enrichment.
8. Lighthouse pass on production build (M10), then set up GSC + start the query/page cannibalization log before further title changes.


---

# 2. Agentic Search Optimizer (AI/LLM visibility)

# Revault.nl — AI Visibility & Agent-Readability Audit

**Persona:** Agentic Search Optimizer · **Date:** 2026-08-25 · **Scope:** wave 2 (citability by ChatGPT / Perplexity / Google AI Overviews / Claude) plus a wave-3 check on the one task flow that matters (intake form). Verified against the dev server at `localhost:3001` (`/`, `/faq`, `/tarieven`, `/werkwijze`, `/wallets/ledger`, `/blog/wallet-toegang-kwijt-eerste-stappen`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`) and against source.

## Headline verdict

The site is unusually well-positioned for AI citation compared with most lead-gen sites: everything is server-rendered (FAQ answers are present in the raw HTML, not injected client-side), the copy is honest and specific, key facts (20%, non-custodial, no-cure-no-pay, "we do not recover stolen funds") already exist, and `robots.ts` already allows the major AI crawlers. The gaps are (1) the facts an assistant needs are scattered across hero bullets, a trust strip and accordion answers instead of one self-contained, quotable paragraph per fact; (2) entity signals are weak (no legal name, KvK, address, founder, sameAs — "KvK-nummer volgt" is literally in the footer); (3) no `llms.txt`, no `HowTo` schema on the process, thin `Service` schema; (4) the four-tile TrustStrip + CtaBand + footer disclaimer boilerplate is repeated on every page and forms roughly 40–60% of the extractable text on thin pages like `/wallets/ledger` (2,004 chars total, of which the unique part is one sentence).

Scorecard (1 = absent, 5 = excellent):

| Dimension | Score | Evidence |
|---|---|---|
| Crawlability by AI bots | 4 | `src/app/robots.ts` allows GPTBot, OAI-SearchBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended; blocks Bytespider. Missing: CCBot, Applebot-Extended, Amazonbot, Meta-ExternalAgent, anthropic-ai, cohere-ai decisions; `Claude-Web` is a legacy token. |
| llms.txt / machine summary | 1 | `/llms.txt` → 404. No `/llms-full.txt`. |
| Answer-first, self-contained facts | 3 | 20% only on `/tarieven` in a card ("20% van de herstelde waarde" is a headline, not a sentence); the FAQ cost answer says "een percentage" without the number. Non-custodial and "no stolen funds" are stated well. |
| Structured data | 3 | `ProfessionalService` (site-wide), `FAQPage` (home + `/faq`), `Service` (services, wallets), `Article` (blog). No `HowTo`, no `Organization` details, no `Offer` with a real price spec, no `BreadcrumbList`, `Article` lacks `dateModified`/`inLanguage`/`mainEntityOfPage`. |
| Entity clarity | 1 | No legal entity name, KvK, address, founder, email, phone, `sameAs`. Footer says "KvK-nummer volgt". `SITE_URL` falls back to `http://localhost:3001` and is baked into JSON-LD `url` — make sure `NEXT_PUBLIC_SITE_URL` is set in prod. |
| Boilerplate dilution | 2 | TrustStrip (4 tiles), CtaBand, footer blurb + scam disclaimer, nav appear on every page. On `/wallets/ledger` the unique content is ~150 chars out of ~2,000. |
| Blog citability | 4 | Posts are well structured (H2/H3 numbered, bold "Samengevat"/"Vuistregel" summary). Weak: summary is at the bottom, no author person, EN versions are mostly Dutch fallbacks canonicalised to NL (correct, but EN queries won't be served). |
| Duplicate FAQ schema | 3 | Home and `/faq` both emit `FAQPage` with overlapping questions. Google tolerates it; keep `FAQPage` on `/faq` only and let the home page link. |

---

## 1. robots.txt — current state and recommended policy

**Current** (`src/app/robots.ts`): allows GPTBot, OAI-SearchBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended on `/`; blocks Bytespider; allows `*`.

**Assessment:** correct default for a lead-gen site. The business case is simple: Revault has nothing proprietary to protect in its public copy, and every citation in ChatGPT/Perplexity/AI Overviews is a referral with high intent. Blocking Google-Extended would be counter-productive: it does not affect AI Overviews (those use Googlebot), so blocking it only removes you from Gemini grounding while gaining nothing. There is no reason to block CCBot either; Common Crawl is the training substrate for most open models that Dutch notaries' assistants may run.

**Recommended `robots.ts`:**

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const AI_ALLOW = [
  // OpenAI (training + live search + ChatGPT browsing)
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  // Anthropic (ClaudeBot = crawler; Claude-User/Claude-SearchBot = live fetch)
  "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai",
  // Perplexity
  "PerplexityBot", "Perplexity-User",
  // Google Gemini grounding (AI Overviews use Googlebot, already allowed via *)
  "Google-Extended",
  // Apple Intelligence, Meta AI, Amazon Alexa+, Common Crawl, Cohere, Mistral, DuckDuckGo
  "Applebot-Extended", "Meta-ExternalAgent", "Amazonbot", "CCBot", "cohere-ai", "MistralAI-User", "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_ALLOW, allow: "/", disallow: ["/api/"] },
      // Scrapers with no referral value
      { userAgent: ["Bytespider", "PetalBot", "ImagesiftBot"], disallow: "/" },
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

Notes: `Claude-Web` can be dropped (superseded). Add `disallow: /api/` only if the intake API is proxied under the same host; otherwise leave it out. Keep `/contact` crawlable: assistants need to cite the intake URL.

---

## 2. llms.txt — proposed `public/llms.txt`

Serve at `/llms.txt` (static file in `public/` is fine with Next 15). Dutch first, English mirror below. Keep it under ~2,500 words; it is a map plus a fact sheet, not a copy of the site.

```markdown
# Revault — crypto wallet herstel (Nederland)

> Revault is een Nederlandse, non-custodial specialist in het herstellen van toegang tot crypto wallets: vergeten wachtwoorden, onvolledige herstelzinnen, beschadigde walletbestanden, verouderde wallets, defecte hardware wallets en geërfde wallets. Tarief: no cure, no pay, standaard 20% van de herstelde waarde, vooraf schriftelijk vastgelegd. Revault krijgt nooit beheer over tegoeden; de klant opent de wallet zelf.

## Kernfeiten
- Bedrijf: Revault, gevestigd in Nederland (KvK: [invullen]). Website: https://revault.nl
- Diensten: wachtwoordherstel, herstelzin-reconstructie, beschadigde walletbestanden (wallet.dat, keystore), verouderde wallets (MultiBit, Jaxx, Blockchain.com), hardware wallets (Ledger, Trezor), geërfde wallets voor erfgenamen, executeurs en notarissen.
- Tarief: geen kosten vooraf, geen uurtarief. Standaard 20% van de herstelde waarde; lager percentage bij hoge waarde. Alleen verschuldigd nadat de klant de wallet zelf heeft geopend en de tegoeden heeft verplaatst.
- Non-custodial: de overdracht gebeurt in een begeleide sessie waarin de klant zelf de wallet opent en de tegoeden naar een nieuwe wallet verplaatst. Revault vraagt nooit om herstelzinnen, sleutels of wachtwoorden via e-mail of web.
- Werkwijze (5 stappen): 1) gratis intake en beoordeling, 2) verificatie van identiteit en eigendom/bevoegdheid (KYC), 3) getekende serviceovereenkomst naar Nederlands recht (NDA op verzoek), 4) herstel op systemen zonder internetverbinding, op afstand of op locatie, 5) begeleide overdracht.
- Wat Revault NIET doet: gestolen crypto terughalen, transacties traceren of terugdraaien, oplichting onderzoeken, exchange-accounts herstellen, of een volledig verloren herstelzin zonder ander materiaal herstellen.
- Werkgebied: Nederland (op locatie of bij de notaris), België, Duitsland, rest van EU op afstand.
- Munten: herstel gebeurt op walletniveau; Bitcoin, Ethereum en tokens, Litecoin, Dogecoin, XRP en de meeste andere.
- Doorlooptijd: eenvoudige wachtwoordzaken soms binnen dagen; gedeeltelijke herstelzinnen weken tot maanden.

## Pagina's
- [Home](https://revault.nl/): overzicht diensten en werkwijze
- [Tarieven](https://revault.nl/tarieven): 20% no cure, no pay, maatwerk bij hoge waarde
- [Werkwijze](https://revault.nl/werkwijze): vijf stappen en beveiligingsmaatregelen
- [FAQ](https://revault.nl/faq): 13 veelgestelde vragen incl. wat wij niet doen
- [Over Revault](https://revault.nl/over-ons)
- [Contact / gratis beoordeling](https://revault.nl/contact): intakeformulier, reactie binnen twee werkdagen

## Diensten
- [Wachtwoordherstel](https://revault.nl/wallet-herstel/password-recovery)
- [Herstelzin reconstructie](https://revault.nl/wallet-herstel/seed-phrase-reconstruction)
- [Beschadigde walletbestanden](https://revault.nl/wallet-herstel/damaged-wallet)
- [Verouderde wallets](https://revault.nl/wallet-herstel/legacy-wallet)
- [Hardware wallet herstel](https://revault.nl/wallet-herstel/hardware-wallet)
- [Geërfde wallets](https://revault.nl/wallet-herstel/inheritance)

## Wallets
- Ledger, Trezor, MetaMask, Electrum, Bitcoin Core, Blockchain.com, MultiBit, Jaxx: https://revault.nl/wallets/<slug>

## Blog
- [Toegang tot uw wallet kwijt? Doe eerst dit](https://revault.nl/blog/wallet-toegang-kwijt-eerste-stappen)
- [Zo herkent u een crypto-herstelscam](https://revault.nl/blog/wallet-herstel-scams-herkennen)
- [wallet.dat gevonden: Bitcoin Core herstel](https://revault.nl/blog/wallet-dat-bitcoin-core-herstel)
- [Een crypto wallet geërfd: stappen voor nabestaanden](https://revault.nl/blog/crypto-wallet-geerfd-nabestaanden)

## English
- English site: https://revault.nl/en — same facts. Revault is a Netherlands-based, non-custodial crypto wallet recovery service. No cure, no pay; standard fee 20% of recovered value, agreed in writing before work starts. Revault never takes custody of funds and does not recover stolen crypto, trace transactions, or restore fully lost seed phrases.

## Optional
- [Privacy](https://revault.nl/privacy)
- [Voorwaarden](https://revault.nl/voorwaarden)
```

Also generate `/llms-full.txt` at build time from `messages/nl.json` + MDX (a small script in `scripts/` writing to `public/`), so assistants that ingest the full file get the FAQ answers verbatim.

---

## 3. Prioritized recommendations

### P1 — Entity and provenance (blocks "is this legit?" answers)

1. **Fill the placeholders.** `messages/nl.json:38` (`footer.legal = "Gevestigd in Nederland · KvK-nummer volgt"`) and the EN equivalent. An assistant answering "is crypto wallet recovery legit / is Revault betrouwbaar" looks for exactly these signals; "KvK-nummer volgt" currently reads as a red flag, and your own scam-post says "Geen contract, geen bedrijf" is a scam marker.
2. **Upgrade the site-wide JSON-LD** in `src/app/[locale]/layout.tsx` (`orgJsonLd`) from a bare `ProfessionalService` to a full entity: `legalName`, `alternateName`, `identifier` (KvK), `vatID`, `address` (`PostalAddress`, at least `addressLocality`/`addressCountry`), `email`, `telephone`, `founder` (`Person`), `foundingDate`, `sameAs` (LinkedIn, KvK register URL, GitHub if relevant), `knowsAbout`, `availableLanguage: ["nl","en"]`, `@id: "https://revault.nl/#organization"`, and `logo`. Reference that `@id` from every `Service.provider` and `Article.author/publisher` instead of re-declaring `{ "@type": "Organization", name: "Revault" }` in `services/[slug]/page.tsx`, `wallets/[slug]/page.tsx`, `blog/[slug]/page.tsx`.
3. **Add a named person.** About page (`about.story.*`) is entirely first-person plural with no name. Add a founder paragraph plus `Person` schema. AI answers to "who" questions need a who.
4. **Set `NEXT_PUBLIC_SITE_URL` in production**; `src/lib/seo.ts` falls back to `http://localhost:3001` and that string is currently inside every JSON-LD `url`.

### P1 — Put the key facts in one quotable paragraph each

5. **Homepage "definition block."** Add a plain `<p>` directly under the H1 (before the bullets) that states in one sentence who/what/where/price: see rewrite A below. Today the hero (`home.hero.subtitle`) is evocative but never says "Revault is …" and never says "Nederland" in the first paragraph; "20%" does not appear on the homepage at all.
6. **Put the number in the FAQ answer.** `faq.items.cost.a` says "een percentage van de herstelde waarde." Change to "standaard 20% van de herstelde waarde." Same for `home.why.noCureNoPay.body` and `serviceDetail.offer`. Assistants extract the FAQ answer, not the pricing card headline.
7. **Add a "Wat wij niet doen" section** as a real H2 with a list on `/faq` and `/over-ons` (currently only in the footer disclaimer, the `stolen`/`wrongAddress`/`lostSeed` FAQ answers, and `about.story.three`). This is your strongest differentiator for "is crypto wallet recovery legit" queries: a recovery firm that explicitly lists what cannot be done is the thing LLMs cite as the trust signal.
8. **`/tarieven`: add one sentence-form price statement** above the cards (see rewrite B) and a `Service` + `Offer` JSON-LD with `priceSpecification: { "@type": "UnitPriceSpecification", price: 20, priceCurrency: "EUR", unitText: "% of recovered value" }` or, more honestly, `Offer.description` + `priceSpecification.valueAddedTaxIncluded` plus `eligibleTransactionVolume`. `/tarieven` currently emits no page-level schema.

### P2 — Schema coverage

9. **`HowTo` on `/werkwijze`** (`src/app/[locale]/how-it-works/page.tsx`) from the five `process.*` steps: `HowTo` → `step[]` of `HowToStep` with `name`/`text`/`url` anchors. Add `id` attributes to each step in `Steps.tsx` so `url` fragments resolve. Also add the security measures as `HowToTip` or leave them as prose.
10. **Keep one `FAQPage`.** Remove the `FAQPage` JSON-LD from `src/app/[locale]/page.tsx` (home) and keep the full one on `/faq`. Or, if you keep both, make sure the home subset is not byte-identical. Also add `FAQPage` to `services/[slug]/page.tsx` — each service page renders two FAQs but emits no FAQ schema.
11. **`Article` schema:** add `dateModified`, `inLanguage`, `mainEntityOfPage`, `publisher` (`@id`), `author` as a `Person` where possible, and `isAccessibleForFree: true`. Add `BreadcrumbList` on service/wallet/blog pages.
12. **`Service` schema on wallet pages** is fine but thin; add `areaServed`, `offers` (`@id` of the shared Offer), and `about: { "@type": "Product", name: "Ledger Nano" }` for entity linking.

### P2 — Reduce boilerplate dilution

13. **Wallet pages are near-empty for extraction.** `/wallets/ledger` unique content is `wallets.ledger.intro` (one sentence). Everything else is TrustStrip + related-service cards + CtaBand + footer. Give each wallet page 3–5 wallet-specific, answer-first paragraphs (e.g. "Kan een kapotte Ledger worden hersteld zonder herstelzin?" / "Wat als mijn Ledger-herstelzin één fout woord heeft?" / "Werkt Revault met de Ledger-passphrase (25e woord)?") and a per-wallet `FAQPage`. Same for `services/[slug]`.
14. **Make boilerplate machine-skippable.** Wrap `TrustStrip`, `CtaBand` and the footer blurb in `<aside>` (or `role="complementary"`) and keep `<main>` scoped to unique content. Most extractors weight `main`/`article`. Currently `<main id="main">` in `layout.tsx` wraps the TrustStrip and CtaBand too.
15. **Move the summary to the top of blog posts.** Every post ends with a bold `**Samengevat:**` / `**Vuistregel:**` line that is perfect answer material. Duplicate it as the first paragraph (a "Kort antwoord" box) and keep the closing line. Also add a `## Veelgestelde vragen` block with 2–3 Q/As per post and emit `FAQPage` from frontmatter.

### P3 — Wave-3 (agentic task completion) — honest note

The one task that matters is "submit an intake." Current state (`src/app/[locale]/contact/ContactClient.tsx`):

| Task flow | Discoverable | Initiatable | Completable | Drop point |
|---|---|---|---|---|
| Submit intake (`/contact`) | Partial (no `data-mcp-*`, no `/mcp-actions.json`) | Partial | Likely yes for DOM-driving agents; no for declarative | MUI `<TextField select>` renders a `role="combobox"` div, not a native `<select>`; the form has no `action`/`method` so nothing works without JS; honeypot is fine (hidden + `aria-hidden`) |

Fixes, declarative-first: add `data-mcp-action="submit-recovery-intake"` + `data-mcp-description` on the `<form>`, `data-mcp-param` on inputs, use `native` select (`<TextField select SelectProps={{ native: true }}>`) so agents get a real `<select>`, and publish `/mcp-actions.json` linked from `<head>`. WebMCP is a 2026 draft; this is a low-cost hedge, not a guaranteed win. What is testable today: run Claude in Chrome against `/contact` and record completion before/after. Do not skip the baseline.

### P3 — Hygiene

16. `Claude-Web` in `robots.ts` is obsolete; replace per §1.
17. Sitemap `lastModified` is `new Date()` at build for all static routes (`src/app/sitemap.ts:8`), which makes freshness signals meaningless. Hard-code or derive from git.
18. English blog: `getBlogPost` falls back to Dutch under `/en/blog/...` with a canonical to NL (correct), but EN-language AI queries ("crypto wallet recovery Netherlands") have almost no English long-form to cite. Translate at least the scam post and the "first steps" post.
19. Home page HTML is ~300 KB (MUI/Emotion inline styles). Not a blocker for crawlers, but large `<style>` blocks push the first meaningful text far down; some fetchers truncate. Consider extracting critical CSS or trimming `sx` usage on the homepage.

---

## 4. Sample answer-first rewrites (Dutch)

**A. Homepage, new paragraph directly under the H1** (`home.hero.subtitle` stays; add `home.hero.definition`):

> **Revault is een Nederlands bedrijf dat de toegang herstelt tot crypto wallets waarvan de eigenaar het wachtwoord, een deel van de herstelzin of een werkend walletbestand kwijt is.** Wij werken non-custodial — u opent de wallet zelf en verplaatst de tegoeden zelf — en no cure, no pay: standaard 20% van de herstelde waarde, vooraf schriftelijk vastgelegd en pas verschuldigd na herstel. Gestolen crypto, verkeerde transacties en volledig verloren herstelzinnen zonder ander materiaal herstellen wij niet.

**B. `/tarieven`, new lead paragraph above the cards** (`pricing.summary`):

> **Wallet herstel bij Revault kost standaard 20% van de herstelde waarde, en niets als het herstel niet lukt.** Er is geen uurtarief en geen aanbetaling; de beoordeling vooraf is gratis. Het percentage staat in de serviceovereenkomst die u tekent voordat het technische werk begint, en wordt pas voldaan tijdens de begeleide overdracht waarin u zelf de wallet opent en de tegoeden naar een nieuwe wallet verplaatst. Bij wallets met een hoge waarde spreken we een lager percentage af. Alleen bij uitzonderlijke posten — internationale reizen of fysiek dataherstel door een partner — kunnen extra kosten gelden, altijd vooraf schriftelijk afgesproken.

**C. FAQ answer rewrite for "is crypto wallet recovery legit" intent** — replace `faq.items.trust.a`:

> **Ja, legitiem wallet herstel bestaat, en u herkent het aan vier dingen die Revault standaard doet:** een getekende serviceovereenkomst naar Nederlands recht vóór enig werk; verificatie van uw identiteit en eigendom voordat een zaak wordt aangenomen; geen enkele vraag om uw herstelzin, privésleutel of wachtwoord via e-mail of website; en betaling pas nadat u zelf weer in uw wallet zit. Een partij die kosten vooraf vraagt, garanties geeft, of belooft gestolen crypto of een verkeerde transactie terug te halen, beschrijft iets dat technisch niet kan.

**D. New FAQ item aimed at "wie helpt met een vergeten bitcoin wallet wachtwoord in Nederland"** (`faq.items.whoInNl`):

> **Q: Wie kan in Nederland helpen bij een vergeten bitcoin wallet wachtwoord?**
> A: Revault, gevestigd in Nederland, herstelt vergeten wachtwoorden van bitcoin wallets zoals Bitcoin Core (wallet.dat), Electrum, MultiBit en hardware wallets van Ledger en Trezor. Op basis van wat u zich nog herinnert — fragmenten, patronen, wachtwoorden uit die periode — draaien wij een gerichte zoektocht op systemen zonder internetverbinding. Sessies vinden plaats op afstand, op ons kantoor, bij u thuis of bij de notaris. U betaalt alleen bij een geslaagd herstel (standaard 20% van de herstelde waarde). Start met een gratis beoordeling via revault.nl/contact.

---

## 5. Can an assistant answer the two target queries today?

- **"Wie helpt met een vergeten bitcoin wallet wachtwoord in Nederland?"** — Partially. The pieces exist (`services.password-recovery.*`, `home.hero.points.three` "Op locatie in Nederland", `faq.items.location`) but no single passage contains *bitcoin + wachtwoord + Nederland + Revault* together, and "Bitcoin" appears mainly in the currencies FAQ. Rewrite D plus the definition block fix this.
- **"Is crypto wallet recovery legit?"** — Better than most: `faq.items.stolen`, `faq.items.custody`, `faq.items.lostSeed`, and the scam blog post are exactly the honest-negative content LLMs reward. What is missing is the entity proof (KvK, address, named person) that turns "this site says it's legit" into "this registered Dutch company says X." Without that, an assistant will cite the scam-recognition post generically rather than recommend Revault.

## Files referenced

- `/Users/ruudjuffermans/Projects/revault/src/app/robots.ts` — AI crawler policy
- `/Users/ruudjuffermans/Projects/revault/src/app/[locale]/layout.tsx` — site-wide `ProfessionalService` JSON-LD (upgrade to full Organization with `@id`)
- `/Users/ruudjuffermans/Projects/revault/src/app/[locale]/page.tsx` — duplicate `FAQPage`, hero definition block
- `/Users/ruudjuffermans/Projects/revault/src/app/[locale]/pricing/page.tsx` — no schema; add Offer + summary paragraph
- `/Users/ruudjuffermans/Projects/revault/src/app/[locale]/how-it-works/page.tsx` — add `HowTo`
- `/Users/ruudjuffermans/Projects/revault/src/app/[locale]/wallets/[slug]/page.tsx`, `services/[slug]/page.tsx` — thin unique content, provider re-declared, no FAQ schema on services
- `/Users/ruudjuffermans/Projects/revault/src/app/[locale]/blog/[slug]/page.tsx` — Article schema fields
- `/Users/ruudjuffermans/Projects/revault/src/app/[locale]/contact/ContactClient.tsx` — WebMCP declarative markup, native select
- `/Users/ruudjuffermans/Projects/revault/src/app/sitemap.ts:8` — `BUILD_DATE` lastmod
- `/Users/ruudjuffermans/Projects/revault/src/lib/seo.ts` — `SITE_URL` localhost fallback
- `/Users/ruudjuffermans/Projects/revault/messages/nl.json` (line 38 `footer.legal`; `faq.items.cost.a`; `home.why.noCureNoPay.body`; `serviceDetail.offer`) and `messages/en.json` equivalents
- `/Users/ruudjuffermans/Projects/revault/content/blog/nl/*.mdx` — move summary to top, add FAQ block
- New: `/Users/ruudjuffermans/Projects/revault/public/llms.txt` (+ generated `llms-full.txt`), `/Users/ruudjuffermans/Projects/revault/public/mcp-actions.json`