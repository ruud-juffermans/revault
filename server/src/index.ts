import { loadEnv } from "./env.js";
import { prisma } from "./db.js";
import { createMailer } from "./lib/mail.js";
import { createApp } from "./app.js";

const env = loadEnv();
const app = createApp({ env, prisma, mailer: createMailer(env) });

const server = app.listen(env.PORT, () => {
  console.info(`[revault-server] listening on :${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = async (signal: string) => {
  console.info(`[revault-server] ${signal}, shutting down`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
