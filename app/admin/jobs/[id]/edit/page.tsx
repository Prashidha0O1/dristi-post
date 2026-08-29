import { Box, Text } from "@chakra-ui/react";
import { notFound } from "next/navigation";
import { getContainer } from "@/lib/container";
import { JobForm } from "../../JobForm";
import { updateJobAction } from "../../../jobActions";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const container = getContainer();
  const found = await container.jobs.findById(id);

  if (!found) notFound();

  const boundAction = updateJobAction.bind(null, id);

  return (
    <Box>
      <Text fontSize="24px" fontWeight="800" color="var(--color-headline)" mb="24px">
        Edit Job
      </Text>
      <Box bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" p="24px">
        <JobForm
          action={boundAction}
          submitLabel="Save Changes"
          defaultValues={{
            titleNe: found.title.ne,
            titleEn: found.title.en,
            company: found.company,
            location: found.location,
            provinceSlug: found.provinceSlug,
            employmentType: found.employmentType,
            descriptionNe: found.description.ne,
            descriptionEn: found.description.en,
            salary: found.salary,
            deadline: found.deadline,
            applyUrl: found.applyUrl,
            isFeatured: found.isFeatured,
          }}
        />
      </Box>
    </Box>
  );
}
