import { Router } from "express";
import { Prisma, type PrismaClient } from "@prisma/client";
import { adminListQuery, adminNewsletterQuery, adminPatchSchema, STATUSES } from "../lib/intake.js";
import { groupBySection, referrerKind } from "../lib/traffic.js";
import { requireServiceToken } from "../middleware/serviceToken.js";

/**
 * Admin API, consumed by the admin panel (admin.ruudjuffermans.nl) through its
 * server-side proxy with ADMIN_SERVICE_TOKEN. Three data sets: intakes,
 * newsletter subscribers and page-view analytics.
 */
export function adminRouter(prisma: PrismaClient, token: string): Router {
  const router = Router();
  router.use(requireServiceToken(token));

  const clampDays = (raw: unknown) => Math.min(Math.max(Number(raw) || 30, 1), 365);
  const cutoff = (days: number) => new Date(Date.now() - days * 86_400_000);
  const notFound = (err: unknown) => (err as { code?: string }).code === "P2025";

  // ── Intakes ────────────────────────────────────────────────────────────────

  router.get("/intakes", async (req, res) => {
    const q = adminListQuery.safeParse(req.query);
    if (!q.success) {
      res.status(400).json({ error: "Invalid query", issues: q.error.flatten().fieldErrors });
      return;
    }
    const where = q.data.status ? { status: q.data.status } : {};
    const [items, total] = await Promise.all([
      prisma.intake.findMany({ where, orderBy: { createdAt: "desc" }, take: q.data.limit, skip: q.data.offset }),
      prisma.intake.count({ where }),
    ]);
    res.json({ items, total, limit: q.data.limit, offset: q.data.offset });
  });

  /** Counts per status, for the panel's badges and tiles. */
  router.get("/intakes/stats", async (_req, res) => {
    const grouped = await prisma.intake.groupBy({ by: ["status"], _count: { _all: true } });
    const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<(typeof STATUSES)[number], number>;
    for (const row of grouped) counts[row.status] = row._count._all;
    const total = Object.values(counts).reduce((n, c) => n + c, 0);
    res.json({ counts, total });
  });

  router.get("/intakes/:reference", async (req, res) => {
    const intake = await prisma.intake.findUnique({ where: { reference: req.params.reference } });
    if (!intake) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(intake);
  });

  router.patch("/intakes/:reference", async (req, res) => {
    const body = adminPatchSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Invalid body", issues: body.error.flatten().fieldErrors });
      return;
    }
    try {
      const intake = await prisma.intake.update({ where: { reference: req.params.reference }, data: body.data });
      res.json(intake);
    } catch (err) {
      if (notFound(err)) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      throw err;
    }
  });

  router.delete("/intakes/:reference", async (req, res) => {
    try {
      await prisma.intake.delete({ where: { reference: req.params.reference } });
      res.json({ ok: true });
    } catch (err) {
      if (notFound(err)) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      throw err;
    }
  });

  // ── Newsletter ─────────────────────────────────────────────────────────────

  router.get("/newsletter", async (req, res) => {
    const q = adminNewsletterQuery.safeParse(req.query);
    if (!q.success) {
      res.status(400).json({ error: "Invalid query", issues: q.error.flatten().fieldErrors });
      return;
    }
    const where = q.data.active === undefined ? {} : { active: q.data.active };
    const [items, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({ where, orderBy: { createdAt: "desc" }, take: q.data.limit, skip: q.data.offset }),
      prisma.newsletterSubscriber.count({ where }),
    ]);
    res.json({ items, total, limit: q.data.limit, offset: q.data.offset });
  });

  router.get("/newsletter/stats", async (_req, res) => {
    const [total, active, bySource] = await Promise.all([
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: { active: true } }),
      prisma.newsletterSubscriber.groupBy({ by: ["source"], _count: { _all: true } }),
    ]);
    res.json({ total, active, unsubscribed: total - active, bySource: bySource.map((r) => ({ source: r.source, count: r._count._all })) });
  });

  router.post("/newsletter/:id/unsubscribe", async (req, res) => {
    try {
      const subscriber = await prisma.newsletterSubscriber.update({ where: { id: req.params.id }, data: { active: false, unsubscribedAt: new Date() } });
      res.json(subscriber);
    } catch (err) {
      if (notFound(err)) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      throw err;
    }
  });

  router.delete("/newsletter/:id", async (req, res) => {
    try {
      await prisma.newsletterSubscriber.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    } catch (err) {
      if (notFound(err)) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      throw err;
    }
  });

  // ── Analytics ──────────────────────────────────────────────────────────────

  /** Views per path over the window. */
  router.get("/analytics/summary", async (req, res) => {
    const days = clampDays(req.query.days);
    const since = cutoff(days);
    const [total, byPath] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: since } } }),
      prisma.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        orderBy: { _count: { path: "desc" } },
        take: 50,
      }),
    ]);
    res.json({ days, total, byPath: byPath.map((r) => ({ path: r.path, views: r._count._all })) });
  });

  /** Views per path, nested under the site section each path belongs to. */
  router.get("/analytics/top-pages", async (req, res) => {
    const days = clampDays(req.query.days);
    const byPath = await prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: cutoff(days) } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 200,
    });
    res.json({ sections: groupBySection(byPath.map((r) => ({ path: r.path, count: r._count._all }))) });
  });

  /**
   * Where traffic comes from: referrer URLs collapsed onto their host (in SQL,
   * so the LIMIT applies to hosts) and labelled linkedin / google / internal / ….
   * No referrer at all is "direct".
   */
  router.get("/analytics/top-referrers", async (req, res) => {
    const days = clampDays(req.query.days);
    const rows = await prisma.$queryRaw<Array<{ host: string; count: bigint }>>(
      Prisma.sql`
        SELECT COALESCE(
                 regexp_replace(
                   lower(substring(referrer from '^[A-Za-z][A-Za-z0-9+.-]*://([^/?#:]+)')),
                   '^www\\.', ''),
                 NULLIF(lower(trim(referrer)), ''),
                 '') AS host,
               COUNT(*)::bigint AS count
        FROM "PageView"
        WHERE "createdAt" >= ${cutoff(days)}
        GROUP BY host
        ORDER BY count DESC, host ASC
        LIMIT 100
      `,
    );
    res.json({
      referrers: rows.map((r) => ({ host: r.host === "" ? "direct" : r.host, kind: referrerKind(r.host), count: Number(r.count) })),
    });
  });

  /** Totals per locale for the window and for the window before it. */
  router.get("/analytics/overview", async (req, res) => {
    const days = clampDays(req.query.days);
    const since = cutoff(days);
    const before = cutoff(days * 2);
    const count = async (range: { gte: Date; lt?: Date }) => {
      const grouped = await prisma.pageView.groupBy({ by: ["locale"], where: { createdAt: range }, _count: { _all: true } });
      const byLocale = grouped.map((r) => ({ locale: r.locale ?? "unknown", count: r._count._all }));
      return { totalViews: byLocale.reduce((n, r) => n + r.count, 0), byLocale };
    };
    const [current, previous] = await Promise.all([count({ gte: since }), count({ gte: before, lt: since })]);
    res.json({ days, since: since.toISOString(), until: new Date().toISOString(), ...current, previous });
  });

  /** Views per UTC day (total + per locale), zero-filled, oldest first. */
  router.get("/analytics/timeseries", async (req, res) => {
    const days = clampDays(req.query.days);
    const rows = await prisma.$queryRaw<Array<{ day: Date; locale: string | null; count: bigint }>>(
      Prisma.sql`
        SELECT date_trunc('day', "createdAt") AS day, locale, COUNT(*)::bigint AS count
        FROM "PageView"
        WHERE "createdAt" >= ${cutoff(days)}
        GROUP BY day, locale
        ORDER BY day ASC
      `,
    );
    const byDay = new Map<string, { day: string; count: number; locales: Record<string, number> }>();
    for (const r of rows) {
      const day = r.day.toISOString().slice(0, 10);
      const entry = byDay.get(day) ?? { day, count: 0, locales: {} };
      const n = Number(r.count);
      const key = r.locale ?? "unknown";
      entry.count += n;
      entry.locales[key] = (entry.locales[key] ?? 0) + n;
      byDay.set(day, entry);
    }
    const now = new Date();
    const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(end - i * 86_400_000).toISOString().slice(0, 10);
      series.push(byDay.get(day) ?? { day, count: 0, locales: {} });
    }
    res.json({ series });
  });

  return router;
}
