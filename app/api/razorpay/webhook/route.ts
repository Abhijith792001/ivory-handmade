import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { decrementStock } from "@/lib/stock";

// Optional safety net: if a customer closes the tab right after paying, the
// client-side verify call never runs. Point a Razorpay webhook for
// "payment.captured" at /api/razorpay/webhook and set RAZORPAY_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhookSignature(raw, sig)) return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  const sb = getServiceClient();
  if (!sb) return NextResponse.json({ ok: true });

  const event = JSON.parse(raw);
  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.order_id;
    if (orderId) {
      const { data: order } = await sb.from("orders").select("payment_status, items").eq("razorpay_order_id", orderId).maybeSingle();
      if (order && order.payment_status !== "paid") {
        await sb.from("orders").update({ payment_status: "paid", razorpay_payment_id: payment.id }).eq("razorpay_order_id", orderId);
        await decrementStock(sb, order.items).catch(console.error);
      }
    }
  }
  return NextResponse.json({ ok: true });
}
