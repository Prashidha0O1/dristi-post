"use server";

import { getContainer } from "@/lib/container";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import type { EmploymentType } from "@/lib/domain/job";
import type { ProvinceSlug } from "@/lib/domain/province";
import { runFormAction, type FormState } from "./formState";
import { requireCapability } from "@/lib/auth/guard";

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

export async function createJobAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const container = getContainer();

  const failure = await runFormAction(async () => {
    await requireCapability("content.write");
    await container.createJob.execute({
      ...readJobForm(formData),
      publish: formData.get("publish") === "on",
    });
  });
  if (failure) return failure;

  updateTag("jobs");
  // Outside runFormAction: redirect() signals by throwing.
  redirect("/admin/jobs");
}

export async function updateJobAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const container = getContainer();

  const failure = await runFormAction(async () => {
    await requireCapability("content.write");
    await container.updateJob.execute(id, readJobForm(formData));
  });
  if (failure) return failure;

  updateTag("jobs");
  redirect("/admin/jobs");
}

export async function publishJobAction(id: string) {
  await requireCapability("content.write");
  const container = getContainer();
  await container.changeJobStatus.publish(id);
  updateTag("jobs");
}

export async function unpublishJobAction(id: string) {
  await requireCapability("content.write");
  const container = getContainer();
  await container.changeJobStatus.unpublish(id);
  updateTag("jobs");
}

export async function deleteJobAction(id: string) {
  await requireCapability("content.delete");
  const container = getContainer();
  await container.deleteJob.execute(id);
  updateTag("jobs");
  redirect("/admin/jobs");
}
