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
