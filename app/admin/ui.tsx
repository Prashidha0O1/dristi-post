import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Small presentational kit shared by the admin pages.
 *
 * These are Server Components by default (no "use client") — none of them hold
 * state. Before this existed, every page re-inlined its own button, badge and
 * card styling, which is how the status chips ended up with hard-coded
 * light-mode hex values on three separate pages.
 */

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: "var(--color-success-bg)", fg: "var(--color-success-fg)" },
  warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning-fg)" },
  danger: { bg: "var(--color-danger-bg)", fg: "var(--color-danger-fg)" },
  info: { bg: "var(--color-info-bg)", fg: "var(--color-info-fg)" },
  neutral: { bg: "var(--color-neutral-bg)", fg: "var(--color-neutral-fg)" },
};

export function Badge({
  tone = "neutral",
  children,
  title,
}: {
  tone?: Tone;
  children: ReactNode;
  title?: string;
}) {
  const { bg, fg } = TONE[tone];
  return (
    <Text
      as="span"
      title={title}
      display="inline-flex"
      alignItems="center"
      bg={bg}
      color={fg}
      px="8px"
      py="3px"
      borderRadius="999px"
      fontSize="11px"
      fontWeight="600"
      lineHeight="1.4"
      whiteSpace="nowrap"
      textTransform="capitalize"
    >
      {children}
    </Text>
  );
}

export function StatusBadge({ status }: { status: "draft" | "published" }) {
  return <Badge tone={status === "published" ? "success" : "warning"}>{status}</Badge>;
}

/** Primary/secondary action rendered as a link. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  icon,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
}) {
  const primary = variant === "primary";
  return (
    <Link href={href}>
      <Flex
        as="span"
        align="center"
        gap="6px"
        px="14px"
        py="9px"
        borderRadius="6px"
        fontSize="13px"
        fontWeight="600"
        cursor="pointer"
        transition="all 0.15s"
        bg={primary ? "var(--color-brand)" : "var(--color-surface)"}
        color={primary ? "white" : "var(--color-body)"}
        border="1px solid"
        borderColor={primary ? "var(--color-brand)" : "var(--color-border)"}
        _hover={primary ? { opacity: 0.9 } : { borderColor: "var(--color-brand)", color: "var(--color-brand)" }}
      >
        {icon}
        {children}
      </Flex>
    </Link>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <Flex
      justify="space-between"
      align={{ base: "flex-start", sm: "center" }}
      direction={{ base: "column", sm: "row" }}
      gap="12px"
      mb="24px"
    >
      <Box>
        <Text fontSize="24px" fontWeight="800" color="var(--color-headline)" lineHeight="1.2">
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="13px" color="var(--color-muted)" mt="2px">{subtitle}</Text>
        )}
      </Box>
      {action}
    </Flex>
  );
}

export function Card({ children, p = "0" }: { children: ReactNode; p?: string }) {
  return (
    <Box overflowX="auto"
      bg="var(--color-surface)"
      border="1px solid var(--color-border)"
      borderRadius="10px"
      
      p={p}
    >
      {children}
    </Box>
  );
}

/** Header strip for the admin tables. Children are the column cells. */
export function TableHead({ children }: { children: ReactNode }) {
  return (
    <Flex minW="700px"
      bg="var(--color-card-alt)"
      px="16px"
      py="11px"
      fontWeight="700"
      fontSize="11px"
      color="var(--color-muted)"
      textTransform="uppercase"
      letterSpacing="0.06em"
      borderBottom="1px solid var(--color-border)"
    >
      {children}
    </Flex>
  );
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <Flex minW="700px"
      px="16px"
      py="13px"
      borderBottom="1px solid var(--color-border)"
      align="center"
      fontSize="14px"
      transition="background 0.12s"
      _hover={{ bg: "var(--color-card-alt)" }}
      css={{ "&:last-of-type": { borderBottom: "none" } }}
    >
      {children}
    </Flex>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <Flex direction="column" align="center" justify="center" py="56px" px="20px" textAlign="center" gap="10px">
      {icon && <Box color="var(--color-faint)">{icon}</Box>}
      <Text fontSize="15px" fontWeight="600" color="var(--color-headline)">{title}</Text>
      {hint && (
        <Text fontSize="13px" color="var(--color-muted)" maxW="380px" lineHeight="1.6">{hint}</Text>
      )}
      {action && <Box mt="6px">{action}</Box>}
    </Flex>
  );
}
