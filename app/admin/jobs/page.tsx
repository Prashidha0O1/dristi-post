// Authenticated, per-request admin page: never statically prerendered.
// (Also keeps `next build` from connecting to the database.)
export const dynamic = "force-dynamic";

import { Box, Flex, Text } from "@chakra-ui/react";
import { Briefcase, Plus } from "lucide-react";
import { getContainer } from "@/lib/container";
import { employmentTypes, isExpired } from "@/lib/domain/job";
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
  StatusBadge,
  TableHead,
  TableRow,
} from "../ui";
import { deleteJobAction, publishJobAction, unpublishJobAction } from "../jobActions";
import { JobRowActions } from "./JobRowActions";
import { primaryText } from "@/lib/domain/article";

const TYPE_LABEL = new Map(employmentTypes.map((t) => [t.value, t.name.en]));

export default async function JobsListPage() {
  const container = getContainer();

  // The jobs table may not exist yet (migration unrun). Surface that as an
  // explanation rather than a 500 — the admin is exactly where someone would
  // go to find out why the board is empty.
  const result = await container.listJobs
    .execute({ limit: 50 })
    .then((r) => ({ ok: true as const, ...r }))
    .catch((e: unknown) => ({
      ok: false as const,
      items: [],
      total: 0,
      message: e instanceof Error ? e.message : String(e),
    }));

  const now = new Date();

  return (
    <Box>
      <PageHeader
        title="Jobs"
        subtitle={result.ok ? `${result.total} total` : undefined}
        action={
          <ButtonLink href="/admin/jobs/new" icon={<Plus size={15} strokeWidth={2.2} aria-hidden="true" />}>
            New Job
          </ButtonLink>
        }
      />

      {!result.ok && (
        <Box
          mb="20px"
          px="16px"
          py="13px"
          borderRadius="8px"
          bg="var(--color-danger-bg)"
          color="var(--color-danger-fg)"
          fontSize="13px"
          lineHeight="1.6"
        >
          <Text fontWeight="700" mb="2px">Could not load jobs</Text>
          <Text>{result.message}</Text>
          <Text mt="6px" opacity={0.85}>
            If this says the table is missing, the job board schema hasn&apos;t been applied to
            Supabase yet.
          </Text>
        </Box>
      )}

      <Card>
        <TableHead>
          <Text flex="2">Title</Text>
          <Text flex="1" display={{ base: "none", md: "block" }}>Company</Text>
          <Text w="90px" display={{ base: "none", lg: "block" }}>Type</Text>
          <Text w="140px" textAlign="center">Status</Text>
          <Text w="180px" textAlign="right">Actions</Text>
        </TableHead>

        {result.items.map((job) => {
          const expired = isExpired(job, now);
          return (
            <TableRow key={job.id}>
              <Box flex="2" minW="0" pr="12px">
                <Text fontWeight="600" color="var(--color-headline)" lineClamp={1}>
                  {primaryText(job.title)}
                </Text>
                {job.title.en && (
                  <Text fontSize="12px" color="var(--color-muted)" lineClamp={1} mt="1px">
                    {job.title.en}
                  </Text>
                )}
              </Box>

              <Text flex="1" fontSize="13px" color="var(--color-muted)" lineClamp={1} display={{ base: "none", md: "block" }}>
                {job.company}
              </Text>

              <Text w="90px" fontSize="12px" color="var(--color-muted)" display={{ base: "none", lg: "block" }}>
                {TYPE_LABEL.get(job.employmentType) ?? job.employmentType}
              </Text>

              <Flex w="140px" justify="center" gap="5px" flexWrap="wrap">
                <StatusBadge status={job.status} />
                {expired && (
                  <Badge tone="danger" title={`Deadline ${job.deadline} has passed — hidden from the public board`}>
                    expired
                  </Badge>
                )}
              </Flex>

              <Box w="180px">
                <JobRowActions
                  id={job.id}
                  status={job.status}
                  publishAction={publishJobAction.bind(null, job.id)}
                  unpublishAction={unpublishJobAction.bind(null, job.id)}
                  deleteAction={deleteJobAction.bind(null, job.id)}
                />
              </Box>
            </TableRow>
          );
        })}

        {result.ok && result.items.length === 0 && (
          <EmptyState
            icon={<Briefcase size={30} strokeWidth={1.5} aria-hidden="true" />}
            title="No job listings yet"
            hint="Published listings appear on the public job board at /jobs."
            action={
              <ButtonLink href="/admin/jobs/new" icon={<Plus size={15} strokeWidth={2.2} aria-hidden="true" />}>
                New Job
              </ButtonLink>
            }
          />
        )}
      </Card>
    </Box>
  );
}
