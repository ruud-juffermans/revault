import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { adminListQuery, adminPatchSchema } from "../lib/intake.js";
import { requireServiceToken } from "../middleware/serviceToken.js";

export function adminRouter(prisma: PrismaClient, token: string): Router {
  const router = Router();
  router.use(requireServiceToken(token));

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
      if ((err as { code?: string }).code === "P2025") {
        res.status(404).json({ error: "Not found" });
        return;
      }
      throw err;
    }
  });

  router.get("/analytics/summary", async (req, res) => {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    const since = new Date(Date.now() - days * 86_400_000);
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

  return router;
}
