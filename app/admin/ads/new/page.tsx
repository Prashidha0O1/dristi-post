// Authenticated, per-request admin page: never statically prerendered.
// (Also keeps `next build` from connecting to the database.)
export const dynamic = "force-dynamic";

import { Box } from "@chakra-ui/react";
import { AdForm } from "../AdForm";
import { createAdAction } from "../../adActions";
import { Card, PageHeader } from "../../ui";

export default function NewAdPage() {
  return (
    <Box>
      <PageHeader title="New Ad" subtitle="Saved dormant unless you make it live" />
      <Card p="24px">
        <AdForm action={createAdAction} submitLabel="Create Ad" showActivate />
      </Card>
    </Box>
  );
}
