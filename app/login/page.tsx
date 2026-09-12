"use client";

import { Box, Flex, Text, Input, chakra } from "@chakra-ui/react";
import { Suspense } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { loginAction, type LoginState } from "./actions";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function SignInButton() {
  const { pending } = useFormStatus();
  return (
    <chakra.button
      type="submit"
      disabled={pending}
      w="full"
      py="10px"
      bg="var(--color-brand)"
      color="white"
      border="none"
      borderRadius="4px"
      fontSize="15px"
      fontWeight="700"
      cursor={pending ? "not-allowed" : "pointer"}
      opacity={pending ? 0.7 : 1}
      transition="opacity 0.15s"
    >
      {pending ? "Signing in..." : "Sign In"}
    </chakra.button>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <Flex minH="100vh" align="center" justify="center" bg="var(--color-page)" px="16px">
      <Box w="full" maxW="400px" bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" p="32px">
        <Text textAlign="center" fontWeight="900" fontSize="24px" mb="4px" fontFamily="var(--font-mukta), sans-serif">
          <Text as="span" color="var(--color-brand)">दृष्टि</Text>{" "}
          <Text as="span" color="var(--color-headline)">पोस्ट</Text>
        </Text>
        <Text textAlign="center" fontSize="13px" color="var(--color-muted)" mb="24px">
          Admin Login
        </Text>

        <form action={formAction}>
          <input type="hidden" name="redirect" value={redirectTo} />
          <Box mb="16px">
            <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="4px">Email</Text>
            <Input type="email" name="email" required
              h="40px" border="1px solid var(--color-border)" borderRadius="4px" px="12px" fontSize="14px" />
          </Box>
          <Box mb="20px">
            <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="4px">Password</Text>
            <Input type="password" name="password" required
              h="40px" border="1px solid var(--color-border)" borderRadius="4px" px="12px" fontSize="14px" />
          </Box>

          {state.error && (
            <Text fontSize="13px" color="#dc2626" mb="12px" textAlign="center">{state.error}</Text>
          )}

          <SignInButton />
        </form>
      </Box>
    </Flex>
  );
}
