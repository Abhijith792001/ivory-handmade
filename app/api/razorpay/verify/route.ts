import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { decrementStock } from "@/lib/stock";

export async function POST(req: Request) {
  const sb = getServiceClient();
  if (!sb) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json().catch(() => ({}));
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }
  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    await sb.from("orders").update({ payment_status: "failed" }).eq("razorpay_order_id", razorpay_order_id);
    return NextResponse.json({ error: "Payment could not be verified" }, { status: 400 });
  }
  const { data: order } = await sb.from("orders").select("order_code, payment_status, items").eq("razorpay_order_id", razorpay_order_id).maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.payment_status !== "paid") {
    await sb.from("orders").update({ payment_status: "paid", razorpay_payment_id }).eq("razorpay_order_id", razorpay_order_id);
    await decrementStock(sb, order.items).catch(console.error);
  }
  return NextResponse.json({ ok: true, orderCode: order.order_code });
}
