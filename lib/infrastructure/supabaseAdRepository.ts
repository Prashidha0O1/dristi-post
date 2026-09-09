import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "./supabaseServer";
import type { AdRepository } from "@/lib/domain/ports";
import type { Paginated } from "@/lib/domain/article";
import type { AdQuery, AdRecord } from "@/lib/domain/ad";
import type { AdPlacement } from "@/lib/adSlots";

type Row = Record<string, unknown>;

/**
 * The domain uses kebab-case slot names; Postgres uses a SCREAMING_SNAKE enum,
 * matching how status and employment type are handled elsewhere.
 */
const PLACEMENT_MAP: Record<AdPlacement, string> = {
  "home-top": "HOME_TOP",
  "home-mid": "HOME_MID",
  "home-lead-rail": "HOME_LEAD_RAIL",
  "home-latest-rail": "HOME_LATEST_RAIL",
  sidebar: "SIDEBAR",
};
const PLACEMENT_REVERSE: Record<string, AdPlacement> = Object.fromEntries(
  Object.entries(PLACEMENT_MAP).map(([k, v]) => [v, k]),
) as Record<string, AdPlacement>;

function toDomain(row: Row): AdRecord {
  return {
    id: row.id as string,
    placement: PLACEMENT_REVERSE[row.placement as string] ?? "sidebar",
    imageUrl: row.imageUrl as string,
    linkUrl: row.linkUrl as string,
    altText: (row.altText as string) ?? "",
    isActive: (row.isActive as boolean) ?? false,
    createdAt: row.createdAt as string,
    updatedAt: row.updatedAt as string,
  };
}

let _client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _client;
}

export class SupabaseAdRepository implements AdRepository {
  // Reads use a shared anon-key client: it serves anonymous public visitors and
  // works at build time inside generateStaticParams, where there is no request
  // or cookies to build a session-aware client from.
  private get db() { return getClient(); }

  // Writes go through RLS, whose "authenticated" policy checks auth.role()
  // against the caller's own JWT — which the anon client above does not carry.
  // Built fresh per call, never cached: the container holds this repository as
  // a long-lived singleton shared across requests, so caching a signed-in
  // client here would leak one admin's session into another request.
  private async writeDb() { return getSupabaseServerClient(); }

  async findById(id: string): Promise<AdRecord | null> {
    const { data, error } = await this.db.from("ads").select("*").eq("id", id).single();
    if (error || !data) return null;
    return toDomain(data);
  }

  async findActiveByPlacement(placement: AdPlacement): Promise<AdRecord | null> {
    const { data, error } = await this.db
      .from("ads")
      .select("*")
      .eq("placement", PLACEMENT_MAP[placement])
      .eq("isActive", true)
      .maybeSingle();
    if (error || !data) return null;
    return toDomain(data);
  }

  async list(query: AdQuery): Promise<Paginated<AdRecord>> {
    let q = this.db.from("ads").select("*", { count: "exact" });

    if (query.placement) q = q.eq("placement", PLACEMENT_MAP[query.placement]);
    if (query.isActive !== undefined) q = q.eq("isActive", query.isActive);

    // Active first, then newest — the order the admin list wants, since the
    // live ad for a slot is the one you're looking for.
    q = q.order("isActive", { ascending: false }).order("createdAt", { ascending: false });

    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;
    if (limit > 0) q = q.range(offset, offset + limit - 1);

    const { data, count, error } = await q;
    if (error) throw new Error(error.message);

    return { items: (data ?? []).map(toDomain), total: count ?? 0 };
  }

  async save(ad: AdRecord): Promise<void> {
    const db = await this.writeDb();
    const row = {
      id: ad.id,
      placement: PLACEMENT_MAP[ad.placement],
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      altText: ad.altText,
      isActive: ad.isActive,
      updatedAt: ad.updatedAt,
    };

    const { error } = await db.from("ads").upsert(row, { onConflict: "id" });
    if (error) throw new Error(error.message);
  }

  async delete(id: string): Promise<void> {
    const db = await this.writeDb();
    const { error } = await db.from("ads").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}
