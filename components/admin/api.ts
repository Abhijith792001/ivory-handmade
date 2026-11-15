"use client";
import { getBrowserClient } from "@/lib/supabase/browser";

/** fetch() for admin routes with the signed-in user's access token attached. */
export async function adminFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const sb = getBrowserClient();
  const { data } = (await sb?.auth.getSession()) ?? { data: { session: null } };
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}), Authorization: `Bearer ${data.session?.access_token ?? ""}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body as T;
}

/** Uploads a product image or GLB to the public "products" bucket; returns its public URL. */
export async function adminUpload(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const { path, token, publicUrl } = await adminFetch<{ path: string; token: string; publicUrl: string }>("/api/admin/files", {
    method: "POST",
    body: JSON.stringify({ ext }),
  });
  const sb = getBrowserClient()!;
  const { error } = await sb.storage.from("products").uploadToSignedUrl(path, token, file, { contentType: file.type || undefined });
  if (error) throw new Error(error.message);
  return publicUrl;
}
