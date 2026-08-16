import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-mukta), 'Mukta', sans-serif" },
        body: { value: "var(--font-mukta), 'Mukta', sans-serif" },
      },
      colors: {
        brand: {
          50: { value: "#fef2f2" },
          100: { value: "#fee2e2" },
          200: { value: "#fecaca" },
          300: { value: "#fca5a5" },
          400: { value: "#f87171" },
          500: { value: "#ef4444" },
          600: { value: "#dc2626" },
          700: { value: "#B62411" },
          800: { value: "#991b1b" },
          900: { value: "#7f1d1d" },
        },
        navy: {
          50: { value: "#f0f4f8" },
          100: { value: "#d9e2ec" },
          200: { value: "#bcccdc" },
          300: { value: "#9fb3c8" },
          400: { value: "#829ab1" },
          500: { value: "#627d98" },
          600: { value: "#486581" },
          700: { value: "#334e68" },
          800: { value: "#243b53" },
          900: { value: "#102a43" },
        },
      },
    },
    semanticTokens: {
      colors: {
        "bg.surface": { value: { base: "#ffffff", _dark: "#102a43" } },
        "bg.page": { value: { base: "#f7f8fa", _dark: "#0d2137" } },
        "bg.muted": { value: { base: "#f0f2f5", _dark: "#1a3a5c" } },
        "text.headline": { value: { base: "#1a1a1a", _dark: "#f0f4f8" } },
        "text.body": { value: { base: "#333333", _dark: "#d9e2ec" } },
        "text.secondary": { value: { base: "#6b7280", _dark: "#9fb3c8" } },
        "text.muted": { value: { base: "#9ca3af", _dark: "#627d98" } },
        "border.subtle": { value: { base: "#e5e7eb", _dark: "#243b53" } },
        "border.strong": { value: { base: "#d1d5db", _dark: "#334e68" } },
      },
    },
  },
});
