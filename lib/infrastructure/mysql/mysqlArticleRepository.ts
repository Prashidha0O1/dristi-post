import type { RowDataPacket } from "mysql2";
import type { ArticleRepository } from "@/lib/domain/ports";
import type { ArticleQuery, ArticleRecord, Paginated } from "@/lib/domain/article";
import { localisedFromRow } from "@/lib/domain/article";
import { getPool, fromDbDateTime, toDbDateTime, toBool } from "./pool";
import {
  STATUS_TO_DB,
  STATUS_FROM_DB,
  PROVINCE_TO_DB,
  PROVINCE_FROM_DB,
} from "./enums";

/**
 * MySQL adapter for articles.
 *
 * Replaces the Supabase PostgREST embed with an explicit LEFT JOIN for the
 * category slug and author name, and a second query for tags (a many-to-many
 * through `article_tags`). Unlike PostgREST, every filter value is passed as a
 * bound parameter — the old `.or("...ilike.%" + search)` interpolated the raw
 * search term, which in raw SQL would be an injection hole.
 */

type Row = RowDataPacket & Record<string, unknown>;

const SELECT_JOINED = `
  SELECT a.*, c.slug AS categorySlug,
         au.nameNe AS authorNameNe, au.nameEn AS authorNameEn
  FROM articles a
  LEFT JOIN categories c ON c.id = a.categoryId
  LEFT JOIN authors au ON au.id = a.authorId
`;

function toDomain(row: Row, tagSlugs: string[]): ArticleRecord {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: localisedFromRow(row.titleNe, row.titleEn),
    excerpt: localisedFromRow(row.excerptNe, row.excerptEn),
    body: localisedFromRow(row.bodyNe, row.bodyEn),
    metaDescription: (row.metaDescription as string) || undefined,
    categorySlug: (row.categorySlug as string) ?? "",
    provinceSlug: row.province ? PROVINCE_FROM_DB[row.province as string] : undefined,
    authorId: row.authorId as string,
    imageUrl: row.imageUrl as string,
    status: STATUS_FROM_DB[row.status as string] ?? "draft",
    tagSlugs,
    isFeatured: toBool(row.isFeatured),
    isBreaking: toBool(row.isBreaking),
    isTrending: toBool(row.isTrending),
    createdAt: fromDbDateTime(row.createdAt),
    updatedAt: fromDbDateTime(row.updatedAt),
    publishedAt: row.publishedAt ? fromDbDateTime(row.publishedAt) : undefined,
    deletedAt: row.deletedAt ? fromDbDateTime(row.deletedAt) : undefined,
    authorName:
      row.authorNameNe || row.authorNameEn
        ? localisedFromRow(row.authorNameNe, row.authorNameEn)
        : undefined,
  };
}

/** Tag slugs for a set of article ids, grouped by article id. */
async function tagsByArticle(ids: string[]): Promise<Map<string, string[]>> {
  const out = new Map<string, string[]>();
  if (ids.length === 0) return out;
  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await getPool().query<Row[]>(
    `SELECT at.articleId AS articleId, t.slug AS slug
     FROM article_tags at
     JOIN tags t ON t.id = at.tagId
     WHERE at.articleId IN (${placeholders})`,
    ids,
  );
  for (const r of rows) {
    const list = out.get(r.articleId as string) ?? [];
    list.push(r.slug as string);
    out.set(r.articleId as string, list);
  }
  return out;
}

export class MysqlArticleRepository implements ArticleRepository {
  async findById(id: string): Promise<ArticleRecord | null> {
    const [rows] = await getPool().query<Row[]>(`${SELECT_JOINED} WHERE a.id = ? LIMIT 1`, [id]);
    if (rows.length === 0) return null;
    const tags = await tagsByArticle([id]);
    return toDomain(rows[0], tags.get(id) ?? []);
  }

  async findBySlug(slug: string): Promise<ArticleRecord | null> {
    const [rows] = await getPool().query<Row[]>(`${SELECT_JOINED} WHERE a.slug = ? LIMIT 1`, [slug]);
    if (rows.length === 0) return null;
    const id = rows[0].id as string;
    const tags = await tagsByArticle([id]);
    return toDomain(rows[0], tags.get(id) ?? []);
  }

