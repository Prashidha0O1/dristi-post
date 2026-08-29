"use client";

import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Briefcase,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Newspaper,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/infrastructure/supabaseClient";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Articles", href: "/admin/articles", icon: Newspaper },
  { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
];

const SIDEBAR_W = "236px";

function currentTitle(pathname: string): string {
  // Longest match wins so /admin/articles/new resolves to "Articles", not
  // "Dashboard" (every path starts with /admin).
  const hit = [...NAV]
    .filter((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return hit?.label ?? "Admin";
}

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
      <Flex
        direction="column"
        w={SIDEBAR_W}
        bg="var(--color-nav)"
        color="white"
        flexShrink={0}
        position="fixed"
        h="100vh"
        borderRight="1px solid rgba(255,255,255,0.08)"
      >
        <Box px="18px" py="18px" borderBottom="1px solid rgba(255,255,255,0.1)">
          <Link href="/">
            <Text fontWeight="900" fontSize="19px" fontFamily="var(--font-mukta), sans-serif" lineHeight="1.2">
              <Text as="span" color="var(--color-brand)">दृष्टि</Text>
              <Text as="span" color="white">पोस्ट</Text>
            </Text>
          </Link>
          <Text fontSize="10px" color="rgba(255,255,255,0.45)" mt="3px" textTransform="uppercase" letterSpacing="0.14em" fontWeight="600">
            Admin Panel
          </Text>
        </Box>

        <Box px="10px" pt="14px" pb="6px">
          <Text fontSize="10px" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.12em" fontWeight="700" px="10px" mb="6px">
            Manage
          </Text>
          <Flex direction="column" gap="2px">
            {NAV.map((item) => {
              const active = item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Flex
                    align="center"
                    gap="10px"
                    px="10px"
                    py="9px"
                    borderRadius="6px"
                    fontSize="14px"
                    fontWeight={active ? "600" : "500"}
                    color={active ? "white" : "rgba(255,255,255,0.62)"}
                    bg={active ? "rgba(255,255,255,0.12)" : "transparent"}
                    position="relative"
                    _hover={{ bg: "rgba(255,255,255,0.08)", color: "white" }}
                    transition="all 0.15s"
                    cursor="pointer"
                  >
                    {active && (
                      <Box
                        position="absolute"
                        left="0"
                        top="7px"
                        bottom="7px"
                        w="3px"
                        borderRadius="0 3px 3px 0"
                        bg="var(--color-brand)"
                      />
                    )}
                    <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
                    {item.label}
                  </Flex>
                </Link>
              );
            })}
          </Flex>
        </Box>

        <Box mt="auto" borderTop="1px solid rgba(255,255,255,0.1)" p="10px">
          <Link href="/">
            <Flex
              align="center"
              justify="space-between"
              px="10px"
              py="8px"
              mb="4px"
              borderRadius="6px"
              fontSize="13px"
              color="rgba(255,255,255,0.6)"
              _hover={{ bg: "rgba(255,255,255,0.08)", color: "white" }}
              transition="all 0.15s"
              cursor="pointer"
            >
              View site
              <ArrowUpRight size={14} strokeWidth={1.9} aria-hidden="true" />
            </Flex>
          </Link>
          <chakra.button
            type="button"
            onClick={handleSignOut}
            display="flex"
            alignItems="center"
            gap="8px"
            w="full"
            px="10px"
            py="8px"
            borderRadius="6px"
            fontSize="13px"
            fontWeight="500"
            color="rgba(255,255,255,0.6)"
            bg="transparent"
            border="none"
            cursor="pointer"
            textAlign="left"
            _hover={{ bg: "rgba(255,255,255,0.08)", color: "white" }}
            transition="all 0.15s"
          >
            <LogOut size={15} strokeWidth={1.9} aria-hidden="true" />
            Sign out
          </chakra.button>
        </Box>
      </Flex>

      <Box ml={SIDEBAR_W} flex="1" minW="0">
        <Flex
          as="header"
          align="center"
          h="56px"
          px="28px"
          bg="var(--color-surface)"
          borderBottom="1px solid var(--color-border)"
          position="sticky"
          top="0"
          zIndex="10"
        >
          <Text fontSize="14px" fontWeight="600" color="var(--color-headline)">
            {currentTitle(pathname)}
          </Text>
        </Flex>
        <Box p="28px" maxW="1280px">
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
