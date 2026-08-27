import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ArticleRepository } from "@/lib/domain/ports";
import type { ArticleRecord, ArticleQuery, Paginated, ArticleStatus } from "@/lib/domain/article";
import type { ProvinceSlug } from "@/lib/domain/province";

type Row = Record<string, unknown>;

const STATUS_MAP: Record<ArticleStatus, string> = { draft: "DRAFT", published: "PUBLISHED" };
const STATUS_REVERSE: Record<string, ArticleStatus> = { DRAFT: "draft", PUBLISHED: "published" };
const PROVINCE_MAP: Record<ProvinceSlug, string> = {
  koshi: "KOSHI", madhesh: "MADHESH", bagmati: "BAGMATI", gandaki: "GANDAKI",
  lumbini: "LUMBINI", karnali: "KARNALI", sudurpashchim: "SUDURPASHCHIM",
};
const PROVINCE_REVERSE: Record<string, ProvinceSlug> = Object.fromEntries(
  Object.entries(PROVINCE_MAP).map(([k, v]) => [v, k])
) as Record<string, ProvinceSlug>;

function toDomain(row: Row): ArticleRecord {
  const category = row.category as Row | null;
  const author = row.author as Row | null;
  const tagJoins = (row.article_tags ?? []) as Row[];
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: { ne: row.titleNe as string, en: (row.titleEn as string) ?? undefined },
    excerpt: { ne: row.excerptNe as string, en: (row.excerptEn as string) ?? undefined },
    body: { ne: row.bodyNe as string, en: (row.bodyEn as string) ?? undefined },
    categorySlug: (category?.slug as string) ?? "",
    provinceSlug: row.province ? PROVINCE_REVERSE[row.province as string] : undefined,
    authorId: row.authorId as string,
    imageUrl: row.imageUrl as string,
    status: STATUS_REVERSE[row.status as string] ?? "draft",
    tagSlugs: tagJoins.map((j) => {
      const tag = j.tag as Row | undefined;
      return (tag?.slug as string) ?? (j.slug as string) ?? "";
    }).filter(Boolean),
    isFeatured: row.isFeatured as boolean,
    isBreaking: row.isBreaking as boolean,
    isTrending: (row.isTrending as boolean) ?? false,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
    publishedAt: (row.publishedAt as string) ?? undefined,
    authorName: author
      ? { ne: author.nameNe as string, en: (author.nameEn as string) ?? undefined }
      : undefined,
  };
}

const SELECT_FIELDS =
  "*, category:categories!categoryId(slug), author:authors!authorId(nameNe,nameEn), article_tags:_ArticleTags(tag:tags!B(slug))";

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

export class SupabaseArticleRepository implements ArticleRepository {
  private get db() { return getClient(); }

  async findById(id: string): Promise<ArticleRecord | null> {
    const { data, error } = await this.db
      .from("articles")
      .select(SELECT_FIELDS)
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return toDomain(data);
  }

  async findBySlug(slug: string): Promise<ArticleRecord | null> {
    const { data, error } = await this.db
      .from("articles")
      .select(SELECT_FIELDS)
      .eq("slug", slug)
      .single();
    if (error || !data) return null;
    return toDomain(data);
  }

  async list(query: ArticleQuery): Promise<Paginated<ArticleRecord>> {
    let q = this.db.from("articles").select(SELECT_FIELDS, { count: "exact" });

    if (query.status) q = q.eq("status", STATUS_MAP[query.status]);
    if (query.provinceSlug) q = q.eq("province", PROVINCE_MAP[query.provinceSlug]);
    if (query.categorySlug) {
      const { data: cat } = await this.db.from("categories").select("id").eq("slug", query.categorySlug).single();
      if (cat) q = q.eq("categoryId", cat.id);
    }
    if (query.search) {
      q = q.or(`titleNe.ilike.%${query.search}%,titleEn.ilike.%${query.search}%`);
    }

    q = q.order("publishedAt", { ascending: false, nullsFirst: false });

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    if (limit > 0) q = q.range(offset, offset + limit - 1);

    const { data, count, error } = await q;
    if (error) throw new Error(error.message);

    return {
      items: (data ?? []).map(toDomain),
      total: count ?? 0,
    };
  }

  async save(article: ArticleRecord): Promise<void> {
    const { data: cat } = await this.db
      .from("categories")
      .select("id")
      .eq("slug", article.categorySlug)
      .single();
    if (!cat) throw new Error(`Category "${article.categorySlug}" not found`);

    const row = {
      id: article.id,
      slug: article.slug,
      titleNe: article.title.ne,
      titleEn: article.title.en ?? null,
      excerptNe: article.excerpt.ne,
      excerptEn: article.excerpt.en ?? null,
      bodyNe: article.body.ne,
      bodyEn: article.body.en ?? null,
      imageUrl: article.imageUrl,
      status: STATUS_MAP[article.status],
      province: article.provinceSlug ? PROVINCE_MAP[article.provinceSlug] : null,
      categoryId: cat.id,
      authorId: article.authorId,
      isFeatured: article.isFeatured,
      isBreaking: article.isBreaking,
      isTrending: article.isTrending,
      publishedAt: article.publishedAt ?? null,
      updatedAt: article.updatedAt,
    };

    const { error } = await this.db.from("articles").upsert(row, { onConflict: "id" });
    if (error) throw new Error(error.message);

    // Sync tags
    await this.db.from("_ArticleTags").delete().eq("A", article.id);
    if (article.tagSlugs.length > 0) {
      const { data: tags } = await this.db.from("tags").select("id").in("slug", article.tagSlugs);
      if (tags?.length) {
        await this.db.from("_ArticleTags").insert(
          tags.map((t) => ({ A: article.id, B: t.id }))
        );
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.from("_ArticleTags").delete().eq("A", id);
    const { error } = await this.db.from("articles").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}
