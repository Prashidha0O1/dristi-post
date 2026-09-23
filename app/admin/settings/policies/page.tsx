import { Box } from "@chakra-ui/react";
import { getPoliciesSettings } from "@/lib/publicQueries";
import { PoliciesForm } from "./PoliciesForm";

export default async function PoliciesPage() {
  const policies = await getPoliciesSettings();

  return (
    <Box>
      <PoliciesForm initialPolicies={policies} />
    </Box>
  );
}
