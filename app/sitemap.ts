import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";
import { categories } from "@/lib/config";
import { provinces } from "@/lib/domain/province";
import { getRecentArticles, getPublishedJobs } from "@/lib/publicQueries";

// Built at request time so it never touches the database during `next build`
// (the DB is localhost-only in production). Cached data reads keep it cheap.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const staticPaths = ["", "/latest", "/trending", "/jobs", "/calendar", "/tools"];
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "daily",
    priority: p === "" ? 1 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/category/${c.slug}`,
    changeFrequency: "hourly",
    priority: 0.6,
  }));

  const provinceEntries: MetadataRoute.Sitemap = provinces.map((p) => ({
    url: `${base}/province/${p.slug}`,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  // Recent published content. If the DB is unreachable, still return the static
  // parts rather than failing the whole sitemap.
  let articleEntries: MetadataRoute.Sitemap = [];
  let jobEntries: MetadataRoute.Sitemap = [];
  try {
    const articles = await getRecentArticles(500);
    articleEntries = articles.map((a) => ({
      url: `${base}/article/${a.slug}`,
      lastModified: a.updatedAt ?? a.publishedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    /* leave empty */
  }
  try {
    const jobs = await getPublishedJobs({ limit: 500 });
    jobEntries = jobs.map((j) => ({
      url: `${base}/jobs/${j.slug}`,
      lastModified: j.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    /* leave empty */
  }

  return [
    ...staticEntries,
    ...categoryEntries,
    ...provinceEntries,
    ...articleEntries,
    ...jobEntries,
  ];
}
