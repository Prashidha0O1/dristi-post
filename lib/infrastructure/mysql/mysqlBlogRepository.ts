import type { RowDataPacket } from "mysql2";
import type { BlogRepository } from "@/lib/domain/ports";
import type { Paginated } from "@/lib/domain/article";
import type { BlogQuery, BlogRecord } from "@/lib/domain/blog";
import { localisedFromRow } from "@/lib/domain/article";
import { getPool, fromDbDateTime, toDbDateTime } from "./pool";
import { STATUS_TO_DB, STATUS_FROM_DB } from "./enums";

type Row = RowDataPacket & Record<string, unknown>;

function toDomain(row: Row): BlogRecord {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: localisedFromRow(row.titleNe, row.titleEn),
    excerpt: localisedFromRow(row.excerptNe, row.excerptEn),
    metaDescription: localisedFromRow(row.meta_description_ne, row.meta_description_en),
    heroImage: row.heroImage as string,
    heroImageAlt: (row.heroImageAlt as string) || undefined,
    body: localisedFromRow(row.bodyNe, row.bodyEn),
    status: STATUS_FROM_DB[row.status as string] ?? "draft",
    createdAt: fromDbDateTime(row.createdAt),
    updatedAt: fromDbDateTime(row.updatedAt),
    isFeatured: Boolean(row.is_featured),
    publishedAt: row.publishedAt ? fromDbDateTime(row.publishedAt) : undefined,
  };
}

export class MysqlBlogRepository implements BlogRepository {
  async findById(id: string): Promise<BlogRecord | null> {
    const [rows] = await getPool().query<Row[]>("SELECT * FROM blogs WHERE id = ? LIMIT 1", [id]);
    return rows.length ? toDomain(rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<BlogRecord | null> {
    const [rows] = await getPool().query<Row[]>("SELECT * FROM blogs WHERE slug = ? LIMIT 1", [slug]);
    return rows.length ? toDomain(rows[0]) : null;
  }

  async list(query: BlogQuery): Promise<Paginated<BlogRecord>> {
    const where: string[] = [];
    const params: unknown[] = [];

    if (query.status) {
      where.push("status = ?");
      params.push(STATUS_TO_DB[query.status]);
    }
    if (query.search) {
      where.push("(titleNe LIKE ? OR titleEn LIKE ?)");
      const like = `%${query.search}%`;
      params.push(like, like);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [countRows] = await getPool().query<Row[]>(
      `SELECT COUNT(*) AS total FROM blogs ${whereSql}`,
      params,
    );
    const total = Number(countRows[0]?.total ?? 0);

    let sql = `SELECT * FROM blogs ${whereSql} ORDER BY publishedAt IS NULL, publishedAt DESC, createdAt DESC`;
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const listParams = [...params];
    if (limit > 0) {
      sql += " LIMIT ? OFFSET ?";
      listParams.push(limit, offset);
    }

    const [rows] = await getPool().query<Row[]>(sql, listParams);
    return { items: rows.map(toDomain), total };
  }

  async save(blog: BlogRecord): Promise<void> {
    await getPool().query(
      `INSERT INTO blogs
        (id, slug, titleNe, titleEn, excerptNe, excerptEn, heroImage, heroImageAlt,
         bodyNe, bodyEn, status, createdAt, updatedAt, publishedAt, is_featured, meta_description_ne, meta_description_en)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         slug=VALUES(slug), titleNe=VALUES(titleNe), titleEn=VALUES(titleEn),
         excerptNe=VALUES(excerptNe), excerptEn=VALUES(excerptEn),
         heroImage=VALUES(heroImage), heroImageAlt=VALUES(heroImageAlt), bodyNe=VALUES(bodyNe), bodyEn=VALUES(bodyEn),
         status=VALUES(status), updatedAt=VALUES(updatedAt), publishedAt=VALUES(publishedAt), is_featured=VALUES(is_featured), meta_description_ne=VALUES(meta_description_ne), meta_description_en=VALUES(meta_description_en)`,
      [
        blog.id,
        blog.slug,
        blog.title.ne ?? "",
        blog.title.en ?? null,
        blog.excerpt.ne ?? null,
        blog.excerpt.en ?? null,
        blog.heroImage,
        blog.heroImageAlt ?? null,
        blog.body.ne ?? "",
        blog.body.en ?? null,
        STATUS_TO_DB[blog.status],
        toDbDateTime(blog.createdAt),
        toDbDateTime(blog.updatedAt),
        toDbDateTime(blog.publishedAt),
        blog.isFeatured ? 1 : 0,
        blog.metaDescription?.ne ?? null,
        blog.metaDescription?.en ?? null,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await getPool().query("DELETE FROM blogs WHERE id = ?", [id]);
  }
}
