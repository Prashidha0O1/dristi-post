import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outbound email over SMTP (a cPanel mailbox in production).
 *
 * Configured entirely from env so no credentials live in the repo:
 *   SMTP_HOST     e.g. mail.dristitimes.com
 *   SMTP_PORT     465 (SSL) or 587 (STARTTLS); defaults to 465
 *   SMTP_SECURE   "true" for port 465, "false" for 587; inferred from port if unset
 *   SMTP_USER     the full mailbox address, e.g. noreply@dristitimes.com
 *   SMTP_PASS     that mailbox's password
 *   SMTP_FROM     optional display From, else falls back to SMTP_USER
 *
 * When SMTP_HOST/USER/PASS are missing, sending is a no-op that returns
 * `{ sent: false }` (and logs) rather than throwing — so a misconfigured server
 * degrades to "invite created, email not sent, copy the link" instead of a 500.
 */

let cached: Transporter | null = null;

function getTransport(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  if (!cached) {
    const port = Number(process.env.SMTP_PORT || 465);
    const secure =
      process.env.SMTP_SECURE != null ? process.env.SMTP_SECURE === "true" : port === 465;
    cached = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  }
  return cached;
}

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendMail(mail: MailInput): Promise<{ sent: boolean; error?: string }> {
  const transport = getTransport();
  if (!transport) {
    console.warn(`[email] SMTP not configured — skipped sending "${mail.subject}" to ${mail.to}`);
    return { sent: false, error: "Email is not configured on the server." };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  try {
    await transport.sendMail({ from, ...mail });
    return { sent: true };
  } catch (e) {
    console.error("[email] send failed", e);
    return { sent: false, error: e instanceof Error ? e.message : "Email send failed." };
  }
}
