"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAuthClient } from "@/lib/supabase/server";

const creds = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function signIn(_: unknown, fd: FormData) {
  const parsed = creds.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const { error } = await (await createAuthClient()).auth.signInWithPassword(parsed.data);
  if (error) return { error: "Invalid credentials." };
  redirect("/admin/dashboard");
}

export async function signOut() {
  await (await createAuthClient()).auth.signOut();
  redirect("/admin/login");
}
