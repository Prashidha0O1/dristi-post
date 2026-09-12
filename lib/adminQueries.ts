import "server-only";
import type { RowDataPacket } from "mysql2";
import { getPool } from "./infrastructure/mysql/pool";

/**
 * Read-side helpers for the admin console only. Small, admin-only, low-traffic
 * reads (populating a picker) with no public-site caching concerns, so a
 * dedicated port/adapter pair would be more machinery than the problem needs.
 */

export interface AuthorOption {
  id: string;
  nameNe: string;
  nameEn?: string;
}

type Row = RowDataPacket & Record<string, unknown>;

export async function listAuthorOptions(): Promise<AuthorOption[]> {
  try {
    const [rows] = await getPool().query<Row[]>(
      "SELECT id, nameNe, nameEn FROM authors ORDER BY nameNe",
    );
    return rows.map((row) => ({
      id: row.id as string,
      nameNe: row.nameNe as string,
      nameEn: (row.nameEn as string) ?? undefined,
    }));
  } catch {
    // Mirrors the old behaviour: a read failure yields an empty picker rather
    // than crashing the page (the article form still renders).
    return [];
  }
}
