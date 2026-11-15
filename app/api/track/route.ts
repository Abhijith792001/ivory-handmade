import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { normalisePhone } from "@/lib/utils";

// Look up an order by its code + the phone number used at checkout.
export async function POST(req: Request) {
  const sb = getServiceClient();
  if (!sb) return NextResponse.json({ error: "Order tracking isn't available yet. Please message us on WhatsApp." }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || "").trim().toUpperCase().replace(/^#/, "");
  const phone = normalisePhone(String(body.phone || ""));
  if (!code || !phone) return NextResponse.json({ error: "Please enter your order ID and phone number" }, { status: 400 });

  const { data } = await sb
    .from("orders")
    .select("order_code, customer_name, customer_phone, delivery_date, time_slot, items, total, payment_status, order_status, created_at")
    .eq("order_code", code)
    .maybeSingle();
  // Same message for "not found" and "wrong phone", so codes can't be probed.
  if (!data || data.customer_phone !== phone) return NextResponse.json({ error: "We couldn't find an order with those details" }, { status: 404 });

  return NextResponse.json({
    order_code: data.order_code,
    first_name: String(data.customer_name).split(" ")[0],
    delivery_date: data.delivery_date,
    time_slot: data.time_slot,
    items: (data.items as { name: string; quantity: number }[]).map((i) => ({ name: i.name, quantity: i.quantity })),
    total: Number(data.total),
    payment_status: data.payment_status,
    order_status: data.order_status,
    created_at: data.created_at,
  });
}
