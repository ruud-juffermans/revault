import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import type { PrismaClient } from "@prisma/client";
import { createApp } from "../src/app.js";
import { loadEnv } from "../src/env.js";
import type { Mail, Mailer } from "../src/lib/mail.js";

const env = loadEnv({
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://x",
  ADMIN_SERVICE_TOKEN: "test-token-test-token",
  INTAKE_EMAIL: "intake@example.com",
  CORS_ORIGINS: "http://localhost:3001",
});

function makePrisma() {
  const intakes: Record<string, unknown>[] = [];
  const subscribers: Record<string, unknown>[] = [];
  const prisma = {
    intake: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const row = { id: `id${intakes.length}`, status: "NEW", createdAt: new Date(), updatedAt: new Date(), ...data };
        intakes.push(row);
        return row;
      }),
      findMany: vi.fn(async () => intakes),
      count: vi.fn(async () => intakes.length),
      findUnique: vi.fn(async ({ where }: { where: { reference: string } }) => intakes.find((i) => i.reference === where.reference) ?? null),
      update: vi.fn(),
      delete: vi.fn(async () => { throw Object.assign(new Error("not found"), { code: "P2025" }); }),
      groupBy: vi.fn(async () => Object.entries(intakes.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.status as string]: (acc[i.status as string] ?? 0) + 1 }), {})).map(([status, n]) => ({ status, _count: { _all: n } }))),
    },
    newsletterSubscriber: {
      upsert: vi.fn(async ({ where, create, update }: { where: { email: string }; create: Record<string, unknown>; update: Record<string, unknown> }) => {
        const existing = subscribers.find((s) => s.email === where.email);
        if (existing) return Object.assign(existing, update);
        const row = { id: `sub${subscribers.length}`, active: true, createdAt: new Date(), unsubscribedAt: null, ...create };
        subscribers.push(row);
        return row;
      }),
      findMany: vi.fn(async () => subscribers),
      count: vi.fn(async ({ where }: { where?: { active?: boolean } } = {}) => subscribers.filter((s) => where?.active === undefined || s.active === where.active).length),
      groupBy: vi.fn(async () => [{ source: "footer", _count: { _all: subscribers.length } }]),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = subscribers.find((s) => s.id === where.id);
        if (!row) throw Object.assign(new Error("not found"), { code: "P2025" });
        return Object.assign(row, data);
      }),
      delete: vi.fn(async ({ where }: { where: { id: string } }) => {
        const i = subscribers.findIndex((s) => s.id === where.id);
        if (i < 0) throw Object.assign(new Error("not found"), { code: "P2025" });
        return subscribers.splice(i, 1)[0];
      }),
    },
    pageView: {
      create: vi.fn(async ({ data }: { data: unknown }) => data),
      count: vi.fn(async () => 0),
      groupBy: vi.fn(async () => []),
    },
    $queryRaw: vi.fn(async () => []),
  };
  return { prisma: prisma as unknown as PrismaClient, intakes, subscribers, mock: prisma };
}

const validBody = {
  name: "Jan Jansen",
  email: "Jan@Example.com",
  walletType: "software",
  issueType: "forgotten-password",
  description: "Electrum wallet from 2017, I still have the wallet file but forgot the password.",
  locale: "nl",
  consent: true,
};

