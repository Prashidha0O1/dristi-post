import "server-only";
import { getCurrentUser } from "./session";
import { can, type Capability } from "@/lib/domain/user";
import type { UserRecord } from "@/lib/domain/user";

/** Not signed in (or session invalid/expired). */
export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/** Signed in, but the role lacks the capability. */
export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to do that.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Returns the signed-in user or throws. Use at the top of any admin action. */
export async function requireUser(): Promise<UserRecord> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/**
 * Returns the signed-in user only if their role has `capability`, else throws.
 * This is the real enforcement point — hiding a button in the UI is a courtesy,
 * not a control, so every mutating action gates on this.
 */
export async function requireCapability(capability: Capability): Promise<UserRecord> {
  const user = await requireUser();
  if (!can(user.role, capability)) {
    throw new ForbiddenError();
  }
  return user;
}
