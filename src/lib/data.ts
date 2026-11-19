import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import { toCamel } from "@/lib/case";
import type { ContentKind, ContentMap } from "@/types/platform";

const ORDER: Record<ContentKind, string> = {
  services: "title", products: "title", articles: "published_date",
  scholarships: "deadline", grants: "application_deadline", jobs: "deadline", empowerment: "deadline",
};
const DESC: Record<ContentKind, boolean> = {
  services: false, products: false, articles: true,
  scholarships: false, grants: false, jobs: false, empowerment: false,
};

/** Cache tags: `kind` (lists) and `kind:slug` (details). Invalidated by actions and /api/revalidate. */
export async function getList<K extends ContentKind>(kind: K, opts: { limit?: number } = {}): Promise<ContentMap[K][]> {
  "use cache";
  cacheLife("hours");
  cacheTag(kind);
  let q = createPublicClient().from(kind).select("*").order(ORDER[kind], { ascending: !DESC[kind], nullsFirst: false });
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) console.warn(error&&error.message);return [];
  return (data ?? []).map((r) => toCamel<ContentMap[K]>(r));
}

export async function getBySlug<K extends ContentKind>(kind: K, slug: string): Promise<ContentMap[K] | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(kind, `${kind}:${slug}`);
  const { data, error } = await createPublicClient().from(kind).select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`getBySlug(${kind}): ${error.message}`);
  return data ? toCamel<ContentMap[K]>(data) : null;
}

export async function getSlugs(kind: ContentKind): Promise<{ slug: string; updatedAt: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(kind);
  const { data, error } = await createPublicClient().from(kind).select("slug, updated_at");
  if (error) throw new Error(`getSlugs(${kind}): ${error.message}`);
  return (data ?? []).map((r) => ({ slug: r.slug as string, updatedAt: r.updated_at as string }));
}
