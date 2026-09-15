import "server-only";
import { randomBytes } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import { getPool, fromDbDateTime, toDbDateTime } from "@/lib/infrastructure/mysql/pool";
import { isRole, type Role } from "@/lib/domain/user";

/**
 * Invitations. Only an owner creates them (enforced in the action layer). An
 * invite carries the email and the role the new user will get; accepting it
 * creates the user and sets their password. Tokens are single-use and expire.
 */

export type InviteRole = Exclude<Role, "OWNER">; // owners aren't invited

export interface InviteRecord {
  id: string;
  email: string;
  role: InviteRole;
  token: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

type Row = RowDataPacket & Record<string, unknown>;

const INVITE_TTL_DAYS = 7;

function toRecord(row: Row): InviteRecord {
  return {
    id: row.id as string,
    email: row.email as string,
    role: isRole(row.role as string) ? (row.role as InviteRole) : "EDITOR",
    token: row.token as string,
    expiresAt: fromDbDateTime(row.expiresAt),
    acceptedAt: row.acceptedAt ? fromDbDateTime(row.acceptedAt) : undefined,
    createdAt: fromDbDateTime(row.createdAt),
  };
}

/** Creates (or refreshes) an invite for an email and returns its token. */
export async function createInvite(
  email: string,
  role: InviteRole,
  invitedBy: string,
): Promise<InviteRecord> {
  const token = randomBytes(32).toString("base64url");
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  await getPool().query(
    `INSERT INTO invites (id, email, role, token, invitedBy, expiresAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, email.trim().toLowerCase(), role, token, invitedBy, toDbDateTime(expiresAt.toISOString())],
  );

  return {
    id,
    email: email.trim().toLowerCase(),
    role,
    token,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
  };
}

/** Pending (not yet accepted, not expired) invites, newest first. */
export async function listPendingInvites(): Promise<InviteRecord[]> {
  const [rows] = await getPool().query<Row[]>(
    `SELECT * FROM invites
     WHERE acceptedAt IS NULL AND expiresAt > NOW(3)
     ORDER BY createdAt DESC`,
  );
  return rows.map(toRecord);
}

/** A usable invite for a token, or null if missing/expired/already accepted. */
export async function findValidInvite(token: string): Promise<InviteRecord | null> {
  const [rows] = await getPool().query<Row[]>(
    `SELECT * FROM invites
     WHERE token = ? AND acceptedAt IS NULL AND expiresAt > NOW(3)
     LIMIT 1`,
    [token],
  );
  return rows.length ? toRecord(rows[0]) : null;
}

/** Deletes a pending invite (owner cancels it). */
export async function deleteInvite(id: string): Promise<void> {
  await getPool().query("DELETE FROM invites WHERE id = ?", [id]);
}

/**
 * Accepts an invite: creates the user with the invite's role and marks the
 * invite used, atomically. Returns the new user id, or null if the invite is
 * no longer valid or the email is already taken.
 */
export async function acceptInvite(
  token: string,
  name: string,
  passwordHash: string,
): Promise<string | null> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [invRows] = await conn.query<Row[]>(
      `SELECT * FROM invites
       WHERE token = ? AND acceptedAt IS NULL AND expiresAt > NOW(3)
       LIMIT 1 FOR UPDATE`,
      [token],
    );
    if (invRows.length === 0) {
      await conn.rollback();
      return null;
    }
    const invite = toRecord(invRows[0]);

    const [dupe] = await conn.query<Row[]>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [invite.email],
    );
    if (dupe.length > 0) {
      await conn.rollback();
      return null;
    }

    const userId = crypto.randomUUID();
    await conn.query(
      `INSERT INTO users (id, email, passwordHash, name, role, isActive, emailVerifiedAt)
       VALUES (?, ?, ?, ?, ?, 1, NOW(3))`,
      [userId, invite.email, passwordHash, name.trim(), invite.role],
    );
    await conn.query("UPDATE invites SET acceptedAt = NOW(3) WHERE id = ?", [invite.id]);

    await conn.commit();
    return userId;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
