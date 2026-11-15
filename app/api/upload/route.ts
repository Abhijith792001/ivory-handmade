import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

// Mints a one-time signed upload URL so the browser can upload directly to
// Supabase Storage. Customer photos go to the private "uploads" bucket;
// rendered previews go to the public "previews" bucket.

const LIMITS: Record<string, { exts: string[]; max: number }> = {
  uploads: { exts: ["jpg", "jpeg", "png", "heic", "heif"], max: 20 * 1024 * 1024 },
  previews: { exts: ["jpg", "jpeg", "png", "webp"], max: 5 * 1024 * 1024 },
};

export async function POST(req: Request) {
  const sb = getServiceClient();
  if (!sb) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const bucket = String(body?.bucket || "");
  const ext = String(body?.ext || "").toLowerCase();
  const size = Number(body?.size || 0);
  const rule = LIMITS[bucket];
  if (!rule) return NextResponse.json({ error: "Unknown bucket" }, { status: 400 });
  if (!rule.exts.includes(ext)) return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  if (!size || size > rule.max) return NextResponse.json({ error: "File is too large" }, { status: 413 });

  const day = new Date().toISOString().slice(0, 10);
  const path = `${day}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await sb.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ error: error?.message || "Could not create upload" }, { status: 500 });

  const publicUrl = bucket === "previews" ? sb.storage.from(bucket).getPublicUrl(path).data.publicUrl : undefined;
  return NextResponse.json({ path: data.path, token: data.token, publicUrl });
}
