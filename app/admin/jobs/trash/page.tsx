export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Trash2 } from "lucide-react";
import { getContainer } from "@/lib/container";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/domain/user";
import { primaryText } from "@/lib/domain/article";
import { ButtonLink, Card, EmptyState, PageHeader, TableHead, TableRow } from "../../ui";
import { restoreJobAction, deleteJobForeverAction } from "../../jobActions";
import { TrashRowActions } from "../../TrashRowActions";
import { AdminSearch } from "../../AdminSearch";

const RETENTION_DAYS = 7;

function daysLeft(deletedAt: string): number {
  const gone = new Date(deletedAt).getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((gone - Date.now()) / (24 * 60 * 60 * 1000)));
}

export default async function JobTrashPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const params = await searchParams;
  const q = params?.q || "";
  const { items } = await getContainer().listTrashedJobs.execute({ limit: 100, search: q });
  const canDeleteForever = can(me.role, "content.delete");

  return (
    <Box>
      <PageHeader
        title="Jobs Trash"
        subtitle="Deleted job listings are kept for 7 days, then removed automatically."
        action={
          <ButtonLink href="/admin/jobs" variant="secondary">
            Back to jobs
          </ButtonLink>
        }
      />

      <AdminSearch placeholder="Search trash..." />

      <Card>
        <TableHead>
          <Text flex="2">Title</Text>
          <Text w="120px" textAlign="center">Auto-removes</Text>
          <Text w="200px" textAlign="right">Actions</Text>
        </TableHead>

        {items.map((job) => (
          <TableRow key={job.id}>
            <Box flex="2" minW="0" pr="12px">
              <Text fontWeight="600" color="var(--color-headline)" lineClamp={1}>
                {primaryText(job.title)}
              </Text>
              <Text fontSize="12px" color="var(--color-muted)" mt="1px">
                {job.company}
              </Text>
            </Box>
            <Flex w="120px" justify="center">
              <Text fontSize="13px" color="var(--color-muted)">
                {job.deletedAt ? `${daysLeft(job.deletedAt)} days` : "—"}
              </Text>
            </Flex>
            <Box w="200px">
              <TrashRowActions
                canDeleteForever={canDeleteForever}
                itemLabel="job listing"
                restoreAction={restoreJobAction.bind(null, job.id)}
                deleteForeverAction={deleteJobForeverAction.bind(null, job.id)}
              />
            </Box>
          </TableRow>
        ))}

        {items.length === 0 && (
          <EmptyState
            icon={<Trash2 size={30} strokeWidth={1.5} aria-hidden="true" />}
            title="Trash is empty"
            hint="Deleted job listings show up here for a week before they're gone for good."
          />
        )}
      </Card>
    </Box>
  );
}
