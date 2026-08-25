# Revault — Product Requirements Document

| | |
|---|---|
| **Product** | revault.nl — non-custodial crypto wallet recovery service |
| **Owner** | Ruud Juffermans |
| **Status** | Draft v0.1 — 25 August 2026 |
| **Repo** | `revault/` (Next.js site) + `ruudjuffermans-server` (`revault` module) |

---

## 1. Summary

Revault offers the same service as cryptoherstel.nl / cryptorecovers.com:
restoring access to cryptocurrency wallets that the client already owns but
can no longer open — forgotten passwords, incomplete seed phrases, damaged or
legacy wallet files, defective hardware wallets, and inherited wallets. The
service is **non-custodial** (we rebuild access, the client moves the funds),
**contract-first** (NDA on request, signed service agreement before any
work), and **no cure, no pay** (a percentage of recovered value, only due after
access is restored).

The website is the entire top of the funnel: it has to make a stressed,
sceptical visitor — who has probably already been approached by scammers —
trust us enough to describe their case in the intake form. Every page exists
to move someone toward that form, or to disqualify them honestly (stolen
funds, fully lost seed) before they waste their time.

## 2. Goals & non-goals

### Goals
1. **Qualified intakes.** Primary metric: intake submissions per month that
   pass the first honest assessment as "viable".
2. **Trust at first glance.** A notary or lawyer landing on the site should be
   comfortable forwarding it to a client.
