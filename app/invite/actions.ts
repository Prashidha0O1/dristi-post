"use server";

import { redirect } from "next/navigation";
import { acceptInvite } from "@/lib/auth/invites";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export type AcceptState = { error?: string };

export async function acceptInviteAction(_prev: AcceptState, formData: FormData): Promise<AcceptState> {
  const token = String(formData.get("token") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name) return { error: "Enter your name." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  let userId: string | null = null;
  try {
    userId = await acceptInvite(token, name, await hashPassword(password));
  } catch (e) {
    console.error("[accept-invite] failed", e);
    return { error: "Something went wrong. Try again." };
  }

  if (!userId) {
    return { error: "This invite is no longer valid. Ask the owner for a new one." };
  }

  await createSession(userId);
  // redirect() throws its signal — outside the try above.
  redirect("/admin");
}
