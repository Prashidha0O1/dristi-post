"use client";

import { Text } from "@chakra-ui/react";
import { useLocale } from "@/lib/localeContext";
import { timeAgo } from "@/lib/time";

export function TimeAgo({
  date,
  ...props
}: { date: string } & Record<string, unknown>) {
  const { locale } = useLocale();
  const display = timeAgo(date, locale);

  if (!display) return null;

  return <Text {...props}>{display}</Text>;
}
