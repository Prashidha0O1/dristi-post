import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "./supabaseServer";
import type { JobRepository } from "@/lib/domain/ports";
import type { Paginated } from "@/lib/domain/article";
import type { EmploymentType, JobQuery, JobRecord, JobStatus } from "@/lib/domain/job";
import type { ProvinceSlug } from "@/lib/domain/province";

type Row = Record<string, unknown>;

const STATUS_MAP: Record<JobStatus, string> = { draft: "DRAFT", published: "PUBLISHED" };
const STATUS_REVERSE: Record<string, JobStatus> = { DRAFT: "draft", PUBLISHED: "published" };

const PROVINCE_MAP: Record<ProvinceSlug, string> = {
  koshi: "KOSHI", madhesh: "MADHESH", bagmati: "BAGMATI", gandaki: "GANDAKI",
  lumbini: "LUMBINI", karnali: "KARNALI", sudurpashchim: "SUDURPASHCHIM",
};
const PROVINCE_REVERSE: Record<string, ProvinceSlug> = Object.fromEntries(
  Object.entries(PROVINCE_MAP).map(([k, v]) => [v, k]),
) as Record<string, ProvinceSlug>;

const EMPLOYMENT_MAP: Record<EmploymentType, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACT",
  internship: "INTERNSHIP",
  freelance: "FREELANCE",
};
const EMPLOYMENT_REVERSE: Record<string, EmploymentType> = Object.fromEntries(
  Object.entries(EMPLOYMENT_MAP).map(([k, v]) => [v, k]),
) as Record<string, EmploymentType>;

function toDomain(row: Row): JobRecord {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: { ne: row.titleNe as string, en: (row.titleEn as string) ?? undefined },
    company: row.company as string,
    location: row.location as string,
    provinceSlug: row.province ? PROVINCE_REVERSE[row.province as string] : undefined,
    employmentType: EMPLOYMENT_REVERSE[row.employmentType as string] ?? "full-time",
    description: {
      ne: row.descriptionNe as string,
      en: (row.descriptionEn as string) ?? undefined,
    },
    salary: (row.salary as string) ?? undefined,
    deadline: (row.deadline as string) ?? undefined,
    applyUrl: row.applyUrl as string,
    status: STATUS_REVERSE[row.status as string] ?? "draft",
    isFeatured: (row.isFeatured as boolean) ?? false,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
    publishedAt: (row.publishedAt as string) ?? undefined,
  };
}

let _client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _client;
}

export class SupabaseJobRepository implements JobRepository {
  // Reads use a shared anon-key client: it works both for anonymous public
  // visitors and at build time inside generateStaticParams, where there is no
  // request/cookies to build a session-aware client from.
  private get db() { return getClient(); }

  // Writes go through Supabase's Row Level Security, whose "authenticated"
  // policies check auth.role() against the caller's own JWT. The anon-key
  // client above never carries one — every write through it was silently
  // running as Postgres role `anon`, which is why creating a job (or an
  // article; SupabaseArticleRepository had the identical bug) failed with
  // "new row violates row-level security policy". Built fresh per call rather
  // than cached: the container's repository instances are long-lived
  // singletons shared across requests, so caching a signed-in client here
  // would leak one admin's session into another request on the same
  // warm instance.
  private async writeDb() { return getSupabaseServerClient(); }

  async findById(id: string): Promise<JobRecord | null> {
    const { data, error } = await this.db.from("jobs").select("*").eq("id", id).single();
    if (error || !data) return null;
    return toDomain(data);
  }

  async findBySlug(slug: string): Promise<JobRecord | null> {
    const { data, error } = await this.db.from("jobs").select("*").eq("slug", slug).single();
    if (error || !data) return null;
    return toDomain(data);
  }

  async list(query: JobQuery): Promise<Paginated<JobRecord>> {
    let q = this.db.from("jobs").select("*", { count: "exact" });

    if (query.status) q = q.eq("status", STATUS_MAP[query.status]);
    if (query.provinceSlug) q = q.eq("province", PROVINCE_MAP[query.provinceSlug]);
    if (query.employmentType) q = q.eq("employmentType", EMPLOYMENT_MAP[query.employmentType]);
    if (query.search) {
      q = q.or(
        `titleNe.ilike.%${query.search}%,titleEn.ilike.%${query.search}%,company.ilike.%${query.search}%`,
      );
    }
    if (query.activeOnly) {
      // A null deadline means "open until filled", so it must stay visible.
      const today = new Date().toISOString().slice(0, 10);
      q = q.or(`deadline.is.null,deadline.gte.${today}`);
    }

    q = q.order("publishedAt", { ascending: false, nullsFirst: false });

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    if (limit > 0) q = q.range(offset, offset + limit - 1);

    const { data, count, error } = await q;
    if (error) throw new Error(error.message);

    return { items: (data ?? []).map(toDomain), total: count ?? 0 };
  }

  async save(job: JobRecord): Promise<void> {
    const row = {
      id: job.id,
      slug: job.slug,
      titleNe: job.title.ne,
      titleEn: job.title.en ?? null,
      company: job.company,
      location: job.location,
      province: job.provinceSlug ? PROVINCE_MAP[job.provinceSlug] : null,
      employmentType: EMPLOYMENT_MAP[job.employmentType],
      descriptionNe: job.description.ne,
      descriptionEn: job.description.en ?? null,
      salary: job.salary ?? null,
      deadline: job.deadline ?? null,
      applyUrl: job.applyUrl,
      status: STATUS_MAP[job.status],
      isFeatured: job.isFeatured,
      publishedAt: job.publishedAt ?? null,
      updatedAt: job.updatedAt,
    };

    const db = await this.writeDb();
    const { error } = await db.from("jobs").upsert(row, { onConflict: "id" });
    if (error) throw new Error(error.message);
  }

  async delete(id: string): Promise<void> {
    const db = await this.writeDb();
    const { error } = await db.from("jobs").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}
