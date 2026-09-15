"use client";

import { Box, Input, Text, chakra } from "@chakra-ui/react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { acceptInviteAction, type AcceptState } from "../actions";

function SubmitButton() {
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
    >
      {pending ? "Creating account..." : "Create account"}
    </chakra.button>
  );
}

export function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const [state, formAction] = useActionState<AcceptState, FormData>(acceptInviteAction, {});

  const fieldStyle = {
    h: "40px",
    border: "1px solid var(--color-border)",
    borderRadius: "4px",
    px: "12px",
    fontSize: "14px",
  } as const;

  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />
      <Box mb="16px">
        <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="4px">Email</Text>
        <Input value={email} readOnly {...fieldStyle} bg="var(--color-card-alt)" />
      </Box>
      <Box mb="16px">
        <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="4px">Your name</Text>
        <Input name="name" required {...fieldStyle} />
      </Box>
      <Box mb="16px">
        <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="4px">Password</Text>
        <Input type="password" name="password" required minLength={8} {...fieldStyle} />
      </Box>
      <Box mb="20px">
        <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="4px">Confirm password</Text>
        <Input type="password" name="confirm" required minLength={8} {...fieldStyle} />
      </Box>

      {state.error && (
        <Text fontSize="13px" color="#dc2626" mb="12px" textAlign="center">{state.error}</Text>
      )}

      <SubmitButton />
    </form>
  );
}