describe("POST /api/revault/intake", () => {
  let sent: Mail[];
  let mailer: Mailer;
  beforeEach(() => {
    sent = [];
    mailer = { send: async (m) => { sent.push(m); } };
  });

  it("stores a valid intake, returns a reference and sends two emails", async () => {
    const { prisma, intakes } = makePrisma();
    const app = createApp({ env, prisma, mailer, logger: { error: () => {}, info: () => {} } });
    const res = await request(app).post("/api/revault/intake").send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.reference).toMatch(/^RV-\d{6}-[A-Z2-9]{4}$/);
    expect(intakes).toHaveLength(1);
    expect(intakes[0].email).toBe("jan@example.com");
    await vi.waitFor(() => expect(sent).toHaveLength(2));
    expect(sent.map((m) => m.to).sort()).toEqual(["intake@example.com", "jan@example.com"]);
    expect(sent.find((m) => m.to === "jan@example.com")?.subject).toContain("Uw aanvraag");
  });

  it("rejects invalid bodies with 400", async () => {
    const { prisma } = makePrisma();
    const app = createApp({ env, prisma, mailer });
    const res = await request(app).post("/api/revault/intake").send({ ...validBody, consent: false, email: "nope" });
    expect(res.status).toBe(400);
    expect(res.body.issues).toHaveProperty("consent");
    expect(res.body.issues).toHaveProperty("email");
  });

  it("rejects a seed phrase with 422 and a localized message, storing nothing", async () => {
    const { prisma, intakes } = makePrisma();
    const app = createApp({ env, prisma, mailer });
    const seed = "abandon ability able about above absent absorb abstract absurd abuse access accident";
    const res = await request(app).post("/api/revault/intake").send({ ...validBody, description: `Here it is: ${seed}` });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("secret:seed-phrase");
    expect(res.body.error).toMatch(/seed phrase/);
    expect(intakes).toHaveLength(0);
    expect(sent).toHaveLength(0);
    const en = await request(app).post("/api/revault/intake").send({ ...validBody, locale: "en", description: `Here it is: ${seed}` });
    expect(en.body.error).toMatch(/^Your message/);
  });

  it("swallows honeypot submissions with a fake success", async () => {
    const { prisma, intakes } = makePrisma();
    const app = createApp({ env, prisma, mailer });
    const res = await request(app).post("/api/revault/intake").send({ ...validBody, website: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(intakes).toHaveLength(0);
  });

  it("rate limits after 5 submissions per IP", async () => {
    const { prisma } = makePrisma();
    const app = createApp({ env, prisma, mailer, logger: { error: () => {}, info: () => {} } });
    for (let i = 0; i < 5; i++) await request(app).post("/api/revault/intake").send(validBody);
    const res = await request(app).post("/api/revault/intake").send(validBody);
    expect(res.status).toBe(429);
  });
});

describe("POST /api/revault/analytics", () => {
  it("records a page view and returns 204", async () => {
    const { prisma, mock } = makePrisma();
    const app = createApp({ env, prisma, mailer: { send: async () => {} } });
    const res = await request(app).post("/api/revault/analytics").send({ path: "/nl/diensten", locale: "nl" });
    expect(res.status).toBe(204);
    expect(mock.pageView.create).toHaveBeenCalledOnce();
  });
  it("rejects non-path values", async () => {
    const { prisma } = makePrisma();
    const app = createApp({ env, prisma, mailer: { send: async () => {} } });
    expect((await request(app).post("/api/revault/analytics").send({ path: "javascript:alert(1)" })).status).toBe(400);
  });
});

describe("admin API", () => {
  it("requires the service token", async () => {
    const { prisma } = makePrisma();
    const app = createApp({ env, prisma, mailer: { send: async () => {} } });
    expect((await request(app).get("/api/revault/admin/intakes")).status).toBe(401);
    expect((await request(app).get("/api/revault/admin/intakes").set("Authorization", "Bearer wrong")).status).toBe(401);
    const ok = await request(app).get("/api/revault/admin/intakes").set("Authorization", `Bearer ${env.ADMIN_SERVICE_TOKEN}`);
    expect(ok.status).toBe(200);
    expect(ok.body).toEqual({ items: [], total: 0, limit: 50, offset: 0 });
  });
  it("validates PATCH bodies", async () => {
    const { prisma } = makePrisma();
    const app = createApp({ env, prisma, mailer: { send: async () => {} } });
    const res = await request(app).patch("/api/revault/admin/intakes/RV-202608-ABCD").set("Authorization", `Bearer ${env.ADMIN_SERVICE_TOKEN}`).send({ status: "bogus" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/revault/newsletter", () => {
  const mailer: Mailer = { send: async () => {} };
  it("stores a signup, lower-cases the address and re-activates a known one", async () => {
    const { prisma, subscribers, mock } = makePrisma();
    const app = createApp({ env, prisma, mailer });
    const res = await request(app).post("/api/revault/newsletter").send({ email: "Jan@Example.com", locale: "nl", source: "footer" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(subscribers).toHaveLength(1);
    expect(subscribers[0]).toMatchObject({ email: "jan@example.com", source: "footer", active: true });
    subscribers[0].active = false;
    await request(app).post("/api/revault/newsletter").send({ email: "jan@example.com" });
    expect(subscribers).toHaveLength(1);
    expect(subscribers[0].active).toBe(true);
    expect(mock.newsletterSubscriber.upsert).toHaveBeenCalledTimes(2);
  });
  it("rejects a bad address and swallows the honeypot", async () => {
    const { prisma, subscribers } = makePrisma();
    const app = createApp({ env, prisma, mailer });
    expect((await request(app).post("/api/revault/newsletter").send({ email: "nope" })).status).toBe(400);
    const bot = await request(app).post("/api/revault/newsletter").send({ email: "bot@example.com", website: "x" });
    expect(bot.status).toBe(200);
    expect(subscribers).toHaveLength(0);
  });
});

describe("admin API: stats, newsletter and analytics", () => {
  const auth = { Authorization: `Bearer ${env.ADMIN_SERVICE_TOKEN}` };
  it("counts intakes per status", async () => {
    const { prisma } = makePrisma();
    const app = createApp({ env, prisma, mailer: { send: async () => {} }, logger: { error: () => {}, info: () => {} } });
    await request(app).post("/api/revault/intake").send(validBody);
    const res = await request(app).get("/api/revault/admin/intakes/stats").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.counts.NEW).toBe(1);
    expect(res.body.counts.CLOSED).toBe(0);
    expect(res.body.total).toBe(1);
  });
  it("404s when deleting an unknown intake", async () => {
    const { prisma } = makePrisma();
    const app = createApp({ env, prisma, mailer: { send: async () => {} } });
    expect((await request(app).delete("/api/revault/admin/intakes/RV-000000-XXXX").set(auth)).status).toBe(404);
  });
  it("lists, unsubscribes and deletes subscribers", async () => {
    const { prisma, subscribers } = makePrisma();
    const app = createApp({ env, prisma, mailer: { send: async () => {} } });
    await request(app).post("/api/revault/newsletter").send({ email: "a@example.com", source: "blog" });
    const list = await request(app).get("/api/revault/admin/newsletter").set(auth);
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(1);
    const stats = await request(app).get("/api/revault/admin/newsletter/stats").set(auth);
    expect(stats.body).toMatchObject({ total: 1, active: 1, unsubscribed: 0 });
    const id = subscribers[0].id as string;
    const un = await request(app).post(`/api/revault/admin/newsletter/${id}/unsubscribe`).set(auth);
    expect(un.status).toBe(200);
    expect(subscribers[0].active).toBe(false);
    expect((await request(app).delete(`/api/revault/admin/newsletter/${id}`).set(auth)).status).toBe(200);
    expect(subscribers).toHaveLength(0);
    expect((await request(app).delete(`/api/revault/admin/newsletter/${id}`).set(auth)).status).toBe(404);
  });
  it("returns a zero-filled timeseries and an overview with a previous window", async () => {
    const { prisma } = makePrisma();
    const app = createApp({ env, prisma, mailer: { send: async () => {} } });
    const ts = await request(app).get("/api/revault/admin/analytics/timeseries?days=7").set(auth);
    expect(ts.status).toBe(200);
    expect(ts.body.series).toHaveLength(7);
    expect(ts.body.series[6].day).toBe(new Date().toISOString().slice(0, 10));
    const ov = await request(app).get("/api/revault/admin/analytics/overview?days=7").set(auth);
    expect(ov.body).toMatchObject({ days: 7, totalViews: 0, byLocale: [], previous: { totalViews: 0, byLocale: [] } });
  });
});

describe("admin API: top pages and referrers", () => {
  const auth = { Authorization: `Bearer ${env.ADMIN_SERVICE_TOKEN}` };
  it("nests paths under their section, Dutch and English slugs together", async () => {
    const { prisma, mock } = makePrisma();
    mock.pageView.groupBy.mockResolvedValueOnce([
      { path: "/", _count: { _all: 5 } },
      { path: "/wallet-herstel/bitcoin-core", _count: { _all: 4 } },
      { path: "/en/wallet-recovery", _count: { _all: 3 } },
      { path: "/voorwaarden", _count: { _all: 1 } },
    ]);
    const app = createApp({ env, prisma, mailer: { send: async () => {} } });
    const res = await request(app).get("/api/revault/admin/analytics/top-pages?days=7").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.sections.map((s: { section: string; count: number }) => [s.section, s.count])).toEqual([["services", 7], ["home", 5], ["other", 1]]);
    expect(res.body.sections[0]).toMatchObject({ label: "Wallet recovery", pages: [{ path: "/wallet-herstel/bitcoin-core", count: 4 }, { path: "/en/wallet-recovery", count: 3 }] });
  });
  it("labels referrer hosts", async () => {
    const { prisma, mock } = makePrisma();
    mock.$queryRaw.mockResolvedValueOnce([
      { host: "", count: 9n },
      { host: "google.nl", count: 4n },
      { host: "revault.nl", count: 2n },
      { host: "duckduckgo.com", count: 1n },
    ]);
    const app = createApp({ env, prisma, mailer: { send: async () => {} } });
    const res = await request(app).get("/api/revault/admin/analytics/top-referrers?days=7").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.referrers).toEqual([
      { host: "direct", kind: "direct", count: 9 },
      { host: "google.nl", kind: "google", count: 4 },
      { host: "revault.nl", kind: "internal", count: 2 },
      { host: "duckduckgo.com", kind: "other", count: 1 },
    ]);
  });
});

describe("CORS", () => {
  it("allows the configured origin only", async () => {
    const { prisma } = makePrisma();
    const app = createApp({ env, prisma, mailer: { send: async () => {} } });
    const ok = await request(app).options("/api/revault/intake").set("Origin", "http://localhost:3001").set("Access-Control-Request-Method", "POST");
    expect(ok.headers["access-control-allow-origin"]).toBe("http://localhost:3001");
    const no = await request(app).options("/api/revault/intake").set("Origin", "http://evil.example").set("Access-Control-Request-Method", "POST");
    expect(no.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
