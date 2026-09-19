"use server";
import { pingAllSearchEngines } from "@/lib/infrastructure/indexing";

import { getContainer } from "@/lib/container";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { runFormAction, type FormState } from "./formState";
import { requireCapability } from "@/lib/auth/guard";

/** Shared FormData -> input mapping, so create and update can't drift apart. */
function readBlogForm(formData: FormData) {
  const excerptNe = (formData.get("excerptNe") as string) || undefined;
  const excerptEn = (formData.get("excerptEn") as string) || undefined;
  const metaDescNe = (formData.get("metaDescNe") as string) || undefined;
  const metaDescEn = (formData.get("metaDescEn") as string) || undefined;
  return {
    title: {
      ne: formData.get("titleNe") as string,
      en: (formData.get("titleEn") as string) || undefined,
    },
    // Excerpt is optional: only send it when at least one side has text, so an
    // empty pair doesn't trip the "required" check in the localised validator.
    excerpt: excerptNe || excerptEn ? { ne: excerptNe, en: excerptEn } : undefined,
    metaDescription: metaDescNe || metaDescEn ? { ne: metaDescNe, en: metaDescEn } : undefined,
    heroImage: formData.get("heroImage") as string,
    body: {
      ne: formData.get("bodyNe") as string,
      en: (formData.get("bodyEn") as string) || undefined,
    },
    slug: (formData.get("slug") as string) || undefined,
    isFeatured: formData.get("isFeatured") === "on",
  };
}

/** Where to send the editor after a save: live page when published, else admin. */
function liveOrAdmin(saved: { slug: string; status: string } | null): string {
  const s = saved as any; if (s && s.status === "published") return `/blog/${s.slug}`;
  return "/admin/blog";
}

export async function createBlogAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const container = getContainer();

  let saved: { slug: string; status: string } | null = null;
  const failure = await runFormAction(async () => {
    await requireCapability("content.write");
    const blog = await container.createBlog.execute({
      ...readBlogForm(formData),
      publish: formData.get("publish") === "on",
    });
    saved = { slug: blog.slug, status: blog.status };
  });
  if (failure) return failure;

  updateTag("blogs");

  const s = saved as any; if (s && s.status === "published") {
    await pingAllSearchEngines(`/blog/${s.slug}`);
  }

  redirect(liveOrAdmin(saved));
}

export async function updateBlogAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const container = getContainer();

  let saved: { slug: string; status: string } | null = null;
  const failure = await runFormAction(async () => {
    await requireCapability("content.write");
    const blog = await container.updateBlog.execute(id, readBlogForm(formData));
    saved = { slug: blog.slug, status: blog.status };
  });
  if (failure) return failure;

  updateTag("blogs");

  const s = saved as any; if (s && s.status === "published") {
    await pingAllSearchEngines(`/blog/${s.slug}`);
  }

  redirect(liveOrAdmin(saved));
}

export async function publishBlogAction(id: string) {
  await requireCapability("content.write");
  const container = getContainer();
  const blog = await container.changeBlogStatus.publish(id);
  updateTag("blogs");

  if (blog.status === "published") {
    await pingAllSearchEngines(`/blog/${blog.slug}`);
  }
}

export async function unpublishBlogAction(id: string) {
  await requireCapability("content.write");
  const container = getContainer();
  await container.changeBlogStatus.unpublish(id);
  updateTag("blogs");
}

export async function deleteBlogAction(id: string) {
  await requireCapability("content.delete");
  const container = getContainer();
  await container.deleteBlog.execute(id);
  updateTag("blogs");
  redirect("/admin/blog");
}