3. **Rank for wallet-specific long-tail queries** in NL and EN
   ("ledger wallet herstel", "wallet.dat password recovery", "jaxx liberty
   recovery").
4. **Reuse the ruudjuffermans.nl platform architecture** so the site is cheap
   to run and maintain: client-only Next.js on Dokploy, backend as a module
   in the shared platform server.

### Non-goals (v1)
- No stolen-fund / scam recovery, transaction tracing or investigations. The
  site must actively say so — it is a trust signal, not just a scope limit.
- No client portal, accounts, case tracking or payments online. Cases run
  over email, phone and signed documents.
- No uploads of wallet files or secrets through the website. Ever.
- No live chat, no booking widget (v1 uses a scheduling link sent by email).
- No languages beyond NL/EN (cryptorecovers has six; revisit after traction).

## 3. Users

| Persona | Situation | What they need from the site |
|---|---|---|
| **The locked-out holder** (primary) | Bought crypto 2013–2021, forgot the password / lost part of the seed / old software won't open. Anxious, has been burned or approached by scammers. | Proof we're real (KvK, contract, non-custodial), a clear "what we can and can't do", no-risk pricing, and a form that doesn't ask for secrets. |
| **The heir / executor** | Found a laptop, a Ledger or a piece of paper in a deceased relative's things. Doesn't know crypto. | Plain-language explanation, reassurance that verification and a notary are part of the process. |
| **The professional** (notary, lawyer, curator, family office) | Needs a technical specialist for a client's estate or dispute. | Process rigour, KYC/AML, willingness to work at their office, a page they can forward. |

## 4. Competitive reference

cryptoherstel.nl (NL) and cryptorecovers.com (international brand of the same
company, Amsterdam, since 2019, KvK 75927276). Their structure, which Revault
mirrors and tightens:

- Hero with three promises: **no cure no pay / non-custodial / on-site or remote**
- Services block (password, seed, damaged & legacy, inheritance)
- "Why us" (confidential, proven, no fee, direct contact)
- 3–5 step process
- Google reviews (5/5) + media logos
- FAQ with honest disqualifiers (no stolen funds, no fully-lost seed)
- Per-wallet landing pages (Ledger, Trezor, Blockchain.com, MetaMask, Bitcoin
  Core, MultiBit, Electrum, Jaxx) and per-coin pages
- Pricing page: 20% standard, custom for high value, no upfront costs
- Footer disclaimer: Dutch-registered, KYC/AML, no scam recovery

**Where Revault differentiates (v1):** a cleaner, faster site (their WordPress
+ Divi is heavy), a structured intake instead of a generic contact form, and
being explicit about *what not to send us* as a trust signal. Reviews and
media logos are omitted until we have real ones — no fabricated social proof.

## 5. Information architecture

Localized pathnames are defined in `src/i18n/routing.ts`. Dutch is the
default (unprefixed) locale; English lives under `/en`.

| Route key | NL | EN | Purpose |
|---|---|---|---|
| `/` | `/` | `/en` | Home: hero, trust strip, services, process, why, FAQ, CTA |
| `/services` | `/wallet-herstel` | `/en/wallet-recovery` | Services overview + wallet chips |
| `/services/[slug]` | `/wallet-herstel/…` | `/en/wallet-recovery/…` | 6 service pages (§6.2) |
| `/wallets/[slug]` | `/wallets/…` | `/en/wallets/…` | 8 wallet landing pages (§6.3) |
| `/how-it-works` | `/werkwijze` | `/en/how-it-works` | 5-step process + security practices |
| `/pricing` | `/tarieven` | `/en/pricing` | Standard 20% / custom, pricing FAQ |
| `/about` | `/over-ons` | `/en/about` | Story, values |
| `/faq` | `/faq` | `/en/faq` | 12 questions, FAQPage JSON-LD |
| `/blog`, `/blog/[slug]` | `/blog` | `/en/blog` | MDX posts, EN falls back to NL |
| `/contact` | `/contact` | `/en/contact` | **Intake form** (§7) |
| `/privacy`, `/terms` | `/privacy`, `/voorwaarden` | `/en/privacy`, `/en/terms` | Legal |

Global: sticky header (nav + language + theme + "Free assessment" CTA),
footer (services, wallets, company, legal, no-scam disclaimer), skip link,
localized 404, `robots.txt`, `sitemap.xml` with hreflang, web manifest.

## 6. Functional requirements

### 6.1 Every page
- Server-rendered, static where possible (`generateStaticParams` for locales,
  services, wallets, posts).
- Per-page `<title>`, description, canonical + `hreflang` (nl, en, x-default=nl),
  Open Graph.
- `TrustStrip` (four promises) near the top of every content page; `CtaBand`
  at the bottom.
- Light/dark colour scheme via MUI CSS variables, system default, persisted.
- Page-view beacon to `/api/revault/analytics` (cookie-less, no third-party
  analytics — matches the privacy positioning).

### 6.2 Service pages (`lib/services.ts` → `SERVICE_SLUGS`)
`password-recovery`, `seed-phrase-reconstruction`, `damaged-wallet`,
`legacy-wallet`, `hardware-wallet`, `inheritance`. Each has: intro, "what we
can do" (3), "what we need from you" (3), a never-share notice, 2 FAQs,
`Service` JSON-LD. All copy in `messages/{nl,en}.json` under `services.<slug>`.

### 6.3 Wallet pages (`WALLET_SLUGS`)
`ledger`, `trezor`, `metamask`, `electrum`, `bitcoin-core`, `blockchain-com`,
`multibit`, `jaxx`. Each: wallet-specific intro + the 3 most relevant services
(`WALLET_SERVICES` map). Adding a wallet = one slug + one messages entry.

### 6.4 Blog
MDX in `content/blog/{nl,en}/<slug>.mdx` with `title`, `date`, `excerpt`,
`tags` front-matter. Future-dated posts are hidden. An EN request for a
NL-only post renders the Dutch content with a notice and canonicalizes to
NL. `Article` JSON-LD.

### 6.5 Home
Hero (badge, h1, lede, 3 ✓ points, primary → contact, secondary → how it
works), TrustStrip, 6 service cards, 5 process steps, 4 "why" blocks, 6 FAQ
items (FAQPage JSON-LD), CTA band.

## 7. Intake form (the conversion point)

**Principle: the site never handles secrets.** The form has no field for, and
explicitly warns against entering, seed phrases, private keys or passwords.

Fields (`lib/api.ts` → `IntakeBody`):

| Field | Required | Notes |
|---|---|---|
| name, email | yes | |
| phone | no | |
| walletType | yes | software / hardware / exchange / paper / unknown |
| walletSoftware | no | free text ("Ledger", "Electrum 3.x") |
| issueType | yes | forgotten-password / seed-phrase / damaged-file / legacy-wallet / hardware-defect / inheritance / other |
| estimatedValue | no | free text range |
| description | yes | what happened, what's still available |
| consent | yes | verification + privacy acknowledgement |
| locale | auto | for reply language |

Server (`ruudjuffermans-server`, `revault` module — **to be built**):
- `POST /api/revault/intake` → Zod validation, rate limit 5/IP/15 min,
  honeypot field, **reject** submissions whose description matches a
  BIP-39 phrase pattern (≥ 8 consecutive wordlist words) or a private-key /
  WIF pattern, with a clear error telling the user not to send secrets.
- Persist to Postgres (`RevaultIntake`), email notification to
  `INTAKE_EMAIL`, auto-reply to the visitor in their locale with a reference
  (`RV-YYYYMM-XXXX`) and the "don't touch your devices" advice.
- `GET/PATCH /api/revault/admin/intakes` behind the platform service token
  (status: new → assessed → viable / not-viable → agreement → recovery →
  closed).
- `POST /api/revault/analytics` mirrors the website module's beacon.

Success state on the site shows the reference and next steps; error state
keeps the form contents.

## 8. Content & tone

- Calm, concrete, plain language. Second person. No hype, no "guaranteed".
- Say what we **can't** do, prominently: stolen funds, wrong-address
  transactions, fully lost seed phrases.
- Dutch copy uses formal *u*. English is neutral, not American-salesy.
- No fabricated reviews, media logos, team photos or "200+ wallets" numbers
  until they're real. Placeholders are removed, not invented.

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Lighthouse ≥ 95 mobile on home + service pages; self-hosted fonts via `next/font`; no third-party scripts. |
| Security | Strict CSP (self + API origin), HSTS, no cookies, no secrets in transit. |
| Accessibility | WCAG 2.1 AA: skip link, heading order, focus rings, 4.5:1 text contrast in both schemes, reduced-motion respected. |
| SEO | Canonical + hreflang on every page, FAQPage/Service/Article/ProfessionalService JSON-LD, sitemap with alternates, AI crawlers allowed. |
| i18n | 100% of UI + copy in `messages/*.json`; both locales must have identical key sets (CI check to add). |
| Ops | Standalone Docker image, Traefik via Dokploy, CI = `tsc --noEmit` + `next build`. |
| Privacy | GDPR: privacy page, 12-month deletion of non-case intakes, no trackers. |

## 10. Architecture

Mirrors `ruudjuffermans.nl`:

```
Browser ──► revault.nl (Next.js standalone, Docker, Traefik/Dokploy)
              │  NEXT_PUBLIC_API_URL baked at build time
              ▼
          api.ruudjuffermans.nl  (ruudjuffermans-server, Express + Prisma)
              └── revault module: intake, analytics, admin
```

- The Next.js app at the repo root is the only deployable here. Dev proxies `/api/*` to
  `localhost:4000` via a Next rewrite; prod calls the API cross-origin (CORS
  allowlist on the server).
- Theme: same MUI CSS-variable pattern as the reference site, re-skinned
  (graphite + amber "key" accent, Plus Jakarta Sans / Outfit).
- Copy-driven pages: page components are thin; all text is in
  `messages/*.json`, slugs in `lib/services.ts`.

## 11. Milestones

| # | Milestone | Scope | Exit criteria |
|---|---|---|---|
| M0 | **Scaffold** (this commit) | Repo, theme, routing, all pages with real NL/EN copy, intake UI, blog with one post, CI, Docker. | `tsc` + `next build` green. |
| M1 | Backend | `revault` module in ruudjuffermans-server: intake + analytics + admin, secret-pattern rejection, emails. | Form submits end-to-end in dev; rate limit + rejection tests. |
| M2 | Legal & identity | KvK registration, address, phone, real privacy/terms reviewed, service agreement + NDA templates. | Footer shows real KvK; contact aside shows phone/email. |
| M3 | Launch | Domain, Dokploy service, DNS, Search Console, OG images, 3 more blog posts. | Live, indexed, first intake received. |
| M4 | Proof | Real testimonials, case write-ups (anonymised), Google Business profile. | Reviews section enabled on home. |
| M5 | Growth | Per-coin pages (BTC/ETH/LTC/XRP/DOGE), DE/FR locales, scheduling integration. | Decided on M3/M4 data. |

## 12. Open questions

1. Legal entity: new BV or trade name under the existing ZZP? Affects footer,
   terms and KYC obligations.
2. Fee: match the market's 20% or undercut? Copy currently says 20% with a
   custom rate for high value.
3. Do we accept on-site sessions outside NL at launch, or NL/BE only?
4. Who performs KYC/AML — in-house checklist or a third-party provider?
5. Do we want a separate international domain (revault.io) like
   cryptorecovers.com, or keep `/en` on revault.nl?
