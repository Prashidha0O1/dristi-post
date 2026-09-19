"use client";

import { Input, Box } from "@chakra-ui/react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect, useRef } from "react";

export function AdminSearch({ placeholder = "Search..." }: { placeholder?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const defaultValue = searchParams.get("q")?.toString() || "";
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(searchParams.get("q")?.toString() || "");
  }, [searchParams]);

  const handleSearch = (term: string) => {
    setValue(term);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set("q", term);
      } else {
        params.delete("q");
      }
      startTransition(() => {
        replace(`${pathname}?${params.toString()}`);
      });
    }, 300);
  };

  return (
    <Box position="relative" w={{ base: "full", sm: "300px" }} mb="20px">
      <Box position="absolute" left="12px" top="50%" transform="translateY(-50%)" pointerEvents="none" color="var(--color-muted)">
        <Search size={16} />
      </Box>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        bg="var(--color-surface)"
        border="1px solid var(--color-border)"
        pl="40px"
        _focus={{
          borderColor: "var(--color-brand)",
          boxShadow: "0 0 0 1px var(--color-brand)",
        }}
        fontSize="14px"
      />
    </Box>
  );
}
