import { Router } from "express";
import rateLimit from "express-rate-limit";
import type { PrismaClient } from "@prisma/client";
import { intakeSchema } from "../lib/intake.js";
import { detectSecret } from "../lib/secrets.js";
import { makeReference } from "../lib/reference.js";
import { autoReplyMail, notificationMail, type Mailer } from "../lib/mail.js";

export interface IntakeDeps {
  prisma: PrismaClient;
  mailer: Mailer;
  intakeEmail: string;
  logger?: Pick<Console, "error">;
}

const SECRET_MESSAGE: Record<"nl" | "en", Record<"seed-phrase" | "private-key", string>> = {
  nl: {
    "seed-phrase":
      "Uw bericht lijkt een seed phrase (herstelwoorden) te bevatten. Verstuur die nooit via internet — ook niet naar ons. Verwijder de woorden en beschrijf alleen wat er is gebeurd.",
    "private-key":
      "Uw bericht lijkt een private key of wachtwoord te bevatten. Verstuur die nooit via internet — ook niet naar ons. Verwijder de sleutel en beschrijf alleen wat er is gebeurd.",
  },
  en: {
    "seed-phrase":
      "Your message appears to contain a seed phrase (recovery words). Never send those over the internet — not even to us. Remove the words and describe only what happened.",
    "private-key":
      "Your message appears to contain a private key or password. Never send those over the internet — not even to us. Remove the key and describe only what happened.",
  },
};

export function intakeRouter(deps: IntakeDeps): Router {
  const router = Router();
  const logger = deps.logger ?? console;

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many submissions. Please try again in 15 minutes." },
  });

  router.post("/", limiter, async (req, res) => {
    const parsed = intakeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid submission", issues: parsed.error.flatten().fieldErrors });
      return;
    }
    const input = parsed.data;

    // Honeypot hit: bots fill every field. Pretend success, store nothing.
    if (input.website) {
      res.status(200).json({ success: true, reference: makeReference() });
      return;
    }

    const lang = input.locale.startsWith("nl") ? "nl" : "en";
    for (const field of [input.description, input.walletSoftware ?? "", input.estimatedValue ?? "", input.name] as const) {
      const kind = detectSecret(field);
      if (kind) {
        res.status(422).json({ error: SECRET_MESSAGE[lang][kind], code: `secret:${kind}` });
        return;
      }
    }

    // Retry on the (astronomically unlikely) reference collision.
    let intake;
    for (let attempt = 0; ; attempt++) {
      try {
        intake = await deps.prisma.intake.create({
          data: {
            reference: makeReference(),
            name: input.name,
            email: input.email,
            phone: input.phone,
            walletType: input.walletType,
            walletSoftware: input.walletSoftware,
            issueType: input.issueType,
            estimatedValue: input.estimatedValue,
            description: input.description,
            locale: input.locale,
            ip: req.ip,
            userAgent: req.get("user-agent")?.slice(0, 500),
          },
        });
        break;
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code === "P2002" && attempt < 3) continue;
        throw err;
      }
    }

    // Emails must not block or fail the submission.
    void Promise.allSettled([
      deps.mailer.send(notificationMail(intake, deps.intakeEmail)),
      deps.mailer.send(autoReplyMail(intake)),
    ]).then((results) => {
      for (const r of results) if (r.status === "rejected") logger.error("[intake] mail failed", r.reason);
    });

    res.status(201).json({ success: true, reference: intake.reference });
  });

  return router;
}
