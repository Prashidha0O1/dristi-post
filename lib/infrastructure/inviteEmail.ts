import "server-only";
import { sendMail } from "./email";
import { siteUrl } from "../siteUrl";

const BRAND = "Dristi Times";

/**
 * Emails a new team member their invite: a one-time link to set a password and
 * activate their account. `role` is shown so they know what access they'll get.
 * Returns whether the message actually went out (false when SMTP is unconfigured
 * or the send failed — the caller still shows the copyable link as a fallback).
 */
export async function sendInviteEmail(params: {
  to: string;
  role: "ADMIN" | "EDITOR";
  path: string; // e.g. /invite/<token>
}): Promise<{ sent: boolean; error?: string }> {
  const link = `${siteUrl()}${params.path}`;
  const roleLabel = params.role === "ADMIN" ? "Administrator" : "Editor";
  const subject = `You're invited to ${BRAND} as ${roleLabel}`;

  const text = [
    `You've been invited to ${BRAND} as ${roleLabel}.`,
    ``,
    `Set your password and activate your account here:`,
    link,
    ``,
    `This link works once and expires in 7 days. If you weren't expecting this, you can ignore this email.`,
  ].join("\n");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
    <h2 style="margin:0 0 12px">You're invited to ${BRAND}</h2>
    <p style="font-size:15px;line-height:1.6;margin:0 0 8px">
      You've been added as <strong>${roleLabel}</strong>. Click below to set your password and activate your account.
    </p>
    <p style="margin:24px 0">
      <a href="${link}" style="background:#c8102e;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:6px;display:inline-block;font-size:15px">
        Set your password
      </a>
    </p>
    <p style="font-size:13px;color:#666;line-height:1.6;margin:0 0 4px">
      Or paste this link into your browser:<br>
      <a href="${link}" style="color:#c8102e;word-break:break-all">${link}</a>
    </p>
    <p style="font-size:12px;color:#999;line-height:1.6;margin:16px 0 0">
      This link works once and expires in 7 days. If you weren't expecting this, you can ignore this email.
    </p>
  </div>`;

  return sendMail({ to: params.to, subject, html, text });
}
