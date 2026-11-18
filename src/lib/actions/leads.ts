"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { leadSchema } from "@/lib/validation";
import type { ActionResult } from "@/types/platform";

export async function submitLead(
  _: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check your details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: false, error: "Your message could not be submitted." };
  }

  const { error } = await createAdminClient().from("leads").insert({
    ...parsed.data,
    source: "contact",
  });
  if (error) {
    console.error("Unable to save contact inquiry:", error.message);
    return { ok: false, error: "We could not save your inquiry. Please try again later." };
  }
  return { ok: true };
}
