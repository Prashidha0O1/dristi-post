"use client";

import { Box, Flex, Text, chakra, IconButton, useDisclosure } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowUpRight,
  Briefcase,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Newspaper,
  PenLine,
  Users,
  Settings,
} from "lucide-react";
import { can, type Capability, type Role } from "@/lib/domain/user";
import { logoutAction } from "./authActions";

const SIDEBAR_W = "236px";

type NavItem = { label: string; href: string; icon: typeof LayoutDashboard; capability?: Capability };

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Articles", href: "/admin/articles", icon: Newspaper },
  { label: "Blog", href: "/admin/blog", icon: PenLine },
  { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { label: "Ads", href: "/admin/ads", icon: Megaphone, capability: "ads.manage" },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Users", href: "/admin/users", icon: Users, capability: "users.manage" },
  { label: "Settings", href: "/admin/settings", icon: Settings, capability: "settings.manage" },
];


function SidebarContent({ user, pathname, nav, onClose }: { user: any; pathname: string; nav: NavItem[]; onClose: () => void }) {
  return (
    <>
      <Box px="18px" py="18px" borderBottom="1px solid rgba(255,255,255,0.1)">
        <Link href="/" onClick={onClose}>
          <Text fontWeight="900" fontSize="19px" fontFamily="var(--font-mukta), sans-serif" lineHeight="1.2">
            <Text as="span" color="var(--color-brand)">दृष्टि</Text>
            <Text as="span" color="white">पोस्ट</Text>
          </Text>
        </Link>
        <Text fontSize="10px" color="rgba(255,255,255,0.45)" mt="3px" textTransform="uppercase" letterSpacing="0.14em" fontWeight="600">
          Admin Panel
        </Text>
      </Box>

      <Box px="10px" pt="14px" pb="6px" overflowY="auto" flex="1">
        <Text fontSize="10px" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.12em" fontWeight="700" px="10px" mb="6px">
          Manage
        </Text>
        <Flex direction="column" gap="2px">
          {nav.map((item) => {
            const active = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
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
        <Box px="10px" py="8px" mb="4px">
          <Text fontSize="13px" fontWeight="600" color="white" lineClamp={1}>{user.name}</Text>
          <Text fontSize="11px" color="rgba(255,255,255,0.45)" textTransform="capitalize">
            {user.role.toLowerCase()}
          </Text>
        </Box>
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
        <chakra.form action={logoutAction}>
          <chakra.button
            type="submit"
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
        </chakra.form>
      </Box>
    </>
  );
}
function currentTitle(pathname: string, nav: NavItem[]): string {
  const hit = [...nav]
    .filter((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return hit?.label ?? "Admin";
}

export function AdminChrome({
  user,
  children,
}: {
  user: { name: string; role: Role };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { open, onOpen, onClose } = useDisclosure();
  // Role-aware nav: an editor never sees links they can't use (the server
  // actions enforce it regardless — this just keeps the UI honest).
  const nav = NAV.filter((item) => !item.capability || can(user.role, item.capability));

  return (
    <Flex minH="100vh" bg="var(--color-page)">

      {/* Desktop Sidebar */}
      <Flex
        display={{ base: "none", md: "flex" }}
        direction="column"
        w={SIDEBAR_W}
        bg="var(--color-nav)"
        color="white"
        flexShrink={0}
        position="fixed"
        h="100vh"
        borderRight="1px solid rgba(255,255,255,0.08)"
      >
        <SidebarContent user={user} pathname={pathname} nav={nav} onClose={() => {}} />
      </Flex>

      {/* Mobile Drawer (Custom Overlay) */}
      {open && (
        <Box
          display={{ base: "block", md: "none" }}
          position="fixed"
          inset="0"
          zIndex="1000"
        >
          {/* Backdrop */}
          <Box
            position="absolute"
            inset="0"
            bg="rgba(0, 0, 0, 0.6)"
            onClick={onClose}
          />
          {/* Drawer Content */}
          <Flex
            position="absolute"
            left="0"
            top="0"
            bottom="0"
            w="260px"
            bg="var(--color-nav)"
            direction="column"
            color="white"
            transform="translateX(0)"
            transition="transform 0.2s"
          >
            <IconButton aria-label="Close menu" position="absolute" children={<X size={20} />}
              top="12px"
              right="12px"
              variant="ghost"
              size="sm"
              color="white"
              onClick={onClose}
              zIndex="10"
              _hover={{ bg: "rgba(255,255,255,0.1)" }}
            />
            <SidebarContent user={user} pathname={pathname} nav={nav} onClose={onClose} />
          </Flex>
        </Box>
      )}

      <Box ml={{ base: 0, md: SIDEBAR_W }} flex="1" minW="0" w={{ base: "100%", md: "auto" }}>
        <Flex
          as="header"
          align="center"
          h="56px"
          px={{ base: "16px", md: "28px" }}
          gap="16px"
          bg="var(--color-surface)"
          borderBottom="1px solid var(--color-border)"
          position="sticky"
          top="0"
          zIndex="10"
        >
          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Open menu"
            variant="ghost"
            size="sm"
            onClick={onOpen}
          >
            <Menu size={20} />
          </IconButton>
          <Text fontSize="14px" fontWeight="600" color="var(--color-headline)">
            {currentTitle(pathname, nav)}
          </Text>
        </Flex>
        <Box p={{ base: "16px", md: "28px" }} maxW="1280px">
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
