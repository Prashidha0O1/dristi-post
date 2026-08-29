"use server";

import { getContainer } from "@/lib/container";
import { getSupabaseServerClient } from "@/lib/infrastructure/supabaseServer";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import type { EmploymentType } from "@/lib/domain/job";
import type { ProvinceSlug } from "@/lib/domain/province";

async function requireAuth() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/** Shared FormData -> input mapping, so create and update can't drift apart. */
function readJobForm(formData: FormData) {
  return {
    title: {
      ne: formData.get("titleNe") as string,
      en: (formData.get("titleEn") as string) || undefined,
    },
    company: formData.get("company") as string,
    location: formData.get("location") as string,
    provinceSlug: (formData.get("provinceSlug") as ProvinceSlug) || undefined,
    employmentType: formData.get("employmentType") as EmploymentType,
    description: {
      ne: formData.get("descriptionNe") as string,
      en: (formData.get("descriptionEn") as string) || undefined,
    },
    salary: (formData.get("salary") as string) || undefined,
    deadline: (formData.get("deadline") as string) || undefined,
    applyUrl: formData.get("applyUrl") as string,
    isFeatured: formData.get("isFeatured") === "on",
  };
}

export async function createJobAction(formData: FormData) {
  await requireAuth();
  const container = getContainer();

  await container.createJob.execute({
    ...readJobForm(formData),
    publish: formData.get("publish") === "on",
  });

  updateTag("jobs");
  redirect("/admin/jobs");
}

export async function updateJobAction(id: string, formData: FormData) {
  await requireAuth();
  const container = getContainer();

  await container.updateJob.execute(id, readJobForm(formData));

  updateTag("jobs");
  redirect("/admin/jobs");
}

export async function publishJobAction(id: string) {
  await requireAuth();
  const container = getContainer();
  await container.changeJobStatus.publish(id);
  updateTag("jobs");
}

export async function unpublishJobAction(id: string) {
  await requireAuth();
  const container = getContainer();
  await container.changeJobStatus.unpublish(id);
  updateTag("jobs");
}

export async function deleteJobAction(id: string) {
  await requireAuth();
  const container = getContainer();
  await container.deleteJob.execute(id);
  updateTag("jobs");
  redirect("/admin/jobs");
}
