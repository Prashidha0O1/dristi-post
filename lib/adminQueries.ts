import { getSupabaseServerClient } from "./infrastructure/supabaseServer";

/**
 * Read-side helpers for the admin console only. Unlike `publicQueries.ts`,
 * these query Supabase directly rather than through the article repository
 * port — they're small, admin-only, low-traffic reads (populating a picker)
 * with no public-site caching concerns, so a dedicated port/adapter pair
 * would be more machinery than the problem needs.
 */

export interface AuthorOption {
  id: string;
  nameNe: string;
  nameEn?: string;
}

export async function listAuthorOptions(): Promise<AuthorOption[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("authors")
    .select("id, nameNe, nameEn")
    .order("nameNe");

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    nameNe: row.nameNe as string,
    nameEn: (row.nameEn as string) ?? undefined,
  }));
}
