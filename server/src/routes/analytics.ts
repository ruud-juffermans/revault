import { Router } from "express";
import rateLimit from "express-rate-limit";
import type { PrismaClient } from "@prisma/client";
import { analyticsSchema } from "../lib/intake.js";

/** Page-view beacon. Stores path/locale/referrer only — no cookies, no IP. */
export function analyticsRouter(prisma: PrismaClient): Router {
  const router = Router();
  const limiter = rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: "draft-7", legacyHeaders: false });

  router.post("/", limiter, async (req, res) => {
    const parsed = analyticsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid beacon" });
      return;
    }
    const { path, locale, referrer } = parsed.data;
    await prisma.pageView.create({
      data: { path, locale, referrer, userAgent: req.get("user-agent")?.slice(0, 500) },
    });
    res.status(204).end();
  });

  return router;
}
