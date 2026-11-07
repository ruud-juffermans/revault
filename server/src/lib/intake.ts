import { z } from "zod";

export const WALLET_TYPES = ["software", "hardware", "exchange", "paper", "unknown"] as const;
export const ISSUE_TYPES = [
  "forgotten-password",
  "seed-phrase",
  "damaged-file",
  "legacy-wallet",
  "hardware-defect",
  "inheritance",
  "other",
] as const;
export const STATUSES = ["NEW", "ASSESSED", "VIABLE", "NOT_VIABLE", "AGREEMENT", "RECOVERY", "CLOSED"] as const;

const trimmed = (max: number) => z.string().trim().max(max);

/** Mirrors `IntakeBody` in the client (src/lib/api.ts). */
export const intakeSchema = z.object({
  name: trimmed(120).min(2),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: trimmed(40).optional().or(z.literal("").transform(() => undefined)),
  walletType: z.enum(WALLET_TYPES),
  walletSoftware: trimmed(120).optional().or(z.literal("").transform(() => undefined)),
  issueType: z.enum(ISSUE_TYPES),
  estimatedValue: trimmed(80).optional().or(z.literal("").transform(() => undefined)),
  description: trimmed(5000).min(20),
  locale: z.string().trim().regex(/^[a-z]{2}(-[A-Za-z]{2})?$/).default("nl"),
  consent: z.literal(true),
  // Honeypot: rendered off-screen in the client; humans leave it empty.
  website: z.string().max(200).optional(),
});
export type IntakeInput = z.infer<typeof intakeSchema>;

export const analyticsSchema = z.object({
  path: z.string().trim().min(1).max(500).regex(/^\//),
  locale: z.string().trim().max(10).optional(),
  referrer: z.string().trim().max(2000).optional(),
});

/** Newsletter signup (footer + blog). Mirrors `subscribeNewsletter` in the client. */
export const NEWSLETTER_SOURCES = ["footer", "blog", "web"] as const;
export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  locale: z.string().trim().regex(/^[a-z]{2}(-[A-Za-z]{2})?$/).optional(),
  source: z.enum(NEWSLETTER_SOURCES).default("web"),
  // Honeypot, as on the intake form.
  website: z.string().max(200).optional(),
});

export const adminNewsletterQuery = z.object({
  active: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
  limit: z.coerce.number().int().min(1).max(500).default(200),
  offset: z.coerce.number().int().min(0).default(0),
});

export const adminListQuery = z.object({
  status: z.enum(STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const adminPatchSchema = z
  .object({
    status: z.enum(STATUSES).optional(),
    notes: z.string().max(20000).nullable().optional(),
  })
  .refine((v) => v.status !== undefined || v.notes !== undefined, { message: "Nothing to update" });
