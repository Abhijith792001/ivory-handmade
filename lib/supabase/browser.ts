"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/config";

let client: SupabaseClient | null = null;
export function getBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  return client;
}
