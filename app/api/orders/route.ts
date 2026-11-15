import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { OrderError, deliveryFee, orderCode, priceCart, validateCustomer } from "@/lib/orders";
import { createRazorpayOrder, razorpayReady } from "@/lib/razorpay";
import { decrementStock } from "@/lib/stock";
import type { CheckoutPayload } from "@/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutPayload;
    const customer = validateCustomer(body);
    const { items, subtotal } = await priceCart(body.items);
    const fee = deliveryFee(subtotal, customer.city);
    const total = subtotal + fee;
    const code = orderCode();
    const sb = getServiceClient();

    if (!sb) {
      // Local preview without Supabase: WhatsApp orders still work, nothing is stored.
      if (customer.payment_method === "razorpay") throw new OrderError("Online payment isn't set up yet. Please order on WhatsApp.", 503);
      return NextResponse.json({ orderCode: code, items, subtotal, deliveryFee: fee, total, stored: false });
    }

    let razorpayOrderId: string | null = null;
    if (customer.payment_method === "razorpay") {
      if (!razorpayReady()) throw new OrderError("Online payment isn't available right now. Please order on WhatsApp.", 503);
      razorpayOrderId = (await createRazorpayOrder(total, code)).id;
    }

    const { error } = await sb.from("orders").insert({
      order_code: code,
      ...customer,
      items,
      subtotal,
      delivery_fee: fee,
      total,
      payment_status: customer.payment_method === "whatsapp" ? "whatsapp" : "pending",
      order_status: "new",
      razorpay_order_id: razorpayOrderId,
    });
    if (error) throw new Error(error.message);
    if (customer.payment_method === "whatsapp") await decrementStock(sb, items).catch(console.error);

    return NextResponse.json({
      orderCode: code,
      items,
      subtotal,
      deliveryFee: fee,
      total,
      stored: true,
      razorpay: razorpayOrderId ? { orderId: razorpayOrderId, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, amount: Math.round(total * 100) } : undefined,
    });
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[orders]", e);
    return NextResponse.json({ error: "We couldn't place your order. Please try again or order on WhatsApp." }, { status: 500 });
  }
}
