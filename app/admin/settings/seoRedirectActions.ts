"use server";
import { revalidatePath } from "next/cache";
import { 
  saveRedirect as repoSaveRedirect, 
  deleteRedirect as repoDeleteRedirect,
  delete404Log
} from "@/lib/infrastructure/mysql/seoRepository";
import { getCurrentUser } from "@/lib/auth/session";

function validateAdmin() {
  // basic check
}

export async function saveRedirectAction(id: string, sourcePath: string, destinationPath: string, isActive: boolean) {
  const me = await getCurrentUser();
  if (!me) throw new Error("Unauthorized");
  
  // Clean paths
  const source = sourcePath.trim().startsWith('/') ? sourcePath.trim() : '/' + sourcePath.trim();
  const dest = destinationPath.trim().startsWith('/') ? destinationPath.trim() : '/' + destinationPath.trim();
  
  if (source === dest) throw new Error("Source and destination cannot be the same");
  
  await repoSaveRedirect({ id, sourcePath: source, destinationPath: dest, isActive });
  
  // Clear from 404 logs if it was there
  await delete404Log(source);
  
  revalidatePath("/admin/settings/redirects");
  revalidatePath("/admin/settings/404-logs");
}

export async function deleteRedirectAction(id: string) {
  const me = await getCurrentUser();
  if (!me) throw new Error("Unauthorized");
  await repoDeleteRedirect(id);
  revalidatePath("/admin/settings/redirects");
}

export async function delete404LogAction(path: string) {
  const me = await getCurrentUser();
  if (!me) throw new Error("Unauthorized");
  await delete404Log(path);
  revalidatePath("/admin/settings/404-logs");
}
