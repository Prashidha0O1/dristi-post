import { Box } from "@chakra-ui/react";
import { listRedirects } from "@/lib/infrastructure/mysql/seoRepository";
import RedirectsManager from "./RedirectsManager";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RedirectsPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "OWNER") redirect("/admin");

  const redirects = await listRedirects();

  return (
    <Box>
      <RedirectsManager redirects={redirects} />
    </Box>
  );
}
