/**
 * Admin users and the role hierarchy.
 *
 * Roles are ordered Owner > Admin > Editor, but authorization is expressed as
 * explicit capabilities rather than role comparisons, so a check reads as "can
 * this person delete content" instead of "is this person at least an admin".
 * The rule the owner asked for — admins can publish but not delete, only the
 * owner manages users — lives in ROLE_CAPABILITIES below and nowhere else.
 */

export type Role = "OWNER" | "ADMIN" | "EDITOR";

export const ROLES: readonly Role[] = ["OWNER", "ADMIN", "EDITOR"];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

/** Things a signed-in user may be allowed to do. */
export type Capability =
  | "content.write" // create / edit / publish articles and jobs
  | "content.delete" // permanently delete articles and jobs
  | "authors.manage" // add / manage the author list
  | "ads.manage" // create / edit / activate advertisements
  | "users.manage" // invite, change roles, deactivate users
  | "settings.manage"; // site-wide settings

const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
  OWNER: ["content.write", "content.delete", "authors.manage", "ads.manage", "users.manage", "settings.manage"],
  ADMIN: ["content.write", "authors.manage", "ads.manage"],
  EDITOR: ["content.write"],
};

/** Whether a role is permitted a capability. */
export function can(role: Role, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}

/** The persisted shape of an admin user. Never carries the password hash out. */
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
}

/** UserRecord plus the hash — used only inside the auth layer at sign-in. */
export interface UserWithSecret extends UserRecord {
  passwordHash: string;
}
