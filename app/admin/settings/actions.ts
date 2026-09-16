"use server";
import { buildContainer } from "@/lib/container";
import { revalidatePath } from "next/cache";

export async function updateFooterSettings(data: any) {
  await buildContainer().settings.saveFooterSettings(data);
  revalidatePath("/", "layout");
}

export async function updateSeoSettings(data: any) {
  await buildContainer().settings.saveSeoSettings(data);
  revalidatePath("/", "layout");
}
