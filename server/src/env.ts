import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGINS: z.string().default(""),
  ADMIN_SERVICE_TOKEN: z.string().min(16, "ADMIN_SERVICE_TOKEN must be at least 16 characters"),
  INTAKE_EMAIL: z.string().email(),
  MAIL_FROM: z.string().default("Revault <noreply@revault.nl>"),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  TRUST_PROXY: z.coerce.number().int().nonnegative().default(0),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment:\n${issues}`);
  }
  return parsed.data;
}

export const corsOrigins = (env: Env) =>
  env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
