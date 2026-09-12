// Authenticated, per-request admin page: never statically prerendered.
// (Also keeps `next build` from connecting to the database.)
export const dynamic = "force-dynamic";

import { Box } from "@chakra-ui/react";
import { JobForm } from "../JobForm";
import { createJobAction } from "../../jobActions";
import { Card, PageHeader } from "../../ui";

export default function NewJobPage() {
  return (
    <Box>
      <PageHeader title="New Job" subtitle="Drafts stay private until published" />
      <Card p="24px">
        <JobForm action={createJobAction} submitLabel="Create Job" showPublish />
      </Card>
    </Box>
  );
}
