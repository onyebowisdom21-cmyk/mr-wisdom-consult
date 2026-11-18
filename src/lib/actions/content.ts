"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { syncKnowledge } from "@/lib/rag";
import { schemas } from "@/lib/validation";
import { toCamel, toSnake } from "@/lib/case";
import { routeFor, type ActionResult, type ContentKind, type ContentMap } from "@/types/platform";

function parseKind(kind: string): ContentKind | null {
  return Object.hasOwn(schemas, kind) ? kind as ContentKind : null;
}

/** FormData -> object: newline-separated list fields, checkboxes to booleans. */
function formToObject(fd: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) out[key] = fd.get(key);
  for (const k of ["deliverables", "features", "tags"]) {
    const v = out[k];
    if (typeof v === "string") out[k] = v.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  for (const k of ["isActive", "isAvailable", "isPublished", "isFeatured"]) {
    if (k in out) out[k] = out[k] === "on" || out[k] === "true";
  }
  if (out.price === "") out.price = null;
  return out;
}

function invalidate(kind: ContentKind, slug: string, category?: string) {
  // updateTag expires immediately and gives the saving admin read-your-writes.
  updateTag(kind);
  updateTag(`${kind}:${slug}`);
  updateTag("knowledge");
  revalidatePath(routeFor(kind, slug, category));
  revalidatePath("/");
  if (kind !== "services" && kind !== "products" && kind !== "articles") revalidatePath("/opportunities");
}

export async function saveContent(
  kindRaw: string,
  id: string | null,
  _previousState: ActionResult<{ id: string }>,
  fd: FormData,
): Promise<ActionResult<{ id: string }>> {
  const kind = parseKind(kindRaw);
  if (!kind) return { ok: false, error: "Invalid content type." };
  const db = await requireAdmin();
  const parsed = schemas[kind].safeParse(formToObject(fd));
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const row = toSnake(parsed.data as Record<string, unknown>);
  const { data, error } = id
    ? await db.from(kind).update(row).eq("id", id).select("*").single()
    : await db.from(kind).insert(row).select("*").single();
  if (error) return { ok: false, error: error.code === "23505" ? "That slug is already in use." : error.message };
  await syncKnowledge(kind, toCamel<ContentMap[ContentKind]>(data));
  invalidate(kind, data.slug as string, (parsed.data as { category?: string }).category);
  return { ok: true, data: { id: data.id as string } };
}

export async function deleteContent(kindRaw: string, id: string): Promise<ActionResult> {
  const kind = parseKind(kindRaw);
  if (!kind) return { ok: false, error: "Invalid content type." };
  const db = await requireAdmin();
  const { data: existing, error: readError } = await db.from(kind).select("slug, category").eq("id", id).maybeSingle();
  if (readError) return { ok: false, error: readError.message };
  const { error } = await db.from(kind).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  const { error: knowledgeError } = await db.from("knowledge_chunks").delete().eq("source_id", id);
  if (knowledgeError) return { ok: false, error: knowledgeError.message };
  if (existing?.slug) invalidate(kind, existing.slug as string, existing.category as string | undefined);
  else updateTag(kind);
  return { ok: true };
}

export async function deleteContentAction(
  kindRaw: string,
  id: string,
  _previousState: ActionResult,
  _formData: FormData,
): Promise<ActionResult> {
  return deleteContent(kindRaw, id);
}

export async function toggleFlag(
  kindRaw: string, id: string,
  flag: "is_active" | "is_available" | "is_published", value: boolean,
): Promise<ActionResult> {
  const kind = parseKind(kindRaw);
  if (!kind) return { ok: false, error: "Invalid content type." };
  const allowedFlags: Record<ContentKind, string[]> = {
    services: ["is_active"],
    products: ["is_available"],
    articles: ["is_published"],
    scholarships: ["is_published"],
    grants: ["is_published"],
    jobs: ["is_published"],
    empowerment: ["is_published"],
  };
  if (!allowedFlags[kind].includes(flag)) return { ok: false, error: "Invalid status field." };
  const db = await requireAdmin();
  const { data, error } = await db.from(kind).update({ [flag]: value }).eq("id", id).select("*").single();
  if (error) return { ok: false, error: error.message };
  await syncKnowledge(kind, toCamel<ContentMap[ContentKind]>(data));
  invalidate(kind, data.slug as string);
  return { ok: true };
}
