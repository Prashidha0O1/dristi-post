// Owner-only, per-request admin page.
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/domain/user";
import { listUsers } from "@/lib/auth/users";
import { listPendingInvites } from "@/lib/auth/invites";
import { PageHeader } from "../ui";
import { UsersManager } from "./UsersManager";

export default async function UsersPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  // Only the owner manages users. Others get bounced to the dashboard.
  if (!can(me.role, "users.manage")) redirect("/admin");

  const [users, invites] = await Promise.all([listUsers(), listPendingInvites()]);

  return (
    <Box>
      <PageHeader title="Users" subtitle="Invite people and manage their access" />
      <UsersManager
        currentUserId={me.id}
        users={users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, isActive: u.isActive }))}
        invites={invites.map((i) => ({ id: i.id, email: i.email, role: i.role, expiresAt: i.expiresAt }))}
      />
    </Box>
  );
}
