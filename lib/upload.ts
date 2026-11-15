"use client";
import { getBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/config";

export type UploadBucket = "uploads" | "previews";

/**
 * Uploads a file straight from the browser to Supabase Storage using a signed
 * upload URL minted by /api/upload. Large photos never pass through our
 * server, which avoids serverless body-size limits.
 * Returns null when Supabase isn't configured (local preview mode).
 */
export async function uploadToStorage(bucket: UploadBucket, file: Blob, ext: string): Promise<{ path: string; publicUrl?: string } | null> {
  if (!isSupabaseConfigured) return null;
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket, ext, size: file.size }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Upload failed");
  const { path, token, publicUrl } = (await res.json()) as { path: string; token: string; publicUrl?: string };
  const sb = getBrowserClient()!;
  const { error } = await sb.storage.from(bucket).uploadToSignedUrl(path, token, file, { contentType: file.type || undefined });
  if (error) throw new Error(error.message);
  return { path, publicUrl };
}

export function extFor(file: File | Blob) {
  if (file instanceof File) {
    const m = file.name.match(/\.([a-z0-9]+)$/i);
    if (m) return m[1].toLowerCase();
  }
  return file.type === "image/png" ? "png" : "jpg";
}
