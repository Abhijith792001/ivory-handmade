import "server-only";
import { getAnonClient } from "@/lib/supabase/server";
import * as seed from "@/lib/seed-data";
import type { BuilderBox, BuilderItem, Category, FrameExtras, FrameSize, FrameStyle, Product } from "@/types";

// Every getter reads from Supabase when configured and falls back to the
// bundled sample catalogue otherwise, so the site always renders.

function toNum<T>(row: T, keys: string[]): T {
  const out = { ...(row as Record<string, unknown>) };
  for (const k of keys) if (out[k] != null) out[k] = Number(out[k]);
  return out as T;
}

async function query<T>(table: string, fallback: T[], order = "sort_order", activeOnly = false): Promise<T[]> {
  const sb = getAnonClient();
  if (!sb) return fallback;
  let q = sb.from(table).select("*").order(order, { ascending: true });
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) {
    console.error(`[data] ${table}:`, error.message);
    return fallback;
  }
  return data as T[];
}

export async function getCategories(): Promise<Category[]> {
  return query<Category>("categories", seed.seedCategories);
}

export async function getProducts(): Promise<Product[]> {
  const rows = await query<Product>("products", seed.seedProducts, "created_at", true);
  // Products only appear in the shop once they have a photo (no placeholder cards).
  return rows.filter((p) => p.is_active && p.images?.length > 0).map((p) => toNum(p, ["price", "compare_at_price", "stock"]));
}

export async function getProduct(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getSettings<T>(key: string, fallback: T): Promise<T> {
  const sb = getAnonClient();
  if (!sb) return fallback;
  const { data } = await sb.from("settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as T) ?? fallback;
}

export async function getFrameConfig(): Promise<{ sizes: FrameSize[]; styles: FrameStyle[]; extras: FrameExtras }> {
  const [sizes, styles, extras] = await Promise.all([
    query<FrameSize>("frame_sizes", seed.seedFrameSizes),
    query<FrameStyle>("frame_styles", seed.seedFrameStyles),
    getSettings<FrameExtras>("frame_extras", seed.seedFrameExtras),
  ]);
  return {
    sizes: sizes.map((s) => toNum(s, ["width_in", "height_in", "price"])),
    styles: styles.map((s) => toNum(s, ["extra_price"])),
    extras: { mat_price: Number(extras.mat_price), engraving_price: Number(extras.engraving_price) },
  };
}

export async function getBuilderConfig(): Promise<{ boxes: BuilderBox[]; items: BuilderItem[]; extras: { note_card_price: number } }> {
  const [boxes, items, extras] = await Promise.all([
    query<BuilderBox>("builder_boxes", seed.seedBuilderBoxes),
    query<BuilderItem>("builder_items", seed.seedBuilderItems, "category"),
    getSettings("builder_extras", seed.seedBuilderExtras),
  ]);
  return {
    boxes: boxes.map((b) => toNum(b, ["price", "capacity"])),
    items: items.map((i) => toNum(i, ["price", "slots_used", "stock"])),
    extras: { note_card_price: Number(extras.note_card_price) },
  };
}
