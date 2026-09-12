import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/env";

export function getSupabaseBrowserClient() {
  const { url, anonKey } = supabaseEnv();
  return createBrowserClient(url, anonKey);
}
