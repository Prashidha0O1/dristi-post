import type {
  JobQuery,
  JobRecord,
  JobUpdateInput,
  NewJobInput,
} from "../domain/job";
import type { Paginated } from "../domain/article";
import type { Clock, IdGenerator, JobRepository, Slugger } from "../domain/ports";
import { NotFoundError, validateJobUpdate, validateNewJob } from "./validation";

/**
 * Job listing use cases.
 *
 * Grouped in one module (unlike the article use cases, which predate this and
 * sit in a file each) because each is only a few lines and they are always
 * changed together. Same dependency rule applies: they depend on ports only,
 * never on a database client or `Date`.
 */

export class CreateJob {
  constructor(
    private readonly jobs: JobRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
    private readonly slugger: Slugger,
  ) {}

  async execute(input: NewJobInput): Promise<JobRecord> {
    validateNewJob(input);

    const now = this.clock.now().toISOString();

    // Company is folded into the slug so two listings with the same role title
    // at different employers don't collide into "-2" suffixes.
    const slugSource = `${input.title.en?.trim() || input.title.ne?.trim() || ""} ${input.company.trim()}`;
    const slug = await this.slugger.slugify(slugSource, async (candidate) => {
      return (await this.jobs.findBySlug(candidate)) !== null;
    });

    const publish = input.publish ?? false;

    const job: JobRecord = {
      id: this.ids.generate(),
      slug,
      title: input.title,
      company: input.company.trim(),
      location: input.location.trim(),
      provinceSlug: input.provinceSlug,
      employmentType: input.employmentType,
      description: input.description,
      metaDescription: input.metaDescription,
      salary: input.salary?.trim() || undefined,
      deadline: input.deadline?.trim() || undefined,
      applyUrl: input.applyUrl.trim(),
      status: publish ? "published" : "draft",
      isFeatured: input.isFeatured ?? false,
      createdAt: now,
      updatedAt: now,
      publishedAt: publish ? now : undefined,
    };

    await this.jobs.save(job);
    return job;
  }
}

export class UpdateJob {
  constructor(
    private readonly jobs: JobRepository,
    private readonly clock: Clock,
  ) {}

  async execute(id: string, changes: JobUpdateInput): Promise<JobRecord> {
    validateJobUpdate(changes);

    const existing = await this.jobs.findById(id);
    if (!existing) throw new NotFoundError(`Job "${id}" not found`);

    // Slug stays immutable for the same reason articles' does: it's a live URL.
    const updated: JobRecord = {
      ...existing,
      ...changes,
      updatedAt: this.clock.now().toISOString(),
    };

    await this.jobs.save(updated);
    return updated;
  }
}

export class ChangeJobStatus {
  constructor(
    private readonly jobs: JobRepository,
    private readonly clock: Clock,
  ) {}

  async publish(id: string): Promise<JobRecord> {
    const job = await this.require(id);
    const updated: JobRecord = {
      ...job,
      status: "published",
      publishedAt: job.publishedAt ?? this.clock.now().toISOString(),
      updatedAt: this.clock.now().toISOString(),
    };
    await this.jobs.save(updated);
    return updated;
  }

  async unpublish(id: string): Promise<JobRecord> {
    const job = await this.require(id);
    const updated: JobRecord = {
      ...job,
      status: "draft",
      updatedAt: this.clock.now().toISOString(),
    };
    await this.jobs.save(updated);
    return updated;
  }

  private async require(id: string): Promise<JobRecord> {
    const job = await this.jobs.findById(id);
    if (!job) throw new NotFoundError(`Job "${id}" not found`);
    return job;
  }
}

export class DeleteJob {
  constructor(private readonly jobs: JobRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.jobs.findById(id);
    if (!existing) throw new NotFoundError(`Job "${id}" not found`);
    await this.jobs.delete(id);
  }
}

/** Lists jobs for the admin console, where drafts and expired listings are visible. */
export class ListJobs {
  constructor(private readonly jobs: JobRepository) {}

  execute(query: JobQuery = {}): Promise<Paginated<JobRecord>> {
    return this.jobs.list(query);
  }
}

/**
 * Lists jobs for the public board. The status filter is forced here — not
 * merely defaulted — so the public path cannot be made to leak drafts.
 * Expired listings are hidden by default for the same reason.
 */
export class ListPublishedJobs {
  constructor(private readonly jobs: JobRepository) {}

  execute(query: Omit<JobQuery, "status"> = {}): Promise<Paginated<JobRecord>> {
    return this.jobs.list({ activeOnly: true, ...query, status: "published" });
  }
}

/** Fetches one published job by slug, for the public detail page. */
export class GetPublishedJob {
  constructor(private readonly jobs: JobRepository) {}

  async execute(slug: string): Promise<JobRecord | null> {
    const job = await this.jobs.findBySlug(slug);
    if (!job || job.status !== "published") return null;
    return job;
  }
}
