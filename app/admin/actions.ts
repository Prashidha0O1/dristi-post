"use server";

import { getContainer } from "@/lib/container";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import type { ProvinceSlug } from "@/lib/domain/province";
import { runFormAction, type FormState } from "./formState";
import { requireCapability } from "@/lib/auth/guard";

/** Shared FormData -> input mapping, so create and update can't drift apart. */
function readArticleForm(formData: FormData) {
  return {
    title: {
      ne: formData.get("titleNe") as string,
      en: (formData.get("titleEn") as string) || undefined,
    },
    excerpt: {
      ne: formData.get("excerptNe") as string,
      en: (formData.get("excerptEn") as string) || undefined,
    },
    body: {
      ne: formData.get("bodyNe") as string,
      en: (formData.get("bodyEn") as string) || undefined,
    },
    slug: (formData.get("slug") as string) || undefined,
    metaDescription: (formData.get("metaDescNe") || formData.get("metaDescEn"))
      ? {
          ne: (formData.get("metaDescNe") as string) || undefined,
          en: (formData.get("metaDescEn") as string) || undefined,
        }
      : undefined,
    scheduledAt: (formData.get("scheduledAt") as string) || undefined,
    categorySlug: formData.get("categorySlug") as string,
    provinceSlug: (formData.get("provinceSlug") as ProvinceSlug) || undefined,
    imageUrl: formData.get("imageUrl") as string,
    tagSlugs: (formData.get("tagSlugs") as string)?.split(",").filter(Boolean) || [],
    isFeatured: formData.get("isFeatured") === "on",
    isBreaking: formData.get("isBreaking") === "on",
    isTrending: formData.get("isTrending") === "on",
  };
}

export async function createArticleAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const container = getContainer();

  let created: { slug: string; status: string; publishedAt?: string } | null = null;
  const failure = await runFormAction(async () => {
    await requireCapability("content.write");
    const article = await container.createArticle.execute({
      ...readArticleForm(formData),
      authorId: formData.get("authorId") as string,
      publish: formData.get("publish") === "on",
    });
    created = { slug: article.slug, status: article.status, publishedAt: article.publishedAt };
  });
  if (failure) return failure;

  updateTag("articles");
  // Outside runFormAction on purpose: redirect() signals by throwing, so it
  // would be caught there and reported as a save failure instead of navigating.
  // If it went live now, land the editor straight on the published article so
  // they can see (and share) the real link; drafts/scheduled go back to admin.
  redirect(liveOrAdmin(created, "article"));
}

/**
 * Where to send the editor after a save: the public page when it's live now,
 * otherwise back to the admin list (drafts and future-scheduled have no live
 * page yet).
 */
function liveOrAdmin(
  saved: { slug: string; status: string; publishedAt?: string } | null,
  kind: "article" | "job",
): string {
  const adminList = kind === "article" ? "/admin/articles" : "/admin/jobs";
  if (!saved || saved.status !== "published") return adminList;
  if (saved.publishedAt && new Date(saved.publishedAt).getTime() > Date.now()) return adminList;
  return kind === "article" ? `/article/${saved.slug}` : `/jobs/${saved.slug}`;
}

export async function updateArticleAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const container = getContainer();

  let saved: { slug: string; status: string; publishedAt?: string } | null = null;
  const failure = await runFormAction(async () => {
    await requireCapability("content.write");
    const article = await container.updateArticle.execute(id, readArticleForm(formData));
    saved = { slug: article.slug, status: article.status, publishedAt: article.publishedAt };
  });
  if (failure) return failure;

  updateTag("articles");
  redirect(liveOrAdmin(saved, "article"));
}

export async function publishArticleAction(id: string) {
  await requireCapability("content.write");
  const container = getContainer();
  await container.changeArticleStatus.publish(id);
  updateTag("articles");
}

export async function unpublishArticleAction(id: string) {
  await requireCapability("content.write");
  const container = getContainer();
  await container.changeArticleStatus.unpublish(id);
  updateTag("articles");
}

export async function deleteArticleAction(id: string) {
  // Soft delete (move to trash). Any signed-in editor can trash; permanent
  // deletion below is owner-only.
  await requireCapability("content.write");
  const container = getContainer();
  await container.deleteArticle.execute(id);
  updateTag("articles");
  redirect("/admin/articles");
}

export async function restoreArticleAction(id: string) {
  await requireCapability("content.write");
  const container = getContainer();
  await container.restoreArticle.execute(id);
  updateTag("articles");
  redirect("/admin/articles/trash");
}

export async function deleteArticleForeverAction(id: string) {
  await requireCapability("content.delete");
  const container = getContainer();
  await container.deleteArticleForever.execute(id);
  updateTag("articles");
  redirect("/admin/articles/trash");
}
