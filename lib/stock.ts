import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CartItem } from "@/types";

/**
 * Decrements stock for products and gift-builder items in an order.
 * Simple read-then-write; fine for a small handmade shop's order volume.
 */
export async function decrementStock(sb: SupabaseClient, items: CartItem[]) {
  const products = new Map<string, number>();
  const builder = new Map<string, number>();
  for (const i of items) {
    if (i.kind === "product") products.set(i.productId, (products.get(i.productId) || 0) + i.quantity);
    if (i.kind === "gift") for (const g of i.items) builder.set(g.id, (builder.get(g.id) || 0) + i.quantity);
  }
  const run = async (table: string, m: Map<string, number>) => {
    for (const [id, qty] of m) {
      const { data } = await sb.from(table).select("stock").eq("id", id).maybeSingle();
      if (data) await sb.from(table).update({ stock: Math.max(0, Number(data.stock) - qty) }).eq("id", id);
    }
  };
  await Promise.all([run("products", products), run("builder_items", builder)]);
}
