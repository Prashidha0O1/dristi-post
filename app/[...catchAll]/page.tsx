import { notFound, permanentRedirect } from "next/navigation";
import { getRedirectBySource, log404 } from "@/lib/infrastructure/mysql/seoRepository";

export default async function CatchAll({ params }: { params: Promise<{ catchAll: string[] }> }) {
  const p = await params;
  const path = "/" + (p.catchAll?.join("/") || "");

  // 1. Check if there's a 301 redirect mapped for this path
  const redirectRule = await getRedirectBySource(path);
  if (redirectRule) {
    permanentRedirect(redirectRule.destinationPath);
  }

  // 2. If no redirect, log the 404 and show the custom 404 page
  await log404(path);
  notFound();
}
