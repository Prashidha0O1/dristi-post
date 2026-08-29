"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/infrastructure/supabaseClient";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Articles", href: "/admin/articles", icon: "📰" },
  { label: "Jobs", href: "/admin/jobs", icon: "💼" },
  { label: "Categories", href: "/admin/categories", icon: "📁" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Flex minH="100vh" bg="var(--color-page)">
      <Box w="220px" bg="var(--color-nav)" color="white" flexShrink={0} position="fixed" h="100vh" overflowY="auto">
        <Box px="16px" py="20px" borderBottom="1px solid rgba(255,255,255,0.1)">
          <Link href="/">
            <Text fontWeight="900" fontSize="18px" fontFamily="var(--font-mukta), sans-serif">
              <Text as="span" color="var(--color-brand)">दृष्टि</Text>{" "}
              <Text as="span" color="white">पोस्ट</Text>
            </Text>
          </Link>
          <Text fontSize="11px" color="rgba(255,255,255,0.5)" mt="2px">Admin Panel</Text>
        </Box>

        <Flex direction="column" py="12px" gap="2px">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <Flex
                  align="center"
                  gap="10px"
                  px="16px"
                  py="10px"
                  fontSize="14px"
                  fontWeight={active ? "700" : "500"}
                  color={active ? "white" : "rgba(255,255,255,0.65)"}
                  bg={active ? "rgba(255,255,255,0.1)" : "transparent"}
                  _hover={{ bg: "rgba(255,255,255,0.08)", color: "white" }}
                  transition="all 0.15s"
                  cursor="pointer"
                >
                  <Text fontSize="16px">{item.icon}</Text>
                  {item.label}
                </Flex>
              </Link>
            );
          })}
        </Flex>

        <Box position="absolute" bottom="0" w="full" borderTop="1px solid rgba(255,255,255,0.1)" p="12px">
          <Box
            as="button"
            w="full"
            py="8px"
            fontSize="13px"
            color="rgba(255,255,255,0.6)"
            bg="transparent"
            border="1px solid rgba(255,255,255,0.15)"
            borderRadius="4px"
            cursor="pointer"
            _hover={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
            transition="all 0.15s"
            onClick={handleSignOut}
          >
            Sign Out
          </Box>
        </Box>
      </Box>

      <Box ml="220px" flex="1" p="24px" minH="100vh">
        {children}
      </Box>
    </Flex>
  );
}
