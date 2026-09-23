import { getPoliciesSettings } from "@/lib/publicQueries";
import EditorialPolicyClient from "./EditorialPolicyClient";

export const metadata = {
  title: "Editorial Policy | Dristi Times",
};

export const dynamic = "force-dynamic";

export default async function EditorialPolicyPage() {
  const policies = await getPoliciesSettings();
  return <EditorialPolicyClient policies={policies} />;
}
