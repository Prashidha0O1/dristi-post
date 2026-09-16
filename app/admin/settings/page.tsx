import { Box, Flex, Text } from "@chakra-ui/react";
import { getFooterSettings, getSeoSettings } from "@/lib/publicQueries";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const footer = await getFooterSettings();
  const seo = await getSeoSettings();

  return (
    <Box p="32px" maxW="1200px" mx="auto">
      <Flex mb="24px" align="center" justify="space-between">
        <Text fontSize="28px" fontWeight="800">Site Settings</Text>
      </Flex>
      <SettingsForm initialFooter={footer} initialSeo={seo} />
    </Box>
  );
}
