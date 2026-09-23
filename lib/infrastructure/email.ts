import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outbound email over SMTP (a cPanel mailbox in production).
 *
 * Configured entirely from env so no credentials live in the repo:
 *   SMTP_HOST          e.g. mail.dristitimes.com
 *   SMTP_PORT          465 (SSL) or 587 (STARTTLS); defaults to 465
 *   SMTP_SECURE        "true" for 465, "false" for 587; inferred from port if unset
 *   SMTP_USER          the full mailbox address, e.g. noreply@dristitimes.com
 *   SMTP_PASS          that mailbox's password
 *   SMTP_FROM          optional display name, e.g. "Dristi Times"
 *                      (an address inside it is ignored — see below)
 *   SMTP_TLS_INSECURE  "true" to accept a cert that doesn't match SMTP_HOST
 *                      (common on shared cPanel). Off by default.
 *
 * Missing HOST/USER/PASS makes sending a no-op returning `{ sent: false }`, so a
 * misconfigured server degrades to "copy the link" instead of a 500.
 */

let cached: { key: string; transport: Transporter } | null = null;

function config() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure =
    process.env.SMTP_SECURE != null ? process.env.SMTP_SECURE === "true" : port === 465;
  const insecure = process.env.SMTP_TLS_INSECURE === "true";
  return { host, user, pass, port, secure, insecure };
}

function getTransport(): Transporter | null {
  const c = config();
  if (!c) return null;

  // Rebuild when any setting changes, so a corrected password takes effect
  // without relying on a stale transporter held from an earlier bad config.
  const key = JSON.stringify(c);
  if (!cached || cached.key !== key) {
    cached = {
      key,
      transport: nodemailer.createTransport({
        host: c.host,
        port: c.port,
        secure: c.secure,
        auth: { user: c.user, pass: c.pass },
        // Fail fast instead of hanging the admin form on a blocked port.
        connectionTimeout: 15_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
        tls: c.insecure ? { rejectUnauthorized: false } : { servername: c.host },
      }),
    };
  }
  return cached.transport;
}

/**
 * The From header. Always sends AS the authenticated mailbox — Gmail rejects or
 * spam-folders mail whose From address differs from the SMTP login (spoofing).
 * SMTP_FROM contributes only the display name.
 */
function fromHeader(user: string): string {
  const raw = process.env.SMTP_FROM?.trim();
  const name = raw ? raw.replace(/<[^>]*>/, "").replace(/"/g, "").trim() : "";
  return name ? `"${name}" <${user}>` : user;
}

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendMail(mail: MailInput): Promise<{ sent: boolean; error?: string }> {
  const transport = getTransport();
  const c = config();
  if (!transport || !c) {
    console.warn(`[email] SMTP not configured — skipped "${mail.subject}" to ${mail.to}`);
    return { sent: false, error: "Email is not configured on the server (SMTP_HOST/USER/PASS missing)." };
  }

  try {
    const info = await transport.sendMail({
      from: fromHeader(c.user),
      envelope: { from: c.user, to: mail.to },
      ...mail,
    });
    console.log(`[email] sent "${mail.subject}" to ${mail.to}: ${info.response ?? info.messageId}`);
    return { sent: true };
  } catch (e) {
    console.error("[email] send failed", e);
    // Drop the transporter so the next attempt reconnects cleanly.
    cached = null;
    const err = e as { code?: string; responseCode?: number; message?: string };
    let hint = "";
    if (err.code === "EAUTH" || err.responseCode === 535) {
      hint = " — the SMTP username/password is wrong. Check SMTP_USER (full address) and SMTP_PASS, then restart the app.";
    } else if (err.code === "ETIMEDOUT" || err.code === "ECONNREFUSED" || err.code === "ECONNECTION") {
      hint = " — can't reach the mail server. Check SMTP_HOST/SMTP_PORT (try 587 with SMTP_SECURE=false).";
    } else if (/certificate|altnames|self.signed/i.test(err.message ?? "")) {
      hint = " — TLS certificate mismatch. Set SMTP_TLS_INSECURE=true and restart.";
    }
    return { sent: false, error: `${err.message ?? "Email send failed."}${hint}` };
  }
}
