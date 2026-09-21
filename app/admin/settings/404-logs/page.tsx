import { Box } from "@chakra-ui/react";
import { list404Logs } from "@/lib/infrastructure/mysql/seoRepository";
import LogsManager from "./LogsManager";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "OWNER") redirect("/admin");

  const logs = await list404Logs();

  return (
    <Box>
      <LogsManager logs={logs} />
    </Box>
  );
}
