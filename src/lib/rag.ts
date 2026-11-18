import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { getList } from "@/lib/data";
import { routeFor, type ContentKind, type ContentMap } from "@/types/platform";

export async function syncKnowledge<K extends ContentKind>(
  kind: K,
  item: ContentMap[K],
): Promise<void> {
  const title = item.title;
  const category = "category" in item ? item.category : undefined;
  const url = routeFor(kind, item.slug, category);
  const content = Object.entries(item)
    .filter(([key, value]) => key !== "id" && key !== "updatedAt" && value != null)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
    .join("\n");
  const { error } = await createAdminClient().from("knowledge_chunks").upsert(
    {
      source_table: kind,
      source_id: item.id,
      title,
      url,
      content,
      embedding: null,
    },
    { onConflict: "source_table,source_id" },
  );
  if (error) {
    throw new Error(`Unable to update AI knowledge for ${kind}/${item.slug}: ${error.message}`);
  }
}

type CatalogItem = ContentMap[ContentKind];

function itemText(item: CatalogItem): string {
  return Object.values(item).filter((value) => typeof value === "string").join(" ").toLowerCase();
}

export async function buildKnowledgeContext(question: string): Promise<string> {
  const kinds: ContentKind[] = [
    "services", "products", "articles", "scholarships", "grants", "jobs", "empowerment",
  ];
  const lists = await Promise.all(kinds.map((kind) => getList(kind, { limit: 30 })));
  const terms = question.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2);
  const candidates = kinds.flatMap((kind, index) =>
    ((lists[index] ?? []) as CatalogItem[]).map((item) => ({
      kind,
      item,
      score: terms.reduce((total, term) => total + Number(itemText(item).includes(term)), 0),
    })),
  );
  const selected = candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  if (!selected.length) {
    return "The public catalog is currently empty. Do not invent current offerings, prices, or opportunities.";
  }

  return selected.map(({ kind, item }) => {
    const category = "category" in item ? item.category : undefined;
    return [
      `${item.title} (${kind})`,
      `URL: ${routeFor(kind, item.slug, category)}`,
      JSON.stringify(item),
    ].join("\n");
  }).join("\n\n").slice(0, 20_000);
}
