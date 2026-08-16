import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Mukta', 'Poppins', sans-serif" },
        body: { value: "'Mukta', 'Poppins', sans-serif" },
      },
      colors: {
        brand: {
          50: { value: "#eff6ff" },
          100: { value: "#dbeafe" },
          200: { value: "#bfdbfe" },
          300: { value: "#93c5fd" },
          400: { value: "#60a5fa" },
          500: { value: "#3b82f6" },
          600: { value: "#2563eb" },
          700: { value: "#1d4ed8" },
          800: { value: "#1e40af" },
          900: { value: "#1e3a8a" },
        },
        accent: {
          50: { value: "#fef2f2" },
          100: { value: "#fee2e2" },
          200: { value: "#fecaca" },
          300: { value: "#fca5a5" },
          400: { value: "#f87171" },
          500: { value: "#ef4444" },
          600: { value: "#dc2626" },
          700: { value: "#b91c1c" },
          800: { value: "#991b1b" },
          900: { value: "#7f1d1d" },
        },
      },
    },
    semanticTokens: {
      colors: {
        "bg.surface": {
          value: { base: "#ffffff", _dark: "#1a1a2e" },
        },
        "bg.muted": {
          value: { base: "#f8fafc", _dark: "#16213e" },
        },
        "bg.subtle": {
          value: { base: "#f1f5f9", _dark: "#0f3460" },
        },
        "text.primary": {
          value: { base: "#1e293b", _dark: "#e2e8f0" },
        },
        "text.secondary": {
          value: { base: "#64748b", _dark: "#94a3b8" },
        },
        "text.muted": {
          value: { base: "#94a3b8", _dark: "#64748b" },
        },
        "border.default": {
          value: { base: "#e2e8f0", _dark: "#334155" },
        },
        "breaking.bg": {
          value: { base: "#dc2626", _dark: "#991b1b" },
        },
        "breaking.text": {
          value: { base: "#ffffff", _dark: "#fecaca" },
        },
        "category.bg": {
          value: { base: "#eff6ff", _dark: "#1e3a5f" },
        },
        "category.text": {
          value: { base: "#2563eb", _dark: "#93c5fd" },
        },
      },
    },
  },
});
