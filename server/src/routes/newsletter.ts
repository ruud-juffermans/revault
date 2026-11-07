import { Router } from "express";
import rateLimit from "express-rate-limit";
import type { PrismaClient } from "@prisma/client";
import { newsletterSchema } from "../lib/intake.js";

/**
 * Newsletter signup. Stores the address locally (no list provider). Always
 * answers 200 for a well-formed address so the endpoint cannot be used to
 * check whether someone is subscribed; a known address is silently
 * re-activated.
 */
export function newsletterRouter(prisma: PrismaClient): Router {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again in 15 minutes." },
  });

  router.post("/", limiter, async (req, res) => {
    const parsed = newsletterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid email address", issues: parsed.error.flatten().fieldErrors });
      return;
    }
    const { email, locale, source, website } = parsed.data;
    if (website) {
      res.status(200).json({ success: true });
      return;
    }
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, locale, source },
      update: { active: true, unsubscribedAt: null, locale: locale ?? undefined },
    });
    res.status(200).json({ success: true });
  });

  return router;
}
