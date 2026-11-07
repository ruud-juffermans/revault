import nodemailer, { type Transporter } from "nodemailer";
import type { Env } from "../env.js";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export interface Mailer {
  send(mail: Mail): Promise<void>;
}

export function createMailer(env: Env, logger: Pick<Console, "info" | "error"> = console): Mailer {
  if (!env.SMTP_HOST) {
    // Dev / test: print instead of send.
    return {
      async send(mail) {
        logger.info(`[mail] to=${mail.to} subject=${JSON.stringify(mail.subject)}\n${mail.text}`);
      },
    };
  }
  const transport: Transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return {
    async send(mail) {
      await transport.sendMail({ from: env.MAIL_FROM, ...mail });
    },
  };
}

// --- Templates -------------------------------------------------------------

interface IntakeSummary {
  reference: string;
  name: string;
  email: string;
  phone?: string | null;
  walletType: string;
  walletSoftware?: string | null;
  issueType: string;
  estimatedValue?: string | null;
  description: string;
  locale: string;
}

export function notificationMail(i: IntakeSummary, to: string): Mail {
  const lines = [
    `New intake ${i.reference}`,
    ``,
    `Name:            ${i.name}`,
    `Email:           ${i.email}`,
    `Phone:           ${i.phone || "-"}`,
    `Wallet type:     ${i.walletType}`,
    `Wallet software: ${i.walletSoftware || "-"}`,
    `Issue:           ${i.issueType}`,
    `Estimated value: ${i.estimatedValue || "-"}`,
    `Locale:          ${i.locale}`,
    ``,
    `Description:`,
    i.description,
  ];
  return { to, subject: `[Revault] New intake ${i.reference} — ${i.issueType}`, text: lines.join("\n"), replyTo: i.email };
}

export function autoReplyMail(i: IntakeSummary): Mail {
  const nl = i.locale.startsWith("nl");
  const subject = nl
    ? `Uw aanvraag bij Revault — referentie ${i.reference}`
    : `Your request at Revault — reference ${i.reference}`;
  const text = nl
    ? [
        `Beste ${i.name},`,
        ``,
        `Bedankt voor uw aanvraag. Uw referentie is ${i.reference}; vermeld deze in alle correspondentie.`,
        ``,
        `Ik beoordeel uw situatie persoonlijk en neem binnen twee werkdagen contact met u op.`,
        ``,
        `Belangrijk, in de tussentijd:`,
        `- Raak uw wallet, apparaat of back-ups NIET aan en probeer geen wachtwoorden meer. Elke poging kan herstel moeilijker maken.`,
        `- Installeer geen "herstelsoftware" en deel nooit uw seed phrase, private key of wachtwoord — ook niet met mij per e-mail.`,
        `- Wees alert op partijen die u ongevraagd benaderen. Ik neem alleen contact op vanaf dit adres.`,
        ``,
        `Met vriendelijke groet,`,
        `Ruud Juffermans`,
        `Revault`,
      ].join("\n")
    : [
        `Dear ${i.name},`,
        ``,
        `Thank you for your request. Your reference is ${i.reference}; please quote it in all correspondence.`,
        ``,
        `I will assess your situation personally and get back to you within two business days.`,
        ``,
        `Important, in the meantime:`,
        `- Do NOT touch your wallet, device or backups and stop trying passwords. Every attempt can make recovery harder.`,
        `- Do not install "recovery software" and never share your seed phrase, private key or password — not even with me by email.`,
        `- Be wary of anyone contacting you unsolicited. I only reach out from this address.`,
        ``,
        `Kind regards,`,
        `Ruud Juffermans`,
        `Revault`,
      ].join("\n");
  return { to: i.email, subject, text };
}
