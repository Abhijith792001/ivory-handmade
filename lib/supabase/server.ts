import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/config";

let service: SupabaseClient | null = null;
let anon: SupabaseClient | null = null;

/** Service-role client. Bypasses RLS, so use only in route handlers / server code. */
export function getServiceClient(): SupabaseClient | null {
  if (!isSupabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  service ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return service;
}

/** Anonymous client (RLS applies). Used for public catalogue reads. */
export function getAnonClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  anon ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  return anon;
}

/** Verifies the bearer token from an admin request and checks ADMIN_EMAILS. */
export async function requireAdmin(req: Request) {
  const sb = getServiceClient();
  if (!sb) return { error: "Supabase is not configured", status: 503 as const };
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: "Not signed in", status: 401 as const };
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return { error: "Session expired", status: 401 as const };
  const allowed = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!allowed.includes((data.user.email || "").toLowerCase())) return { error: "Not an admin", status: 403 as const };
  return { sb, user: data.user };
}
