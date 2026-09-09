import { Box } from "@chakra-ui/react";
import { notFound } from "next/navigation";
import { getContainer } from "@/lib/container";
import { AD_SLOTS } from "@/lib/adSlots";
import { AdForm } from "../../AdForm";
import { updateAdAction } from "../../../adActions";
import { Card, PageHeader } from "../../../ui";

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const container = getContainer();
  const found = await container.ads.findById(id);

  if (!found) notFound();

  const boundAction = updateAdAction.bind(null, id);

  return (
    <Box>
      <PageHeader
        title="Edit Ad"
        subtitle={`${AD_SLOTS[found.placement].label}${found.isActive ? " · live" : ""}`}
      />
      <Card p="24px">
        <AdForm
          action={boundAction}
          submitLabel="Save Changes"
          defaultValues={{
            placement: found.placement,
            imageUrl: found.imageUrl,
            linkUrl: found.linkUrl,
            altText: found.altText,
          }}
        />
      </Card>
    </Box>
  );
}
