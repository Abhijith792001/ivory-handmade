import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";

// Generic CRUD for the admin dashboard. Every request must carry a Supabase
// access token for an email listed in ADMIN_EMAILS.

const TABLES: Record<string, { order: string; ascending: boolean; writable: boolean; key?: string }> = {
  categories: { order: "sort_order", ascending: true, writable: true },
  products: { order: "created_at", ascending: false, writable: true },
  frame_sizes: { order: "sort_order", ascending: true, writable: true },
  frame_styles: { order: "sort_order", ascending: true, writable: true },
  builder_boxes: { order: "sort_order", ascending: true, writable: true },
  builder_items: { order: "category", ascending: true, writable: true },
  settings: { order: "key", ascending: true, writable: true, key: "key" },
  orders: { order: "created_at", ascending: false, writable: false },
};

const ORDER_FIELDS = new Set(["order_status", "payment_status"]);

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

async function guard(req: Request, table: string) {
  const cfg = TABLES[table];
  if (!cfg) return { res: bad("Unknown table", 404) };
  const auth = await requireAdmin(req);
  if ("error" in auth) return { res: bad(auth.error!, auth.status) };
  return { cfg, sb: auth.sb };
}

export async function GET(req: Request, { params }: { params: { table: string } }) {
  const g = await guard(req, params.table);
  if (g.res) return g.res;
  const url = new URL(req.url);
  let q = g.sb!.from(params.table).select("*").order(g.cfg!.order, { ascending: g.cfg!.ascending });
  if (params.table === "orders") {
    const status = url.searchParams.get("status");
    if (status) q = q.eq("order_status", status);
    q = q.limit(200);
  }
  const { data, error } = await q;
  if (error) return bad(error.message, 500);
  return NextResponse.json({ rows: data });
}

export async function POST(req: Request, { params }: { params: { table: string } }) {
  const g = await guard(req, params.table);
  if (g.res) return g.res;
  if (!g.cfg!.writable) return bad("Read only");
  const row = await req.json();
  const { data, error } = await g.sb!.from(params.table).upsert(row).select().single();
  if (error) return bad(error.message);
  revalidatePath("/", "layout");
  return NextResponse.json({ row: data });
}

export async function PATCH(req: Request, { params }: { params: { table: string } }) {
  const g = await guard(req, params.table);
  if (g.res) return g.res;
  const { id, ...patch } = await req.json();
  if (!id) return bad("Missing id");
  if (params.table === "orders") {
    for (const k of Object.keys(patch)) if (!ORDER_FIELDS.has(k)) return bad(`Field ${k} can't be edited`);
  }
  const key = g.cfg!.key || "id";
  const { data, error } = await g.sb!.from(params.table).update(patch).eq(key, id).select().single();
  if (error) return bad(error.message);
  if (params.table !== "orders") revalidatePath("/", "layout");
  return NextResponse.json({ row: data });
}

export async function DELETE(req: Request, { params }: { params: { table: string } }) {
  const g = await guard(req, params.table);
  if (g.res) return g.res;
  if (!g.cfg!.writable) return bad("Read only");
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return bad("Missing id");
  const { error } = await g.sb!.from(params.table).delete().eq(g.cfg!.key || "id", id);
  if (error) return bad(error.message);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
