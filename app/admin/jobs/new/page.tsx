import { Box, Text } from "@chakra-ui/react";
import { JobForm } from "../JobForm";
import { createJobAction } from "../../jobActions";

export default function NewJobPage() {
  return (
    <Box>
      <Text fontSize="24px" fontWeight="800" color="var(--color-headline)" mb="24px">
        New Job
      </Text>
      <Box bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" p="24px">
        <JobForm action={createJobAction} submitLabel="Create Job" showPublish />
      </Box>
    </Box>
  );
}
