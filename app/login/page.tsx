"use client";

import { Box, Flex, Text, Input } from "@chakra-ui/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/infrastructure/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const redirect = searchParams.get("redirect") || "/admin";
    router.push(redirect);
    router.refresh();
  }

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

        <form onSubmit={handleSubmit}>
          <Box mb="16px">
            <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="4px">Email</Text>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              h="40px" border="1px solid var(--color-border)" borderRadius="4px" px="12px" fontSize="14px" />
          </Box>
          <Box mb="20px">
            <Text fontSize="13px" fontWeight="600" color="var(--color-body)" mb="4px">Password</Text>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              h="40px" border="1px solid var(--color-border)" borderRadius="4px" px="12px" fontSize="14px" />
          </Box>

          {error && (
            <Text fontSize="13px" color="#dc2626" mb="12px" textAlign="center">{error}</Text>
          )}

          <Box
            as="button"
            type="submit"
            w="full"
            py="10px"
            bg="var(--color-brand)"
            color="white"
            border="none"
            borderRadius="4px"
            fontSize="15px"
            fontWeight="700"
            cursor={loading ? "not-allowed" : "pointer"}
            opacity={loading ? 0.7 : 1}
            transition="opacity 0.15s"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Box>
        </form>
      </Box>
    </Flex>
  );
}
