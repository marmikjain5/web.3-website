import { createClient } from "@/utils/supabase/server";

/**
 * Server-only authentication guard.
 * Verifies that an active Supabase user session exists and that the user's
 * role in public.profiles is 'admin'.
 * Throws an Error if unauthorized.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    throw new Error("Not authorized: admin role required");
  }

  return { supabase, user };
}

