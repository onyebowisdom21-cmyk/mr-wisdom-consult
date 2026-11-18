import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requiredEnv } from "@/lib/env";
import { routeFor } from "@/types/platform";

const bodySchema = z.object({
  kind: z.enum(["services", "products", "articles", "scholarships", "grants", "jobs", "empowerment"]),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().optional(),
});

export async function POST(request: Request) {
  const secret = requiredEnv("REVALIDATE_SECRET");
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expectedBuffer = Buffer.from(secret);
  const suppliedBuffer = Buffer.from(supplied);
  if (expectedBuffer.length !== suppliedBuffer.length || !timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid revalidation request." }, { status: 400 });
  }

  revalidateTag(parsed.data.kind, "max");
  revalidateTag(`${parsed.data.kind}:${parsed.data.slug}`, "max");
  revalidateTag("knowledge", "max");
  revalidatePath(routeFor(parsed.data.kind, parsed.data.slug, parsed.data.category));
  revalidatePath("/");
  return NextResponse.json({ revalidated: true });
}
