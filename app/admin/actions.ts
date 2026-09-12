"use server";

import { getContainer } from "@/lib/container";
import { getSupabaseServerClient } from "@/lib/infrastructure/supabaseServer";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import type { ProvinceSlug } from "@/lib/domain/province";
import { runFormAction, type FormState } from "./formState";

async function requireAuth() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

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

  const failure = await runFormAction(async () => {
    await requireAuth();
    await container.createArticle.execute({
      ...readArticleForm(formData),
      authorId: formData.get("authorId") as string,
      publish: formData.get("publish") === "on",
    });
  });
  if (failure) return failure;

  updateTag("articles");
  // Outside runFormAction on purpose: redirect() signals by throwing, so it
  // would be caught there and reported as a save failure instead of navigating.
  redirect("/admin/articles");
}

export async function updateArticleAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const container = getContainer();

  const failure = await runFormAction(async () => {
    await requireAuth();
    await container.updateArticle.execute(id, readArticleForm(formData));
  });
  if (failure) return failure;

  updateTag("articles");
  redirect("/admin/articles");
}

export async function publishArticleAction(id: string) {
  await requireAuth();
  const container = getContainer();
  await container.changeArticleStatus.publish(id);
  updateTag("articles");
}

export async function unpublishArticleAction(id: string) {
  await requireAuth();
  const container = getContainer();
  await container.changeArticleStatus.unpublish(id);
  updateTag("articles");
}

export async function deleteArticleAction(id: string) {
  await requireAuth();
  const container = getContainer();
  await container.deleteArticle.execute(id);
  updateTag("articles");
  redirect("/admin/articles");
}
