import type { ArticleRepository, Clock, IdGenerator, JobRepository, Slugger } from "./domain/ports";
import { InMemoryArticleRepository } from "./infrastructure/inMemoryArticleRepository";
import { SupabaseArticleRepository } from "./infrastructure/supabaseArticleRepository";
import { InMemoryJobRepository } from "./infrastructure/inMemoryJobRepository";
import { SupabaseJobRepository } from "./infrastructure/supabaseJobRepository";
import { RandomIdGenerator, SlugGenerator, SystemClock } from "./infrastructure/services";
import { CreateArticle } from "./application/createArticle";
import { UpdateArticle } from "./application/updateArticle";
import { ChangeArticleStatus } from "./application/changeArticleStatus";
import { DeleteArticle } from "./application/deleteArticle";
import {
  GetPublishedArticle,
  ListArticles,
  ListPublishedArticles,
} from "./application/listArticles";
import {
  ChangeJobStatus,
  CreateJob,
  DeleteJob,
  GetPublishedJob,
  ListJobs,
  ListPublishedJobs,
  UpdateJob,
} from "./application/jobUseCases";
import { seedArticles } from "./infrastructure/seedArticles";

/**
 * Composition root: the single place that names concrete implementations.
 *
 * Everything else in the app receives its collaborators through this object, so
 * replacing the store (e.g. with a Prisma adapter) means editing `buildContainer`
 * and nothing else.
 */
export interface Container {
  articles: ArticleRepository;
  jobs: JobRepository;
  clock: Clock;
  ids: IdGenerator;
  slugger: Slugger;

  createArticle: CreateArticle;
  updateArticle: UpdateArticle;
  changeArticleStatus: ChangeArticleStatus;
  deleteArticle: DeleteArticle;
  listArticles: ListArticles;
  listPublishedArticles: ListPublishedArticles;
  getPublishedArticle: GetPublishedArticle;

  createJob: CreateJob;
  updateJob: UpdateJob;
  changeJobStatus: ChangeJobStatus;
  deleteJob: DeleteJob;
  listJobs: ListJobs;
  listPublishedJobs: ListPublishedJobs;
  getPublishedJob: GetPublishedJob;
}

export function buildContainer(
  overrides: Partial<Pick<Container, "articles" | "jobs" | "clock" | "ids" | "slugger">> = {},
): Container {
  const useSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const articles = overrides.articles ?? (useSupabase ? new SupabaseArticleRepository() : new InMemoryArticleRepository(seedArticles));
  // No seed data for jobs: unlike articles there is no mock fixture to fall
  // back on, so the in-memory path starts empty and the board shows its
  // empty state rather than inventing listings.
  const jobs = overrides.jobs ?? (useSupabase ? new SupabaseJobRepository() : new InMemoryJobRepository());
  const clock = overrides.clock ?? new SystemClock();
  const ids = overrides.ids ?? new RandomIdGenerator();
  const slugger = overrides.slugger ?? new SlugGenerator();

  return {
    articles,
    jobs,
    clock,
    ids,
    slugger,

    createArticle: new CreateArticle(articles, ids, clock, slugger),
    updateArticle: new UpdateArticle(articles, clock),
    changeArticleStatus: new ChangeArticleStatus(articles, clock),
    deleteArticle: new DeleteArticle(articles),
    listArticles: new ListArticles(articles),
    listPublishedArticles: new ListPublishedArticles(articles),
    getPublishedArticle: new GetPublishedArticle(articles),

    createJob: new CreateJob(jobs, ids, clock, slugger),
    updateJob: new UpdateJob(jobs, clock),
    changeJobStatus: new ChangeJobStatus(jobs, clock),
    deleteJob: new DeleteJob(jobs),
    listJobs: new ListJobs(jobs),
    listPublishedJobs: new ListPublishedJobs(jobs),
    getPublishedJob: new GetPublishedJob(jobs),
  };
}

/**
 * Process-wide container.
 *
 * Cached on `globalThis` so Next.js dev hot-reloads and route handlers within a
 * single server instance share one in-memory repository instead of each module
 * copy building its own.
 */
const globalForContainer = globalThis as unknown as { __dristiContainer?: Container };

export function getContainer(): Container {
  if (!globalForContainer.__dristiContainer) {
    globalForContainer.__dristiContainer = buildContainer();
  }
  return globalForContainer.__dristiContainer;
}
