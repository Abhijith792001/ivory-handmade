import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/server";

// GET  ?path=…  → short-lived signed URL to download a customer's original photo
// POST {ext}    → signed upload URL for a product image / GLB in the public "products" bucket
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const url = new URL(req.url);
  const path = url.searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });
  const name = url.searchParams.get("name") || path.split("/").pop() || "photo";
  const { data, error } = await auth.sb.storage.from("uploads").createSignedUrl(path, 60 * 30, { download: name });
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ url: data.signedUrl });
}

const EXTS = ["jpg", "jpeg", "png", "webp", "avif", "glb"];

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { ext } = await req.json().catch(() => ({}));
  const e = String(ext || "").toLowerCase();
  if (!EXTS.includes(e)) return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  const path = `${e === "glb" ? "models" : "images"}/${crypto.randomUUID()}.${e}`;
  const { data, error } = await auth.sb.storage.from("products").createSignedUploadUrl(path);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const publicUrl = auth.sb.storage.from("products").getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ path: data.path, token: data.token, publicUrl });
}
