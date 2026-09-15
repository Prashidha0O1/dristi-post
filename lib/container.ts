import type {
  AdRepository,
  ArticleRepository,
  Clock,
  IdGenerator,
  JobRepository,
  Slugger,
} from "./domain/ports";
import { InMemoryArticleRepository } from "./infrastructure/inMemoryArticleRepository";
import { InMemoryJobRepository } from "./infrastructure/inMemoryJobRepository";
import { InMemoryAdRepository } from "./infrastructure/inMemoryAdRepository";
import { MysqlArticleRepository } from "./infrastructure/mysql/mysqlArticleRepository";
import { MysqlJobRepository } from "./infrastructure/mysql/mysqlJobRepository";
import { MysqlAdRepository } from "./infrastructure/mysql/mysqlAdRepository";
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
import {
  CreateAd,
  DeleteAd,
  GetActiveAds,
  ListAds,
  SetAdActive,
  UpdateAd,
} from "./application/adUseCases";
import { seedArticles } from "./infrastructure/seedArticles";
import { hasDatabaseEnv } from "@/lib/env";

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
  ads: AdRepository;
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

  createAd: CreateAd;
  updateAd: UpdateAd;
  setAdActive: SetAdActive;
  deleteAd: DeleteAd;
  listAds: ListAds;
  getActiveAds: GetActiveAds;
}

export function buildContainer(
  overrides: Partial<Pick<Container, "articles" | "jobs" | "ads" | "clock" | "ids" | "slugger">> = {},
): Container {
  // Adapter selection: MySQL when DATABASE_URL is set, else an in-memory store
  // (local smoke tests, or a first boot before the database is configured).
  const useMysql = hasDatabaseEnv();
  const articles =
    overrides.articles ??
    (useMysql ? new MysqlArticleRepository() : new InMemoryArticleRepository(seedArticles));
  // No seed data for jobs: unlike articles there is no mock fixture to fall
  // back on, so the in-memory path starts empty and the board shows its
  // empty state rather than inventing listings.
  const jobs =
    overrides.jobs ?? (useMysql ? new MysqlJobRepository() : new InMemoryJobRepository());
  // Also unseeded: an unsold slot renders the existing grey placeholder, so an
  // empty ad table is a legitimate state rather than something to fake data for.
  const ads =
    overrides.ads ?? (useMysql ? new MysqlAdRepository() : new InMemoryAdRepository());
  const clock = overrides.clock ?? new SystemClock();
  const ids = overrides.ids ?? new RandomIdGenerator();
  const slugger = overrides.slugger ?? new SlugGenerator();

  return {
    articles,
    jobs,
    ads,
    clock,
    ids,
    slugger,

    createArticle: new CreateArticle(articles, ids, clock, slugger),
    updateArticle: new UpdateArticle(articles, clock, slugger),
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

    createAd: new CreateAd(ads, ids, clock),
    updateAd: new UpdateAd(ads, clock),
    setAdActive: new SetAdActive(ads, clock),
    deleteAd: new DeleteAd(ads),
    listAds: new ListAds(ads),
    getActiveAds: new GetActiveAds(ads),
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
