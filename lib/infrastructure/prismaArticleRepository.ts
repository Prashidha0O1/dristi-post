import type { PrismaClient, Article, Province, ArticleStatus as PrismaStatus } from "@/lib/generated/prisma/client";
import type { ArticleRepository } from "@/lib/domain/ports";
import type { ArticleRecord, ArticleQuery, Paginated, ArticleStatus } from "@/lib/domain/article";
import type { ProvinceSlug } from "@/lib/domain/province";

const STATUS_MAP: Record<ArticleStatus, PrismaStatus> = { draft: "DRAFT", published: "PUBLISHED" };
const STATUS_REVERSE: Record<PrismaStatus, ArticleStatus> = { DRAFT: "draft", PUBLISHED: "published" };
const PROVINCE_MAP: Record<ProvinceSlug, Province> = {
  koshi: "KOSHI", madhesh: "MADHESH", bagmati: "BAGMATI", gandaki: "GANDAKI",
  lumbini: "LUMBINI", karnali: "KARNALI", sudurpashchim: "SUDURPASHCHIM",
};
const PROVINCE_REVERSE = Object.fromEntries(
  Object.entries(PROVINCE_MAP).map(([k, v]) => [v, k])
) as Record<Province, ProvinceSlug>;

function toDomain(row: Article & { category?: { slug: string }; tags?: { slug: string }[] }): ArticleRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: { ne: row.titleNe, en: row.titleEn ?? undefined },
    excerpt: { ne: row.excerptNe, en: row.excerptEn ?? undefined },
    body: { ne: row.bodyNe, en: row.bodyEn ?? undefined },
    categorySlug: row.category?.slug ?? "",
    provinceSlug: row.province ? PROVINCE_REVERSE[row.province] : undefined,
    authorId: row.authorId,
    imageUrl: row.imageUrl,
    status: STATUS_REVERSE[row.status],
    tagSlugs: row.tags?.map((t) => t.slug) ?? [],
    isFeatured: row.isFeatured,
    isBreaking: row.isBreaking,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString(),
  };
}

export class PrismaArticleRepository implements ArticleRepository {
  constructor(private db: PrismaClient) {}

  async findById(id: string): Promise<ArticleRecord | null> {
    const row = await this.db.article.findUnique({
      where: { id },
      include: { category: true, tags: true },
    });
    return row ? toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<ArticleRecord | null> {
    const row = await this.db.article.findUnique({
      where: { slug },
      include: { category: true, tags: true },
    });
    return row ? toDomain(row) : null;
  }

  async list(query: ArticleQuery): Promise<Paginated<ArticleRecord>> {
    const where: Record<string, unknown> = {};

    if (query.status) where.status = STATUS_MAP[query.status];
    if (query.provinceSlug) where.province = PROVINCE_MAP[query.provinceSlug];
    if (query.categorySlug) where.category = { slug: query.categorySlug };
    if (query.search) {
      where.OR = [
        { titleNe: { contains: query.search, mode: "insensitive" } },
        { titleEn: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.db.article.findMany({
        where,
        include: { category: true, tags: true },
        orderBy: { publishedAt: "desc" },
        skip: query.offset ?? 0,
        take: query.limit ?? 20,
      }),
      this.db.article.count({ where }),
    ]);

    return { items: rows.map(toDomain), total };
  }

  async save(article: ArticleRecord): Promise<void> {
    const categoryRow = await this.db.category.findUnique({ where: { slug: article.categorySlug } });
    if (!categoryRow) throw new Error(`Category "${article.categorySlug}" not found`);

    const tagRows = article.tagSlugs.length > 0
      ? await this.db.tag.findMany({ where: { slug: { in: article.tagSlugs } } })
      : [];

    await this.db.article.upsert({
      where: { id: article.id },
      update: {
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
        categoryId: categoryRow.id,
        authorId: article.authorId,
        tags: { set: tagRows.map((t) => ({ id: t.id })) },
        isFeatured: article.isFeatured,
        isBreaking: article.isBreaking,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
      },
      create: {
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
        categoryId: categoryRow.id,
        authorId: article.authorId,
        tags: { connect: tagRows.map((t) => ({ id: t.id })) },
        isFeatured: article.isFeatured,
        isBreaking: article.isBreaking,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.article.delete({ where: { id } });
  }
}
