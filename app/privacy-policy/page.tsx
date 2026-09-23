import { getPoliciesSettings } from "@/lib/publicQueries";
import PrivacyPolicyClient from "./PrivacyPolicyClient";

export const metadata = {
  title: "Privacy Policy | Dristi Times",
};

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
  const policies = await getPoliciesSettings();
  return <PrivacyPolicyClient policies={policies} />;
}
