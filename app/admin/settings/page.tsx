import { Box, Flex, Text } from "@chakra-ui/react";
import { getFooterSettings, getSeoSettings } from "@/lib/publicQueries";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const footer = await getFooterSettings();
  const seo = await getSeoSettings();

  return (
    <Box>
      <SettingsForm initialFooter={footer} initialSeo={seo} />
    </Box>
  );
}
