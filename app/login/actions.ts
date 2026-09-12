"use server";

import { redirect } from "next/navigation";
import { findUserByEmailWithSecret } from "@/lib/auth/users";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export type LoginState = { error?: string };

/** Only same-site admin paths are accepted, to prevent an open-redirect. */
function safeRedirect(target: FormDataEntryValue | null): string {
  const value = typeof target === "string" ? target : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const target = safeRedirect(formData.get("redirect"));

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  // One generic message whether the email is unknown, the password is wrong, or
  // the account is deactivated — so the form never reveals which emails exist.
  const invalid: LoginState = { error: "Incorrect email or password." };

  let ok = false;
  try {
    const user = await findUserByEmailWithSecret(email);
    if (user && user.isActive && (await verifyPassword(password, user.passwordHash))) {
      await createSession(user.id);
      ok = true;
    }
  } catch (e) {
    console.error("[login] failed", e);
    return { error: "Sign-in is temporarily unavailable. Try again in a moment." };
  }

  if (!ok) return invalid;

  // redirect() throws its signal — must be outside the try/catch above.
  redirect(target);
}
