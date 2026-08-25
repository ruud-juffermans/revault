import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import type { PrismaClient } from "@prisma/client";
import { corsOrigins, type Env } from "./env.js";
import type { Mailer } from "./lib/mail.js";
import { intakeRouter } from "./routes/intake.js";
import { analyticsRouter } from "./routes/analytics.js";
import { adminRouter } from "./routes/admin.js";

export interface AppDeps {
  env: Env;
  prisma: PrismaClient;
  mailer: Mailer;
  logger?: Pick<Console, "error" | "info">;
}

export function createApp({ env, prisma, mailer, logger = console }: AppDeps) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", env.TRUST_PROXY);

  app.use(helmet());
  const origins = corsOrigins(env);
  app.use(
    cors({
      origin: origins.length ? origins : false,
      methods: ["GET", "POST", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: "64kb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/revault/intake", intakeRouter({ prisma, mailer, intakeEmail: env.INTAKE_EMAIL, logger }));
  app.use("/api/revault/analytics", analyticsRouter(prisma));
  app.use("/api/revault/admin", adminRouter(prisma, env.ADMIN_SERVICE_TOKEN));

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if ((err as { type?: string }).type === "entity.parse.failed") {
      res.status(400).json({ error: "Malformed JSON" });
      return;
    }
    if ((err as { type?: string }).type === "entity.too.large") {
      res.status(413).json({ error: "Payload too large" });
      return;
    }
    logger.error(err);
    res.status(500).json({ error: "Internal server error" });
  };
  app.use(onError);

  return app;
}
