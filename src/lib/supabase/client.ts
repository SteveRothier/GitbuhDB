import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabasePublishableKey());
}
