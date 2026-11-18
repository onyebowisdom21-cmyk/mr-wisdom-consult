import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createAuthClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Unable to verify admin session: ${userError.message}`);
  }
  if (!user) {
    redirect("/admin/login");
  }

  const { data, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to verify admin access: ${error.message}`);
  }
  if (!data) {
    redirect("/admin/login?error=unauthorized");
  }

  return supabase;
}
