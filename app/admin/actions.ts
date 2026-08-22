"use server";

import { getContainer } from "@/lib/container";
import { getSupabaseServerClient } from "@/lib/infrastructure/supabaseServer";
import { redirect } from "next/navigation";
import type { ProvinceSlug } from "@/lib/domain/province";

async function requireAuth() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createArticleAction(formData: FormData) {
  await requireAuth();
  const container = getContainer();

  await container.createArticle.execute({
    title: { ne: formData.get("titleNe") as string, en: (formData.get("titleEn") as string) || undefined },
    excerpt: { ne: formData.get("excerptNe") as string, en: (formData.get("excerptEn") as string) || undefined },
    body: { ne: formData.get("bodyNe") as string, en: (formData.get("bodyEn") as string) || undefined },
    categorySlug: formData.get("categorySlug") as string,
    provinceSlug: (formData.get("provinceSlug") as ProvinceSlug) || undefined,
    authorId: formData.get("authorId") as string,
    imageUrl: formData.get("imageUrl") as string,
    tagSlugs: (formData.get("tagSlugs") as string)?.split(",").filter(Boolean) || [],
    isFeatured: formData.get("isFeatured") === "on",
    isBreaking: formData.get("isBreaking") === "on",
    publish: formData.get("publish") === "on",
  });

  redirect("/admin/articles");
}

export async function updateArticleAction(id: string, formData: FormData) {
  await requireAuth();
  const container = getContainer();

  await container.updateArticle.execute(id, {
    title: { ne: formData.get("titleNe") as string, en: (formData.get("titleEn") as string) || undefined },
    excerpt: { ne: formData.get("excerptNe") as string, en: (formData.get("excerptEn") as string) || undefined },
    body: { ne: formData.get("bodyNe") as string, en: (formData.get("bodyEn") as string) || undefined },
    categorySlug: formData.get("categorySlug") as string,
    provinceSlug: (formData.get("provinceSlug") as ProvinceSlug) || undefined,
    imageUrl: formData.get("imageUrl") as string,
    tagSlugs: (formData.get("tagSlugs") as string)?.split(",").filter(Boolean) || [],
    isFeatured: formData.get("isFeatured") === "on",
    isBreaking: formData.get("isBreaking") === "on",
  });

  redirect("/admin/articles");
}

export async function publishArticleAction(id: string) {
  await requireAuth();
  const container = getContainer();
  await container.changeArticleStatus.execute(id, "published");
}

export async function unpublishArticleAction(id: string) {
  await requireAuth();
  const container = getContainer();
  await container.changeArticleStatus.execute(id, "draft");
}

export async function deleteArticleAction(id: string) {
  await requireAuth();
  const container = getContainer();
  await container.deleteArticle.execute(id);
  redirect("/admin/articles");
}
