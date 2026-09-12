import type { RowDataPacket } from "mysql2";
import type { AdRepository } from "@/lib/domain/ports";
import type { Paginated } from "@/lib/domain/article";
import type { AdQuery, AdRecord } from "@/lib/domain/ad";
import type { AdPlacement } from "@/lib/adSlots";
import { getPool, fromDbDateTime, toDbDateTime, toBool } from "./pool";
import { PLACEMENT_TO_DB, PLACEMENT_FROM_DB } from "./enums";

type Row = RowDataPacket & Record<string, unknown>;

function toDomain(row: Row): AdRecord {
  return {
    id: row.id as string,
    placement: PLACEMENT_FROM_DB[row.placement as string] ?? "sidebar",
    imageUrl: row.imageUrl as string,
    linkUrl: row.linkUrl as string,
    altText: (row.altText as string) ?? "",
    isActive: toBool(row.isActive),
    createdAt: fromDbDateTime(row.createdAt),
    updatedAt: fromDbDateTime(row.updatedAt),
  };
}

export class MysqlAdRepository implements AdRepository {
  async findById(id: string): Promise<AdRecord | null> {
    const [rows] = await getPool().query<Row[]>("SELECT * FROM ads WHERE id = ? LIMIT 1", [id]);
    return rows.length ? toDomain(rows[0]) : null;
  }

  async findActiveByPlacement(placement: AdPlacement): Promise<AdRecord | null> {
    const [rows] = await getPool().query<Row[]>(
      "SELECT * FROM ads WHERE placement = ? AND isActive = 1 LIMIT 1",
      [PLACEMENT_TO_DB[placement]],
    );
    return rows.length ? toDomain(rows[0]) : null;
  }

  async list(query: AdQuery): Promise<Paginated<AdRecord>> {
    const where: string[] = [];
    const params: unknown[] = [];

    if (query.placement) {
      where.push("placement = ?");
      params.push(PLACEMENT_TO_DB[query.placement]);
    }
    if (query.isActive !== undefined) {
      where.push("isActive = ?");
      params.push(query.isActive ? 1 : 0);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [countRows] = await getPool().query<Row[]>(
      `SELECT COUNT(*) AS total FROM ads ${whereSql}`,
      params,
    );
    const total = Number(countRows[0]?.total ?? 0);

    // Active first, then newest — the live ad for a slot is the one wanted.
    let sql = `SELECT * FROM ads ${whereSql} ORDER BY isActive DESC, createdAt DESC`;
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;
    const listParams = [...params];
    if (limit > 0) {
      sql += " LIMIT ? OFFSET ?";
      listParams.push(limit, offset);
    }

    const [rows] = await getPool().query<Row[]>(sql, listParams);
    return { items: rows.map(toDomain), total };
  }

  async save(ad: AdRecord): Promise<void> {
    // `activePlacement` is a generated column enforcing one active ad per slot;
    // it is never written directly. createdAt is set on insert, kept on update.
    await getPool().query(
      `INSERT INTO ads
        (id, placement, imageUrl, linkUrl, altText, isActive, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         placement=VALUES(placement), imageUrl=VALUES(imageUrl),
         linkUrl=VALUES(linkUrl), altText=VALUES(altText),
         isActive=VALUES(isActive), updatedAt=VALUES(updatedAt)`,
      [
        ad.id,
        PLACEMENT_TO_DB[ad.placement],
        ad.imageUrl,
        ad.linkUrl,
        ad.altText,
        ad.isActive ? 1 : 0,
        toDbDateTime(ad.createdAt),
        toDbDateTime(ad.updatedAt),
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await getPool().query("DELETE FROM ads WHERE id = ?", [id]);
  }
}
