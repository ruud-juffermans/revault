# revault

Non-custodial crypto wallet recovery service (the Dutch/English counterpart to
cryptoherstel.nl / cryptorecovers.com): a bilingual Next.js marketing site with
service and wallet landing pages, a secret-free intake form, and an MDX blog.
Live at [revault.nl](https://revault.nl) (planned).

**Client-only deployment.** The backend (intake submissions, page-view
analytics and their admin API) lives in
[`ruudjuffermans-server`](https://github.com/ruud-juffermans/ruudjuffermans-server)
— the shared platform API at `api.ruudjuffermans.nl` — as its `revault`
module. This site has no user accounts; its API calls are anonymous and
rate-limited server-side.

See [`docs/PRD.md`](docs/PRD.md) for the product requirements.

## Tech stack

| Layer    | Technology |
| -------- | ---------- |
| Frontend | Next.js 15 (App Router), React 19, Material UI 6, next-intl, MDX |
| Backend  | `ruudjuffermans-server` — Express + Prisma, `revault` module |
| Tooling  | TypeScript, Docker / Docker Compose, GitHub Actions |

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
├── docs/PRD.md          # Product requirements
├── .env.example         # Env template
├── Dockerfile           # Standalone Next.js image
└── docker-compose.yml   # Production stack: client-only Next.js image
```

## Local development

```bash
# 1. API — in ../ruudjuffermans-server (see its README):
docker compose -f docker-compose.dev.yml up -d && npm run dev   # :4000

# 2. This site (repo root):
npm install
npm run dev                                                     # :3001
```

With `NEXT_PUBLIC_API_URL` unset (the dev default) the browser calls
same-origin `/api/*` and `next.config.ts` rewrites it to the local platform
server on `:4000`.

| Variable               | Description                                            | Dev default |
| ---------------------- | ------------------------------------------------------ | ----------- |
| `NEXT_PUBLIC_API_URL`  | Platform API origin; empty = same-origin + dev rewrite | *(empty)* |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (metadata, www→apex redirect)          | `http://localhost:3001` |

## Deployment

`docker-compose.yml` builds the standalone Next.js image (build args bake
`NEXT_PUBLIC_API_URL` and the site URL in) on the external `dokploy-network`;
Traefik routes `revault.nl` (and `www.`, which the app 308-redirects to the
apex) to it.

## API (served by ruudjuffermans-server, `revault` module)

| Method | Endpoint                          | Description |
| ------ | --------------------------------- | ----------- |
| `POST` | `/api/revault/intake`             | Submit the intake form → `{ success, reference }` |
| `POST` | `/api/revault/analytics`          | Page-view beacon |
| *      | `/api/revault/admin/…`            | Intake management (service token or platform admin) |

The intake endpoint validates with Zod, rejects anything that looks like a
seed phrase or private key (see PRD §7), and is rate limited per IP.

## License

MIT
