"use client";

import { Box, Flex, Text, Tabs, chakra } from "@chakra-ui/react";
import { useState, useTransition } from "react";
import { Save, Loader2 } from "lucide-react";
import { updatePoliciesSettings } from "../actions";
import { toaster } from "@/components/ui/toaster";
import { RichTextField } from "../../RichTextField";

export function PoliciesForm({ initialPolicies }: { initialPolicies: any }) {
  const [isPending, startTransition] = useTransition();

  async function action(formData: FormData) {
    const data = {
      editorial_ne: formData.get("editorial_ne") as string,
      editorial_en: formData.get("editorial_en") as string,
      privacy_ne: formData.get("privacy_ne") as string,
      privacy_en: formData.get("privacy_en") as string,
    };

    startTransition(async () => {
      try {
        await updatePoliciesSettings(data);
        toaster.create({
          type: "success",
          title: "Saved",
          description: "Policy pages have been updated.",
        });
      } catch (e: any) {
        toaster.create({
          type: "error",
          title: "Error",
          description: e.message || "Failed to save settings.",
        });
      }
    });
  }

  return (
    <form action={action}>
      <Flex direction="column" gap="40px">
        <Box>
          <Text fontSize="20px" fontWeight="700" mb="16px" color="var(--color-headline)">
            Editorial Policy
          </Text>
          <Tabs.Root defaultValue="ne" variant="enclosed">
            <Tabs.List mb="16px">
              <Tabs.Trigger value="ne">Nepali</Tabs.Trigger>
              <Tabs.Trigger value="en">English</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="ne">
              <RichTextField name="editorial_ne" defaultValue={initialPolicies.editorial_ne} minHeight="300px" />
            </Tabs.Content>
            <Tabs.Content value="en">
              <RichTextField name="editorial_en" defaultValue={initialPolicies.editorial_en} minHeight="300px" />
            </Tabs.Content>
          </Tabs.Root>
        </Box>

        <Box>
          <Text fontSize="20px" fontWeight="700" mb="16px" color="var(--color-headline)">
            Privacy Policy
          </Text>
          <Tabs.Root defaultValue="ne" variant="enclosed">
            <Tabs.List mb="16px">
              <Tabs.Trigger value="ne">Nepali</Tabs.Trigger>
              <Tabs.Trigger value="en">English</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="ne">
              <RichTextField name="privacy_ne" defaultValue={initialPolicies.privacy_ne} minHeight="300px" />
            </Tabs.Content>
            <Tabs.Content value="en">
              <RichTextField name="privacy_en" defaultValue={initialPolicies.privacy_en} minHeight="300px" />
            </Tabs.Content>
          </Tabs.Root>
        </Box>

        <Box>
          <chakra.button
            type="submit"
            disabled={isPending}
            display="inline-flex"
            alignItems="center"
            gap="8px"
            bg="var(--color-brand)"
            color="white"
            px="24px"
            h="44px"
            borderRadius="6px"
            fontWeight="600"
            fontSize="14px"
            _hover={{ opacity: 0.9 }}
            opacity={isPending ? 0.7 : 1}
            cursor={isPending ? "not-allowed" : "pointer"}
          >
            {isPending ? <Box css={{ animation: "spin 1s linear infinite" }}><Loader2 size={18} /></Box> : <Save size={18} />}
            Save Changes
          </chakra.button>
        </Box>
      </Flex>
    </form>
  );
}
