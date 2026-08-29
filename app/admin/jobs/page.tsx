import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { getContainer } from "@/lib/container";
import { employmentTypes, isExpired } from "@/lib/domain/job";
import { deleteJobAction, publishJobAction, unpublishJobAction } from "../jobActions";
import { JobRowActions } from "./JobRowActions";

const TYPE_LABEL = new Map(employmentTypes.map((t) => [t.value, t.name.en]));

export default async function JobsListPage() {
  const container = getContainer();
  const { items: jobs, total } = await container.listJobs.execute({ limit: 50 });
  const now = new Date();

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="24px">
        <Box>
          <Text fontSize="24px" fontWeight="800" color="var(--color-headline)">Jobs</Text>
          <Text fontSize="13px" color="var(--color-muted)">{total} total</Text>
        </Box>
        <Link href="/admin/jobs/new">
          <Box
            as="span"
            px="16px"
            py="8px"
            bg="var(--color-brand)"
            color="white"
            borderRadius="4px"
            fontSize="13px"
            fontWeight="600"
            cursor="pointer"
          >
            + New Job
          </Box>
        </Link>
      </Flex>

      <Box bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" overflow="hidden">
        <Flex bg="var(--color-card-alt)" px="16px" py="10px" fontWeight="700" fontSize="12px" color="var(--color-muted)" textTransform="uppercase" letterSpacing="0.5px">
          <Text flex="2">Title</Text>
          <Text flex="1">Company</Text>
          <Text w="100px">Type</Text>
          <Text w="110px" textAlign="center">Status</Text>
          <Text w="190px" textAlign="right">Actions</Text>
        </Flex>

        {jobs.map((job) => {
          const expired = isExpired(job, now);
          return (
            <Flex key={job.id} px="16px" py="12px" borderTop="1px solid var(--color-border)" align="center" fontSize="14px">
              <Box flex="2" minW="0">
                <Text fontWeight="600" color="var(--color-headline)" lineClamp={1}>{job.title.ne}</Text>
                {job.title.en && (
                  <Text fontSize="12px" color="var(--color-muted)" lineClamp={1}>{job.title.en}</Text>
                )}
              </Box>
              <Text flex="1" fontSize="13px" color="var(--color-muted)" lineClamp={1}>{job.company}</Text>
              <Text w="100px" fontSize="12px" color="var(--color-muted)">
                {TYPE_LABEL.get(job.employmentType) ?? job.employmentType}
              </Text>
              <Flex w="110px" justify="center" gap="4px">
                <Text
                  fontSize="11px"
                  fontWeight="600"
                  px="8px"
                  py="2px"
                  borderRadius="4px"
                  bg={job.status === "published" ? "#dcfce7" : "#fef3c7"}
                  color={job.status === "published" ? "#16a34a" : "#d97706"}
                >
                  {job.status}
                </Text>
                {expired && (
                  <Text
                    fontSize="11px"
                    fontWeight="600"
                    px="6px"
                    py="2px"
                    borderRadius="4px"
                    bg="#fee2e2"
                    color="#dc2626"
                    title={`Deadline ${job.deadline} has passed — hidden from the public board`}
                  >
                    expired
                  </Text>
                )}
              </Flex>
              <Box w="190px">
                <JobRowActions
                  id={job.id}
                  status={job.status}
                  publishAction={publishJobAction.bind(null, job.id)}
                  unpublishAction={unpublishJobAction.bind(null, job.id)}
                  deleteAction={deleteJobAction.bind(null, job.id)}
                />
              </Box>
            </Flex>
          );
        })}

        {jobs.length === 0 && (
          <Box py="40px" textAlign="center">
            <Text color="var(--color-muted)">No job listings yet.</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
