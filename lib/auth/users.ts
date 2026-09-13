import "server-only";
import type { RowDataPacket } from "mysql2";
import { getPool, fromDbDateTime, toBool } from "@/lib/infrastructure/mysql/pool";
import { isRole, type Role, type UserRecord, type UserWithSecret } from "@/lib/domain/user";

type Row = RowDataPacket & Record<string, unknown>;

function toRecord(row: Row): UserRecord {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    role: isRole(row.role as string) ? (row.role as Role) : "EDITOR",
    isActive: toBool(row.isActive),
    emailVerifiedAt: row.emailVerifiedAt ? fromDbDateTime(row.emailVerifiedAt) : undefined,
    createdAt: fromDbDateTime(row.createdAt),
  };
}

/** Sign-in path: returns the hash too. Email match is case-insensitive. */
export async function findUserByEmailWithSecret(email: string): Promise<UserWithSecret | null> {
  const [rows] = await getPool().query<Row[]>(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()],
  );
  if (rows.length === 0) return null;
  return { ...toRecord(rows[0]), passwordHash: rows[0].passwordHash as string };
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const [rows] = await getPool().query<Row[]>("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows.length ? toRecord(rows[0]) : null;
}

export async function listUsers(): Promise<UserRecord[]> {
  const [rows] = await getPool().query<Row[]>("SELECT * FROM users ORDER BY createdAt ASC");
  return rows.map(toRecord);
}

export async function emailExists(email: string): Promise<boolean> {
  const [rows] = await getPool().query<Row[]>(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()],
  );
  return rows.length > 0;
}

/** Change a user's role. OWNER is intentionally not assignable here. */
export async function updateUserRole(id: string, role: Role): Promise<void> {
  await getPool().query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
}

/** Activate/deactivate. Deactivating also drops the user's sessions. */
export async function setUserActive(id: string, active: boolean): Promise<void> {
  const pool = getPool();
  await pool.query("UPDATE users SET isActive = ? WHERE id = ?", [active ? 1 : 0, id]);
  if (!active) {
    await pool.query("DELETE FROM sessions WHERE userId = ?", [id]);
  }
}
