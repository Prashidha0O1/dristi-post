"use server";

import { requireCapability } from "@/lib/auth/guard";
import { emailExists, findUserById, setUserActive, updateUserRole } from "@/lib/auth/users";
import { createInvite, deleteInvite, type InviteRole } from "@/lib/auth/invites";
import { sendInviteEmail } from "@/lib/infrastructure/inviteEmail";
import { isRole, type Role } from "@/lib/domain/user";

export type InviteState =
  | { status: "idle" }
  | { status: "ok"; path: string; email: string; emailed: boolean }
  | { status: "error"; message: string };

export const idleInviteState: InviteState = { status: "idle" };

/** Owner-only. Creates an invite and returns the accept path to share. */
export async function inviteUserAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  let owner;
  try {
    owner = await requireCapability("users.manage");
  } catch {
    return { status: "error", message: "Only the owner can invite people." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleRaw = String(formData.get("role") ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }
  if (roleRaw !== "ADMIN" && roleRaw !== "EDITOR") {
    return { status: "error", message: "Choose a role (Admin or Editor)." };
  }
  if (await emailExists(email)) {
    return { status: "error", message: "Someone with that email already has an account." };
  }

  try {
    const invite = await createInvite(email, roleRaw as InviteRole, owner.id);
    const path = `/invite/${invite.token}`;
    // Email the link. If SMTP is unconfigured or the send fails, the invite is
    // still valid — the admin gets the copyable link as a fallback.
    const { sent } = await sendInviteEmail({ to: email, role: roleRaw as InviteRole, path });
    return { status: "ok", path, email, emailed: sent };
  } catch (e) {
    console.error("[invite] failed", e);
    return { status: "error", message: "Could not create the invite. Try again." };
  }
}

export async function cancelInviteAction(id: string): Promise<void> {
  await requireCapability("users.manage");
  await deleteInvite(id);
}

export async function changeUserRoleAction(id: string, role: string): Promise<void> {
  const owner = await requireCapability("users.manage");
  if (id === owner.id) throw new Error("You can't change your own role.");
  if (!isRole(role) || role === "OWNER") throw new Error("Invalid role.");

  const target = await findUserById(id);
  if (!target) throw new Error("User not found.");
  if (target.role === "OWNER") throw new Error("The owner's role can't be changed.");

  await updateUserRole(id, role as Role);
}

export async function setUserActiveAction(id: string, active: boolean): Promise<void> {
  const owner = await requireCapability("users.manage");
  if (id === owner.id) throw new Error("You can't deactivate your own account.");

  const target = await findUserById(id);
  if (!target) throw new Error("User not found.");
  if (target.role === "OWNER") throw new Error("The owner account can't be deactivated.");

  await setUserActive(id, active);
}
