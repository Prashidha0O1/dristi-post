import type { RowDataPacket } from "mysql2";
import type { JobRepository } from "@/lib/domain/ports";
import type { Paginated } from "@/lib/domain/article";
import type { JobQuery, JobRecord } from "@/lib/domain/job";
import { localisedFromRow } from "@/lib/domain/article";
import { getPool, fromDbDateTime, fromDbDate, toDbDateTime, toBool } from "./pool";
import {
  STATUS_TO_DB,
  STATUS_FROM_DB,
  PROVINCE_TO_DB,
  PROVINCE_FROM_DB,
  EMPLOYMENT_TO_DB,
  EMPLOYMENT_FROM_DB,
} from "./enums";

type Row = RowDataPacket & Record<string, unknown>;

function toDomain(row: Row): JobRecord {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: localisedFromRow(row.titleNe, row.titleEn),
    company: row.company as string,
    location: row.location as string,
    provinceSlug: row.province ? PROVINCE_FROM_DB[row.province as string] : undefined,
    employmentType: EMPLOYMENT_FROM_DB[row.employmentType as string] ?? "full-time",
    description: localisedFromRow(row.descriptionNe, row.descriptionEn),
    metaDescription: localisedFromRow(row.metaDescriptionNe, row.metaDescriptionEn),
    salary: (row.salary as string) ?? undefined,
    deadline: fromDbDate(row.deadline),
    applyUrl: row.applyUrl as string,
    status: STATUS_FROM_DB[row.status as string] ?? "draft",
    isFeatured: toBool(row.isFeatured),
    createdAt: fromDbDateTime(row.createdAt),
    updatedAt: fromDbDateTime(row.updatedAt),
    publishedAt: row.publishedAt ? fromDbDateTime(row.publishedAt) : undefined,
    deletedAt: row.deletedAt ? fromDbDateTime(row.deletedAt) : undefined,
  };
}

export class MysqlJobRepository implements JobRepository {
  async findById(id: string): Promise<JobRecord | null> {
    const [rows] = await getPool().query<Row[]>("SELECT * FROM jobs WHERE id = ? LIMIT 1", [id]);
    return rows.length ? toDomain(rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<JobRecord | null> {
    const [rows] = await getPool().query<Row[]>("SELECT * FROM jobs WHERE slug = ? LIMIT 1", [slug]);
    return rows.length ? toDomain(rows[0]) : null;
  }

  async list(query: JobQuery): Promise<Paginated<JobRecord>> {
    const where: string[] = [];
    const params: unknown[] = [];

    // Trashed listings are hidden everywhere except the Trash view.
    where.push(query.onlyDeleted ? "deletedAt IS NOT NULL" : "deletedAt IS NULL");
    if (query.status) {
      where.push("status = ?");
      params.push(STATUS_TO_DB[query.status]);
    }
    if (query.provinceSlug) {
      where.push("province = ?");
      params.push(PROVINCE_TO_DB[query.provinceSlug]);
    }
    if (query.employmentType) {
      where.push("employmentType = ?");
      params.push(EMPLOYMENT_TO_DB[query.employmentType]);
    }
    if (query.search) {
      where.push("(titleNe LIKE ? OR titleEn LIKE ? OR company LIKE ?)");
      const like = `%${query.search}%`;
      params.push(like, like, like);
    }
    if (query.activeOnly) {
      // A null deadline means "open until filled", so it stays visible.
      where.push("(deadline IS NULL OR deadline >= ?)");
      params.push(new Date().toISOString().slice(0, 10));
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [countRows] = await getPool().query<Row[]>(
      `SELECT COUNT(*) AS total FROM jobs ${whereSql}`,
      params,
    );
    const total = Number(countRows[0]?.total ?? 0);

    let sql = `SELECT * FROM jobs ${whereSql} ORDER BY publishedAt IS NULL, publishedAt DESC`;
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

  async save(job: JobRecord): Promise<void> {
    await getPool().query(
      `INSERT INTO jobs
        (id, slug, titleNe, titleEn, company, location, province, employmentType,
         descriptionNe, descriptionEn, metaDescriptionNe, metaDescriptionEn, salary, deadline, applyUrl, status,
         isFeatured, createdAt, updatedAt, publishedAt, deletedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         slug=VALUES(slug), titleNe=VALUES(titleNe), titleEn=VALUES(titleEn),
         company=VALUES(company), location=VALUES(location),
         province=VALUES(province), employmentType=VALUES(employmentType),
         descriptionNe=VALUES(descriptionNe), descriptionEn=VALUES(descriptionEn),
         metaDescriptionNe=VALUES(metaDescriptionNe), metaDescriptionEn=VALUES(metaDescriptionEn),
         salary=VALUES(salary), deadline=VALUES(deadline), applyUrl=VALUES(applyUrl),
         status=VALUES(status), isFeatured=VALUES(isFeatured),
         updatedAt=VALUES(updatedAt), publishedAt=VALUES(publishedAt), deletedAt=VALUES(deletedAt)`,
      [
        job.id,
        job.slug,
        job.title.ne ?? "",
        job.title.en ?? null,
        job.company,
        job.location,
        job.provinceSlug ? PROVINCE_TO_DB[job.provinceSlug] : null,
        EMPLOYMENT_TO_DB[job.employmentType],
        job.description.ne ?? "",
        job.description.en ?? null,
        job.metaDescription?.ne ?? null,
        job.metaDescription?.en ?? null,
        job.salary ?? null,
        job.deadline ?? null,
        job.applyUrl,
        STATUS_TO_DB[job.status],
        job.isFeatured,
        toDbDateTime(job.createdAt),
        toDbDateTime(job.updatedAt),
        toDbDateTime(job.publishedAt),
        toDbDateTime(job.deletedAt),
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await getPool().query("DELETE FROM jobs WHERE id = ?", [id]);
  }

  async softDelete(id: string, at: string): Promise<void> {
    await getPool().query("UPDATE jobs SET deletedAt = ? WHERE id = ?", [toDbDateTime(at), id]);
  }

  async restore(id: string): Promise<void> {
    await getPool().query("UPDATE jobs SET deletedAt = NULL WHERE id = ?", [id]);
  }

  async purgeDeletedBefore(at: string): Promise<void> {
    await getPool().query("DELETE FROM jobs WHERE deletedAt IS NOT NULL AND deletedAt < ?", [toDbDateTime(at)]);
  }
}
