"use client";

// The outer layout is now handled by GlobalLayoutWrapper in app/layout.tsx
// to prevent the SiteHeader and Footer from unmounting on route transitions.
// We keep PageShell as a pass-through to avoid refactoring every page component.
export function PageShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
