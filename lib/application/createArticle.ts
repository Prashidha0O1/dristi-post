import type { ArticleRecord, NewArticleInput } from "../domain/article";
import type { ArticleRepository, Clock, IdGenerator, Slugger } from "../domain/ports";
import { validateNewArticle } from "./validation";

/**
 * Creates an article, optionally publishing it immediately.
 *
 * Depends only on the ports it uses, so it can be unit-tested with fakes and
 * runs unchanged against an in-memory store or a real database.
 */
export class CreateArticle {
  constructor(
    private readonly articles: ArticleRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
    private readonly slugger: Slugger,
  ) {}

  async execute(input: NewArticleInput): Promise<ArticleRecord> {
    validateNewArticle(input);

    const now = this.clock.now().toISOString();

    // Prefer the English title for slugs (URL-friendly); fall back to Nepali,
    // which the slugger transliterates/normalises.
    const slugSource = input.title.en?.trim() || input.title.ne.trim();
    const slug = await this.slugger.slugify(slugSource, async (candidate) => {
      return (await this.articles.findBySlug(candidate)) !== null;
    });

    const publish = input.publish ?? false;

    const article: ArticleRecord = {
      id: this.ids.generate(),
      slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      categorySlug: input.categorySlug,
      provinceSlug: input.provinceSlug,
      authorId: input.authorId,
      imageUrl: input.imageUrl,
      status: publish ? "published" : "draft",
      tagSlugs: input.tagSlugs ?? [],
      isFeatured: input.isFeatured ?? false,
      isBreaking: input.isBreaking ?? false,
      isTrending: input.isTrending ?? false,
      createdAt: now,
      updatedAt: now,
      publishedAt: publish ? now : undefined,
    };

    await this.articles.save(article);
    return article;
  }
}
