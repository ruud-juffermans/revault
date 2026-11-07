# revault

Non-custodial crypto wallet recovery service run by one person, Ruud
Juffermans (the Dutch/English counterpart to cryptoherstel.nl /
cryptorecovers.com): a bilingual Next.js marketing site with
service and wallet landing pages, a secret-free intake form, and an MDX blog,
plus a small Express API (`server/`) for intake submissions, page-view
analytics and their admin endpoints. Live at [revault.nl](https://revault.nl)
(planned).

The site has no user accounts; its API calls are anonymous and rate-limited
server-side.

See [`docs/PRD.md`](docs/PRD.md) for the product requirements.

## Tech stack

| Layer    | Technology |
| -------- | ---------- |
| Frontend | Next.js 15 (App Router), React 19, Material UI 6, next-intl, MDX |
| Backend  | Express 5, Prisma 6, Postgres 17, Zod, Nodemailer (`server/`) |
| Tooling  | TypeScript, Vitest, Docker / Docker Compose, GitHub Actions |

## Project structure

```
.
├── content/blog/        # MDX blog posts (nl / en; en falls back to nl)
├── messages/            # i18n copy — every page's text lives here
├── src/
│   ├── app/[locale]/    # routes (localized pathnames in src/i18n/routing.ts)
│   ├── components/      # Header, Footer, TrustStrip, Steps, Faq, …
│   ├── lib/             # api (intake + analytics), seo, content, services
│   └── theme/           # MUI theme with light/dark CSS-variable palette
├── server/              # API: Express + Prisma
│   ├── prisma/          # schema + migrations
│   ├── src/routes/      # intake, analytics, admin
│   ├── src/lib/         # validation, secret detection, mail, references
│   └── test/            # Vitest (no database needed)
├── docs/PRD.md          # Product requirements
├── .env.example         # Env template for docker compose
├── Dockerfile           # Standalone Next.js image
├── docker-compose.yml   # Production stack: site + server + postgres
└── docker-compose.dev.yml  # Local Postgres only
```

## Local development

```bash
# 1. Postgres
docker compose -f docker-compose.dev.yml up -d

# 2. API
cd server
cp .env.example .env            # defaults match the dev Postgres above
npm install
npx prisma migrate deploy
npm run dev                     # :4000  (emails are logged to stdout without SMTP_HOST)

# 3. Site (repo root)
npm install
npm run dev                     # :3001
```

With `NEXT_PUBLIC_API_URL` unset (the dev default) the browser calls
same-origin `/api/*` and `next.config.ts` rewrites it to the local platform
server on `:4000`.

| Variable               | Description                                            | Dev default |
| ---------------------- | ------------------------------------------------------ | ----------- |
| `NEXT_PUBLIC_API_URL`  | Platform API origin; empty = same-origin + dev rewrite | *(empty)* |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (metadata, www→apex redirect)          | `http://localhost:3001` |

## Deployment

`docker-compose.yml` runs three services on the external `dokploy-network`:
`site` (standalone Next.js image; build args bake `NEXT_PUBLIC_API_URL` and
the site URL in), `server` (runs `prisma migrate deploy` on start) and `db`
(Postgres 17 on a named volume). Traefik routes `revault.nl` (and `www.`,
which the app 308-redirects to the apex) to `site` and `api.revault.nl` to
`server`. Required env: `POSTGRES_PASSWORD`, `ADMIN_SERVICE_TOKEN`,
`INTAKE_EMAIL`, plus `SMTP_*` to actually send mail (see `.env.example`).

## API (`server/`)

| Method  | Endpoint                                   | Description |
| ------- | ------------------------------------------ | ----------- |
| `POST`  | `/api/revault/intake`                      | Submit the intake form → `201 { success, reference }`; `422 { code: "secret:…" }` if it contains a seed phrase / private key |
| `POST`  | `/api/revault/analytics`                   | Page-view beacon → `204` |
| `GET`   | `/api/revault/admin/intakes?status=&limit=&offset=` | List intakes |
| `GET`   | `/api/revault/admin/intakes/:reference`    | One intake |
| `PATCH` | `/api/revault/admin/intakes/:reference`    | `{ status?, notes? }` — status: NEW → ASSESSED → VIABLE / NOT_VIABLE → AGREEMENT → RECOVERY → CLOSED |
| `DELETE`| `/api/revault/admin/intakes/:reference`    | Remove an intake |
| `GET`   | `/api/revault/admin/intakes/stats`         | Counts per status |
| `POST`  | `/api/revault/newsletter`                  | Newsletter signup `{ email, locale?, source? }` → `200 { success }` (always, so it can't be used to check addresses) |
| `GET`   | `/api/revault/admin/newsletter?active=&limit=&offset=` | List subscribers |
| `GET`   | `/api/revault/admin/newsletter/stats`      | Totals + per source |
| `POST`  | `/api/revault/admin/newsletter/:id/unsubscribe` | Mark inactive (row kept) |
| `DELETE`| `/api/revault/admin/newsletter/:id`        | Remove a subscriber |
| `GET`   | `/api/revault/admin/analytics/summary?days=30` | Views per path |
| `GET`   | `/api/revault/admin/analytics/overview?days=30` | Totals per locale, current + previous window |
| `GET`   | `/api/revault/admin/analytics/timeseries?days=30` | Views per UTC day, zero-filled |
| `GET`   | `/health`                                  | Liveness |

Admin routes take `Authorization: Bearer $ADMIN_SERVICE_TOKEN`. They are
consumed by the admin panel (`../admin-panel`, section "Revault"), which
proxies them server-side with `REVAULT_API_URL` / `REVAULT_ADMIN_TOKEN`. The intake
endpoint validates with Zod, drops honeypot submissions, rejects anything that
looks like a seed phrase (≥ 8 consecutive BIP-39 words) or a private key (hex,
WIF, xprv, keystore JSON — see PRD §7), is rate limited to 5 per IP per 15
minutes, and emails a notification to `INTAKE_EMAIL` plus a localized
auto-reply to the visitor.

```bash
cd server && npm test        # Vitest, mocked Prisma — no database needed
```

## License

MIT
