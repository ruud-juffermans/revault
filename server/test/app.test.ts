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
    },
    pageView: { create: vi.fn(async ({ data }: { data: unknown }) => data) },
  };
  return { prisma: prisma as unknown as PrismaClient, intakes, mock: prisma };
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
