"use server";

import { getContainer } from "@/lib/container";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { isAdPlacement, type AdPlacement } from "@/lib/adSlots";
import { runFormAction, type FormState } from "./formState";
import { requireCapability } from "@/lib/auth/guard";

/** Shared FormData mapping, so create and update can't drift apart. */
function readAdForm(formData: FormData) {
  const rawPlacement = formData.get("placement");
  const placement =
    typeof rawPlacement === "string" && isAdPlacement(rawPlacement)
      ? rawPlacement
      : ("" as AdPlacement); // let validateNewAd produce the message

  return {
    placement,
    imageUrl: (formData.get("imageUrl") as string) ?? "",
    linkUrl: (formData.get("linkUrl") as string) ?? "",
    altText: (formData.get("altText") as string) ?? "",
  };
}

export async function createAdAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const container = getContainer();

  const failure = await runFormAction(async () => {
    await requireCapability("ads.manage");
    await container.createAd.execute({
      ...readAdForm(formData),
      activate: formData.get("activate") === "on",
    });
  });
  if (failure) return failure;

  updateTag("ads");
  // Outside runFormAction: redirect() signals by throwing.
  redirect("/admin/ads");
}

export async function updateAdAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const container = getContainer();

  const failure = await runFormAction(async () => {
    await requireCapability("ads.manage");
    await container.updateAd.execute(id, readAdForm(formData));
  });
  if (failure) return failure;

  updateTag("ads");
  redirect("/admin/ads");
}

export async function activateAdAction(id: string) {
  await requireCapability("ads.manage");
  const container = getContainer();
  await container.setAdActive.activate(id);
  updateTag("ads");
}

export async function deactivateAdAction(id: string) {
  await requireCapability("ads.manage");
  const container = getContainer();
  await container.setAdActive.deactivate(id);
  updateTag("ads");
}

export async function deleteAdAction(id: string) {
  await requireCapability("ads.manage");
  const container = getContainer();
  await container.deleteAd.execute(id);
  updateTag("ads");
  redirect("/admin/ads");
}
