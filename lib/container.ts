import type { ArticleRepository, Clock, IdGenerator, Slugger } from "./domain/ports";
import { InMemoryArticleRepository } from "./infrastructure/inMemoryArticleRepository";
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
}

export function buildContainer(
  overrides: Partial<Pick<Container, "articles" | "clock" | "ids" | "slugger">> = {},
): Container {
  const articles = overrides.articles ?? new InMemoryArticleRepository(seedArticles);
  const clock = overrides.clock ?? new SystemClock();
  const ids = overrides.ids ?? new RandomIdGenerator();
  const slugger = overrides.slugger ?? new SlugGenerator();

  return {
    articles,
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
