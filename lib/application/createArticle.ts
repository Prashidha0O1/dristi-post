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

    // A hand-typed slug wins; otherwise derive one from the English title (or
    // Nepali, transliterated). The slugger normalises and de-duplicates either way.
    const slugSource =
      input.slug?.trim() || input.title.en?.trim() || input.title.ne?.trim() || "";
    const slug = await this.slugger.slugify(slugSource, async (candidate) => {
      return (await this.articles.findBySlug(candidate)) !== null;
    });

    // Scheduling: a future scheduledAt publishes the article but with a future
    // publishedAt, so the public queries keep it hidden until then.
    const scheduled = input.scheduledAt?.trim() ? new Date(input.scheduledAt) : null;
    const isScheduled =
      scheduled !== null && !Number.isNaN(scheduled.getTime()) && scheduled.getTime() > this.clock.now().getTime();
    const publish = (input.publish ?? false) || isScheduled;
    const publishedAt = isScheduled ? scheduled!.toISOString() : publish ? now : undefined;

    const article: ArticleRecord = {
      id: this.ids.generate(),
      slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      metaDescription: input.metaDescription?.trim() || undefined,
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
      publishedAt,
    };

    await this.articles.save(article);
    return article;
  }
}
