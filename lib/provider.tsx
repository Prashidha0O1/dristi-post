"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "./theme";
import { LocaleProvider } from "./localeContext";
import { ThemeProvider } from "./themeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <ThemeProvider>
        <LocaleProvider>{children}</LocaleProvider>
      </ThemeProvider>
    </ChakraProvider>
  );
}
