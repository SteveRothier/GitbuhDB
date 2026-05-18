export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Variable NEXT_PUBLIC_SUPABASE_URL requise");
  }
  return url;
}

export function getSupabasePublishableKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "Variable NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY requise",
    );
  }
  return key;
}
