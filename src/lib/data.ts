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

function reportUnavailable(operation: string, cause: unknown): void {
  const message = cause instanceof Error
    ? cause.message
    : typeof cause === "object" && cause !== null && "message" in cause && typeof cause.message === "string"
      ? cause.message
      : "Unknown data provider error.";
  console.error(`Public content ${operation} is unavailable; using an empty fallback.`, message);
}

/** Cache tags: `kind` (lists) and `kind:slug` (details). Invalidated by actions and /api/revalidate. */
export async function getList<K extends ContentKind>(kind: K, opts: { limit?: number } = {}): Promise<ContentMap[K][]> {
  "use cache";
  cacheLife("hours");
  cacheTag(kind);
  try {
    let q = createPublicClient().from(kind).select("*").order(ORDER[kind], { ascending: !DESC[kind], nullsFirst: false });
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) {
      reportUnavailable(`list query for ${kind}`, error);
      return [];
    }
    return (data ?? []).map((r) => toCamel<ContentMap[K]>(r));
  } catch (error) {
    reportUnavailable(`list query for ${kind}`, error);
    return [];
  }
}

export async function getBySlug<K extends ContentKind>(kind: K, slug: string): Promise<ContentMap[K] | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(kind, `${kind}:${slug}`);
  try {
    const { data, error } = await createPublicClient().from(kind).select("*").eq("slug", slug).maybeSingle();
    if (error) {
      reportUnavailable(`detail query for ${kind}/${slug}`, error);
      return null;
    }
    return data ? toCamel<ContentMap[K]>(data) : null;
  } catch (error) {
    reportUnavailable(`detail query for ${kind}/${slug}`, error);
    return null;
  }
}

export async function getSlugs(kind: ContentKind): Promise<{ slug: string; updatedAt: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(kind);
  try {
    const { data, error } = await createPublicClient().from(kind).select("slug, updated_at");
    if (error) {
      reportUnavailable(`slug query for ${kind}`, error);
      return [];
    }
    return (data ?? []).map((r) => ({ slug: r.slug as string, updatedAt: r.updated_at as string }));
  } catch (error) {
    reportUnavailable(`slug query for ${kind}`, error);
    return [];
  }
}
