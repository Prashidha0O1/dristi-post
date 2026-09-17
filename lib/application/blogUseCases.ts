import type {
  BlogQuery,
  BlogRecord,
  BlogUpdateInput,
  NewBlogInput,
} from "../domain/blog";
import type { Paginated } from "../domain/article";
import type { BlogRepository, Clock, IdGenerator, Slugger } from "../domain/ports";
import { NotFoundError, validateBlogUpdate, validateNewBlog } from "./validation";

/**
 * Blog use cases, grouped in one module like the job ones: each is short and
 * they change together. Depend on ports only — never a DB client or `Date`.
 */

export class CreateBlog {
  constructor(
    private readonly blogs: BlogRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
    private readonly slugger: Slugger,
  ) {}

  async execute(input: NewBlogInput): Promise<BlogRecord> {
    validateNewBlog(input);

    const now = this.clock.now().toISOString();

    const slugSource =
      input.slug?.trim() || input.title.en?.trim() || input.title.ne?.trim() || "";
    const slug = await this.slugger.slugify(slugSource, async (candidate) => {
      return (await this.blogs.findBySlug(candidate)) !== null;
    });

    const publish = input.publish ?? false;

    const blog: BlogRecord = {
      id: this.ids.generate(),
      slug,
      title: input.title,
      excerpt: input.excerpt ?? {},
      heroImage: input.heroImage.trim(),
      body: input.body,
      isFeatured: input.isFeatured,
      status: publish ? "published" : "draft",
      createdAt: now,
      updatedAt: now,
      publishedAt: publish ? now : undefined,
    };

    await this.blogs.save(blog);
    return blog;
  }
}

export class UpdateBlog {
  constructor(
    private readonly blogs: BlogRepository,
    private readonly clock: Clock,
    private readonly slugger: Slugger,
  ) {}

  async execute(id: string, changes: BlogUpdateInput): Promise<BlogRecord> {
    validateBlogUpdate(changes);

    const existing = await this.blogs.findById(id);
    if (!existing) throw new NotFoundError(`Blog "${id}" not found`);

    // A hand-typed slug may change the live URL; re-slug and de-duplicate
    // (excluding this same post).
    let slug = existing.slug;
    const wanted = changes.slug?.trim();
    if (wanted && wanted !== existing.slug) {
      slug = await this.slugger.slugify(wanted, async (candidate) => {
        const found = await this.blogs.findBySlug(candidate);
        return found !== null && found.id !== id;
      });
    }

    const { slug: _ignored, ...rest } = changes;
    const updated: BlogRecord = {
      ...existing,
      ...rest,
      slug,
      updatedAt: this.clock.now().toISOString(),
    };

    await this.blogs.save(updated);
    return updated;
  }
}

export class ChangeBlogStatus {
  constructor(
    private readonly blogs: BlogRepository,
    private readonly clock: Clock,
  ) {}

  async publish(id: string): Promise<BlogRecord> {
    const blog = await this.require(id);
    const updated: BlogRecord = {
      ...blog,
      status: "published",
      publishedAt: blog.publishedAt ?? this.clock.now().toISOString(),
      updatedAt: this.clock.now().toISOString(),
    };
    await this.blogs.save(updated);
    return updated;
  }

  async unpublish(id: string): Promise<BlogRecord> {
    const blog = await this.require(id);
    const updated: BlogRecord = {
      ...blog,
      status: "draft",
      updatedAt: this.clock.now().toISOString(),
    };
    await this.blogs.save(updated);
    return updated;
  }

  private async require(id: string): Promise<BlogRecord> {
    const blog = await this.blogs.findById(id);
    if (!blog) throw new NotFoundError(`Blog "${id}" not found`);
    return blog;
  }
}

export class DeleteBlog {
  constructor(private readonly blogs: BlogRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.blogs.findById(id);
    if (!existing) throw new NotFoundError(`Blog "${id}" not found`);
    await this.blogs.delete(id);
  }
}

/** Lists blogs for the admin console, where drafts are visible. */
export class ListBlogs {
  constructor(private readonly blogs: BlogRepository) {}

  execute(query: BlogQuery = {}): Promise<Paginated<BlogRecord>> {
    return this.blogs.list(query);
  }
}

/**
 * Lists blogs for the public page. The status filter is forced here — not
 * merely defaulted — so the public path cannot be made to leak drafts.
 */
export class ListPublishedBlogs {
  constructor(private readonly blogs: BlogRepository) {}

  execute(query: Omit<BlogQuery, "status"> = {}): Promise<Paginated<BlogRecord>> {
    return this.blogs.list({ ...query, status: "published" });
  }
}

/** Fetches one published blog by slug, for the public detail page. */
export class GetPublishedBlog {
  constructor(private readonly blogs: BlogRepository) {}

  async execute(slug: string): Promise<BlogRecord | null> {
    const blog = await this.blogs.findBySlug(slug);
    if (!blog || blog.status !== "published") return null;
    return blog;
  }
}
