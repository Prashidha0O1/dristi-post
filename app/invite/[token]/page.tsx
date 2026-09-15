export const dynamic = "force-dynamic";

import { Box, Flex, Text } from "@chakra-ui/react";
import { findValidInvite } from "@/lib/auth/invites";
import { AcceptInviteForm } from "./AcceptInviteForm";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await findValidInvite(token);

  return (
    <Flex minH="100vh" align="center" justify="center" bg="var(--color-page)" px="16px">
      <Box w="full" maxW="420px" bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" p="32px">
        <Text textAlign="center" fontWeight="900" fontSize="24px" mb="4px" fontFamily="var(--font-mukta), sans-serif">
          <Text as="span" color="var(--color-brand)">दृष्टि</Text>{" "}
          <Text as="span" color="var(--color-headline)">पोस्ट</Text>
        </Text>

        {invite ? (
          <>
            <Text textAlign="center" fontSize="13px" color="var(--color-muted)" mb="24px">
              You&apos;ve been invited as {invite.role.toLowerCase()}. Set your password to finish.
            </Text>
            <AcceptInviteForm token={token} email={invite.email} />
          </>
        ) : (
          <Text textAlign="center" fontSize="14px" color="var(--color-danger-fg)" mt="20px" lineHeight="1.6">
            This invite link is invalid, already used, or expired. Ask the owner to send a new one.
          </Text>
        )}
      </Box>
    </Flex>
  );
}