  async list(query: ArticleQuery): Promise<Paginated<ArticleRecord>> {
    const where: string[] = [];
    const params: unknown[] = [];

    if (query.status) {
      where.push("a.status = ?");
      params.push(STATUS_TO_DB[query.status]);
    }
    if (query.provinceSlug) {
      where.push("a.province = ?");
      params.push(PROVINCE_TO_DB[query.provinceSlug]);
    }
    if (query.categorySlug) {
      // Filter by the joined category slug directly, no extra round-trip.
      where.push("c.slug = ?");
      params.push(query.categorySlug);
    }
    if (query.search) {
      // Bound parameters, not interpolation. utf8mb4_unicode_ci is already
      // case-insensitive, so a plain LIKE matches what ilike did.
      where.push("(a.titleNe LIKE ? OR a.titleEn LIKE ?)");
      const like = `%${query.search}%`;
      params.push(like, like);
    }
    // Trash: default excludes soft-deleted; onlyDeleted lists just the trash.
    where.push(query.onlyDeleted ? "a.deletedAt IS NOT NULL" : "a.deletedAt IS NULL");
    // Scheduling: hide articles whose publishedAt is still in the future.
    if (query.publishedBefore) {
      where.push("(a.publishedAt IS NULL OR a.publishedAt <= ?)");
      params.push(toDbDateTime(query.publishedBefore));
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [countRows] = await getPool().query<Row[]>(
      `SELECT COUNT(*) AS total FROM articles a
       LEFT JOIN categories c ON c.id = a.categoryId
       ${whereSql}`,
      params,
    );
    const total = Number(countRows[0]?.total ?? 0);

    // NULLs last on DESC: MySQL sorts NULLs first, so order by the null-ness
    // flag first (mirrors the old nullsFirst:false).
    let sql = `${SELECT_JOINED} ${whereSql} ORDER BY a.publishedAt IS NULL, a.publishedAt DESC`;

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const listParams = [...params];
    if (limit > 0) {
      sql += " LIMIT ? OFFSET ?";
      listParams.push(limit, offset);
    }

    const [rows] = await getPool().query<Row[]>(sql, listParams);
    const tags = await tagsByArticle(rows.map((r) => r.id as string));

    return {
      items: rows.map((r) => toDomain(r, tags.get(r.id as string) ?? [])),
      total,
    };
  }

  async save(article: ArticleRecord): Promise<void> {
    const pool = getPool();

    // Resolve the category slug to its id up front, mirroring the old adapter's
    // explicit check so a bad slug is a clear error rather than a FK failure.
    const [cats] = await pool.query<Row[]>(
      "SELECT id FROM categories WHERE slug = ? LIMIT 1",
      [article.categorySlug],
    );
    if (cats.length === 0) throw new Error(`Category "${article.categorySlug}" not found`);
    const categoryId = cats[0].id as string;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Upsert the article. createdAt is set on insert and preserved on update
      // (left out of the UPDATE clause) so an edit never resets it.
      await conn.query(
        `INSERT INTO articles
          (id, slug, titleNe, titleEn, excerptNe, excerptEn, bodyNe, bodyEn,
           metaDescription, imageUrl, status, province, categoryId, authorId,
           isFeatured, isBreaking, isTrending, createdAt, updatedAt, publishedAt, deletedAt)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           slug=VALUES(slug), titleNe=VALUES(titleNe), titleEn=VALUES(titleEn),
           excerptNe=VALUES(excerptNe), excerptEn=VALUES(excerptEn),
           bodyNe=VALUES(bodyNe), bodyEn=VALUES(bodyEn),
           metaDescription=VALUES(metaDescription), imageUrl=VALUES(imageUrl),
           status=VALUES(status), province=VALUES(province),
           categoryId=VALUES(categoryId), authorId=VALUES(authorId),
           isFeatured=VALUES(isFeatured), isBreaking=VALUES(isBreaking),
           isTrending=VALUES(isTrending), updatedAt=VALUES(updatedAt),
           publishedAt=VALUES(publishedAt), deletedAt=VALUES(deletedAt)`,
        [
          article.id,
          article.slug,
          article.title.ne ?? "",
          article.title.en ?? null,
          article.excerpt.ne ?? "",
          article.excerpt.en ?? null,
          article.body.ne ?? "",
          article.body.en ?? null,
          article.metaDescription ?? null,
          article.imageUrl,
          STATUS_TO_DB[article.status],
          article.provinceSlug ? PROVINCE_TO_DB[article.provinceSlug] : null,
          categoryId,
          article.authorId,
          article.isFeatured,
          article.isBreaking,
          article.isTrending,
          toDbDateTime(article.createdAt),
          toDbDateTime(article.updatedAt),
          toDbDateTime(article.publishedAt),
          toDbDateTime(article.deletedAt),
        ],
      );

      // Re-sync tags: clear, then link. Unlike the Supabase adapter, missing
      // tags are created rather than silently dropped — on a fresh database the
      // tags table starts empty, so link-only would make the field dead.
      await conn.query("DELETE FROM article_tags WHERE articleId = ?", [article.id]);
      for (const slug of article.tagSlugs) {
        // INSERT IGNORE is a no-op when the slug already exists; then read the
        // id (whether just-created or pre-existing) and link it.
        await conn.query("INSERT IGNORE INTO tags (id, slug) VALUES (?, ?)", [
          crypto.randomUUID(),
          slug,
        ]);
        const [tagRows] = await conn.query<Row[]>(
          "SELECT id FROM tags WHERE slug = ? LIMIT 1",
          [slug],
        );
        if (tagRows.length) {
          await conn.query(
            "INSERT IGNORE INTO article_tags (articleId, tagId) VALUES (?, ?)",
            [article.id, tagRows[0].id as string],
          );
        }
      }

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  async softDelete(id: string, at: string): Promise<void> {
    await getPool().query("UPDATE articles SET deletedAt = ? WHERE id = ?", [toDbDateTime(at), id]);
  }

  async restore(id: string): Promise<void> {
    await getPool().query("UPDATE articles SET deletedAt = NULL WHERE id = ?", [id]);
  }

  async purgeDeletedBefore(at: string): Promise<void> {
    await getPool().query("DELETE FROM articles WHERE deletedAt IS NOT NULL AND deletedAt < ?", [
      toDbDateTime(at),
    ]);
  }

  async delete(id: string): Promise<void> {
    // article_tags rows are removed by the ON DELETE CASCADE foreign key.
    await getPool().query("DELETE FROM articles WHERE id = ?", [id]);
  }
}
