import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const keyId = () => process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const secret = () => process.env.RAZORPAY_KEY_SECRET || "";

export const razorpayReady = () => Boolean(keyId() && secret() && !keyId().includes("xxxx"));

/** Creates a Razorpay order via the REST API (amount in rupees). */
export async function createRazorpayOrder(amountInr: number, receipt: string) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${keyId()}:${secret()}`).toString("base64"),
    },
    body: JSON.stringify({ amount: Math.round(amountInr * 100), currency: "INR", receipt, payment_capture: 1 }),
  });
  if (!res.ok) throw new Error(`Razorpay order failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as { id: string; amount: number; currency: string };
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const expected = createHmac("sha256", secret()).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

export function verifyWebhookSignature(body: string, signature: string) {
  const whSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!whSecret) return false;
  const expected = createHmac("sha256", whSecret).update(body).digest("hex");
  return safeEqual(expected, signature);
}
