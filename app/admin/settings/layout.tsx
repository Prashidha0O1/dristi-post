"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "General Settings", href: "/admin/settings" },
    { name: "Policies", href: "/admin/settings/policies" },
    { name: "301 Redirects", href: "/admin/settings/redirects" },
    { name: "404 Logs", href: "/admin/settings/404-logs" },
  ];

  return (
    <Box p="32px" maxW="1200px" mx="auto">
      <Text fontSize="28px" fontWeight="800" mb="24px" color="var(--color-headline)">
        Site Settings
      </Text>
      
      <Flex gap="32px" borderBottom="1px solid var(--color-border)" mb="32px">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href}>
              <Box
                pb="12px"
                position="relative"
                color={isActive ? "var(--color-brand)" : "var(--color-muted)"}
                fontWeight={isActive ? "700" : "500"}
                fontSize="15px"
                _hover={{ color: "var(--color-brand)" }}
              >
                {tab.name}
                {isActive && (
                  <Box position="absolute" bottom="-1px" left="0" right="0" h="2px" bg="var(--color-brand)" />
                )}
              </Box>
            </Link>
          );
        })}
      </Flex>

      {children}
    </Box>
  );
}
