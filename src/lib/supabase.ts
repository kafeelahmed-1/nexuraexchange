import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env["VITE_SUPABASE_URL"] ?? "https://cvvfzgzuxyhbskdwemln.supabase.co";
const supabasePublishableKey =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  import.meta.env["VITE_SUPABASE_ANON_KEY"] ??
  "sb_publishable_so_a7JWj4BbSKAistFUDQg_SCGpFq9P";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export async function checkSupabaseConnection() {
  const { error } = await supabase.from("profiles").select("id").limit(1);

  if (error) {
    console.error("[Supabase] Database connection failed:", error.message);
    return false;
  }

  console.info("[Supabase] Database connected");
  return true;
}

if (typeof window !== "undefined") {
  void checkSupabaseConnection();
}
