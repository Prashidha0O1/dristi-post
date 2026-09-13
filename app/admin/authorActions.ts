"use server";

import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/infrastructure/mysql/pool";
import { requireCapability } from "@/lib/auth/guard";
import type { AuthorOption } from "@/lib/adminQueries";

/**
 * Creates an author from a typed name. Owner/admin only — enforced here, not
 * just hidden in the UI. Used by the creatable author dropdown on the article
 * form so editors don't have to be provisioned as authors ahead of time.
 *
 * `name` is stored as the Nepali name (the portal's primary language); an
 * English name can be edited later. Returns the new option, or an existing one
 * if a matching author is already present (so double-adds don't duplicate).
 */
export async function createAuthorAction(
  name: string,
): Promise<{ ok: true; author: AuthorOption } | { ok: false; error: string }> {
  try {
    await requireCapability("authors.manage");
  } catch {
    return { ok: false, error: "Only an owner or admin can add authors." };
  }

  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Enter a name." };
  if (trimmed.length > 191) return { ok: false, error: "That name is too long." };

  const pool = getPool();

  // Reuse an existing author with the same name rather than creating a duplicate.
  type Row = RowDataPacket & { id: string; nameNe: string; nameEn: string | null };
  const [existing] = await pool.query<Row[]>(
    "SELECT id, nameNe, nameEn FROM authors WHERE nameNe = ? OR nameEn = ? LIMIT 1",
    [trimmed, trimmed],
  );
  if (existing.length > 0) {
    const row = existing[0];
    return {
      ok: true,
      author: { id: row.id, nameNe: row.nameNe, nameEn: row.nameEn ?? undefined },
    };
  }

  const id = crypto.randomUUID();
  await pool.query("INSERT INTO authors (id, nameNe, nameEn) VALUES (?, ?, NULL)", [id, trimmed]);
  return { ok: true, author: { id, nameNe: trimmed } };
}
