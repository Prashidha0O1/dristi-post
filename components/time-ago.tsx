"use client";

import { Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { timeAgo } from "@/lib/time";

export function TimeAgo({
  date,
  ...props
}: { date: string } & Record<string, unknown>) {
  const { locale } = useLocale();
  const [display, setDisplay] = useState("");

  useEffect(() => {
    setDisplay(timeAgo(date, locale));
  }, [date, locale]);

  if (!display) return null;

  return <Text {...props}>{display}</Text>;
}
