import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { RowDataPacket } from "mysql2";
import { getPool, toDbDateTime } from "@/lib/infrastructure/mysql/pool";
import { findUserById } from "./users";
import { SESSION_COOKIE } from "./cookie";
import type { UserRecord } from "@/lib/domain/user";

/**
 * Opaque session tokens over the `sessions` table.
 *
 * The cookie holds a random token; the database stores only its SHA-256 hash,
 * so a leaked database dump cannot be used to forge sessions. Validation is a
 * single indexed lookup — deliberately NOT done in proxy.ts (which stays
 * DB-free); the real gate is getCurrentUser(), called from the admin layout and
 * every mutating action.
 */

export { SESSION_COOKIE };
const SESSION_TTL_DAYS = 30;

type Row = RowDataPacket & Record<string, unknown>;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a session for a user and sets the cookie. Returns the raw token. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const id = hashToken(token);
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await getPool().query(
    "INSERT INTO sessions (id, userId, expiresAt) VALUES (?, ?, ?)",
    [id, userId, toDbDateTime(expires.toISOString())],
  );

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

/** Resolves the current request's session to a user, or null. */
export async function getCurrentUser(): Promise<UserRecord | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [rows] = await getPool().query<Row[]>(
    "SELECT userId, expiresAt FROM sessions WHERE id = ? LIMIT 1",
    [hashToken(token)],
  );
  if (rows.length === 0) return null;

  // Expired: clean it up and treat as signed out.
  if (new Date(rows[0].expiresAt as string) < new Date()) {
    await getPool().query("DELETE FROM sessions WHERE id = ?", [hashToken(token)]);
    return null;
  }

  const user = await findUserById(rows[0].userId as string);
  // A deactivated user's sessions stop working immediately.
  if (!user || !user.isActive) return null;
  return user;
}

/** Deletes the current session row and clears the cookie. */
export async function destroyCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await getPool().query("DELETE FROM sessions WHERE id = ?", [hashToken(token)]);
    store.delete(SESSION_COOKIE);
  }
}
