import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";

/** Bearer-token guard for the admin API (ADMIN_SERVICE_TOKEN). */
export function requireServiceToken(token: string): RequestHandler {
  const expected = Buffer.from(token);
  return (req, res, next) => {
    const header = req.get("authorization") || "";
    const presented = Buffer.from(header.startsWith("Bearer ") ? header.slice(7) : "");
    const ok = presented.length === expected.length && timingSafeEqual(presented, expected);
    if (!ok) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  };
}
