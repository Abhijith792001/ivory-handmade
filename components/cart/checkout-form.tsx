"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/layout/whatsapp-float";
import { IvoryLoader } from "@/components/brand/loader";
import { CartThumb } from "./cart-line";
import { cartSubtotal, useCart } from "@/store/cart";
import { useHydrated } from "@/lib/hooks";
import { deliveryFee } from "@/lib/pricing";
import { isRazorpayConfigured, siteConfig } from "@/lib/config";
import { orderWhatsAppMessage } from "@/lib/whatsapp";
import { cn, formatINR, isoDateFromToday } from "@/lib/utils";
import type { CartItem, CheckoutPayload } from "@/types";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export interface LastOrder {
  code: string;
  method: "razorpay" | "whatsapp";
  paid: boolean;
  total: number;
  waMessage: string;
  name: string;
  deliveryDate: string;
  timeSlot: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCart();
  const hydrated = useHydrated();
  const minDate = isoDateFromToday(siteConfig.leadDays);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    address_line: "",
    landmark: "",
    city: siteConfig.freeDeliveryCity || "",
    pincode: "",
    delivery_date: minDate,
    time_slot: siteConfig.timeSlots[0],
    gift_message: "",
  });
  const [method, setMethod] = useState<"razorpay" | "whatsapp">(isRazorpayConfigured ? "razorpay" : "whatsapp");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const subtotal = cartSubtotal(items);
  const fee = deliveryFee(subtotal, form.city);
  const total = subtotal + fee;

  if (!hydrated) return <IvoryLoader className="py-24" compact />;
  if (items.length === 0) {
    return (
      <div className="container max-w-xl py-16 text-center">
        <p className="font-script text-5xl">Your bag is empty</p>
        <Button asChild className="mt-8">
          <Link href="/shop">Browse the shop</Link>
        </Button>
      </div>
    );
  }

  const finish = (last: LastOrder) => {
    try {
      sessionStorage.setItem("ivory-last-order", JSON.stringify(last));
    } catch {}
    clear();
    router.push(`/order/${last.code}`);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload: CheckoutPayload = { ...form, payment_method: method, items };
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      const address = [form.address_line, form.landmark, `${form.city} ${form.pincode}`].filter(Boolean).join(", ");
      const waMessage = orderWhatsAppMessage({
        orderCode: data.orderCode,
        name: form.customer_name,
        phone: form.customer_phone,
        address,
        deliveryDate: form.delivery_date,
        timeSlot: form.time_slot,
        giftMessage: form.gift_message,
        items: data.items as CartItem[],
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        total: data.total,
      });
      const base: LastOrder = {
        code: data.orderCode,
        method,
        paid: false,
        total: data.total,
        waMessage,
        name: form.customer_name,
        deliveryDate: form.delivery_date,
        timeSlot: form.time_slot,
      };

      if (method === "whatsapp") return finish(base);

      if (!(await loadRazorpay()) || !window.Razorpay) throw new Error("Couldn't load the payment window. Check your connection or order on WhatsApp.");
      const rzp = new window.Razorpay({
        key: data.razorpay.keyId,
        order_id: data.razorpay.orderId,
        amount: data.razorpay.amount,
        currency: "INR",
        name: "Ivory Handmade",
        description: `Order #${data.orderCode}`,
        prefill: { name: form.customer_name, contact: form.customer_phone, email: form.customer_email || undefined },
        notes: { order_code: data.orderCode },
        theme: { color: "#6E7F52" },
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await fetch("/api/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) });
          if (v.ok) finish({ ...base, paid: true });
          else {
            setError("We couldn't confirm your payment. If money was deducted, message us on WhatsApp with your order ID " + data.orderCode + ".");
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled. You can try again or order on WhatsApp instead.");
            setBusy(false);
          },
        },
      });
      rzp.on("payment.failed", () => setError("The payment failed. Please try again or choose WhatsApp."));
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="container grid max-w-6xl gap-10 py-12 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-10">
        <section className="card-soft p-6 sm:p-8">
          <h2 className="font-serif text-2xl">Your details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required autoComplete="name" value={form.customer_name} onChange={set("customer_name")} />
            </div>
            <div>
              <Label htmlFor="phone">Mobile (WhatsApp)</Label>
              <Input id="phone" required type="tel" inputMode="numeric" autoComplete="tel" placeholder="98765 43210" value={form.customer_phone} onChange={set("customer_phone")} />
            </div>
            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" type="email" autoComplete="email" value={form.customer_email} onChange={set("customer_email")} />
            </div>
          </div>
        </section>

        <section className="card-soft p-6 sm:p-8">
          <h2 className="font-serif text-2xl">Delivery</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" required autoComplete="street-address" className="min-h-[80px]" placeholder="House name, street, area" value={form.address_line} onChange={set("address_line")} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="landmark">Landmark (optional)</Label>
              <Input id="landmark" value={form.landmark} onChange={set("landmark")} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" required autoComplete="address-level2" value={form.city} onChange={set("city")} />
            </div>
            <div>
              <Label htmlFor="pincode">PIN code</Label>
              <Input id="pincode" required inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} autoComplete="postal-code" value={form.pincode} onChange={set("pincode")} />
            </div>
            <div>
              <Label htmlFor="date">Delivery date</Label>
              <Input id="date" type="date" required min={minDate} value={form.delivery_date} onChange={set("delivery_date")} />
            </div>
            <div>
              <Label htmlFor="slot">Time slot</Label>
              <Select id="slot" value={form.time_slot} onChange={set("time_slot")}>
                {siteConfig.timeSlots.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="gift">Gift message (optional)</Label>
              <Textarea id="gift" maxLength={300} placeholder="We'll handwrite this on a card ♡" className="font-script text-2xl" value={form.gift_message} onChange={set("gift_message")} />
            </div>
          </div>
        </section>

        <section className="card-soft p-6 sm:p-8">
          <h2 className="font-serif text-2xl">Payment</h2>
          <div className="mt-5 grid gap-3" role="radiogroup" aria-label="Payment method">
            {isRazorpayConfigured && (
              <label className={cn("flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition", method === "razorpay" ? "border-sage bg-ivory shadow-soft" : "border-brown/15 bg-ivory/50")}>
                <input type="radio" name="method" className="accent-[#6E7F52]" checked={method === "razorpay"} onChange={() => setMethod("razorpay")} />
                <CreditCard className="h-5 w-5 text-sage-dark" />
                <span>
                  <span className="block text-[17px]">Pay online</span>
                  <span className="text-[13px] text-muted">UPI, cards, netbanking · secured by Razorpay</span>
                </span>
              </label>
            )}
            <label className={cn("flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition", method === "whatsapp" ? "border-sage bg-ivory shadow-soft" : "border-brown/15 bg-ivory/50")}>
              <input type="radio" name="method" className="accent-[#6E7F52]" checked={method === "whatsapp"} onChange={() => setMethod("whatsapp")} />
              <WhatsAppIcon className="h-5 w-5 text-sage-dark" />
              <span>
                <span className="block text-[17px]">Order on WhatsApp</span>
                <span className="text-[13px] text-muted">Send us your order summary and pay by UPI after we confirm</span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <aside className="card-soft h-fit p-6 sm:p-8 lg:sticky lg:top-28">
        <h2 className="font-serif text-2xl">Your order</h2>
        <ul className="mt-4 max-h-[320px] space-y-4 overflow-y-auto pr-1">
          {items.map((i) => (
            <li key={i.key} className="flex items-center gap-3">
              <CartThumb item={i} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-[17px]">{i.name}</p>
                <p className="text-[13px] text-muted">Qty {i.quantity}</p>
              </div>
              <p className="text-[16px]">{formatINR(i.unitPrice * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-brown/10 pt-4 text-[16px]">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatINR(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>{fee ? formatINR(fee) : <span className="text-sage-dark">Free</span>}</dd>
          </div>
          <div className="flex items-baseline justify-between pt-2">
            <dt className="label">Total</dt>
            <dd className="font-serif text-3xl">{formatINR(total)}</dd>
          </div>
        </dl>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-[#F6E1D6] px-4 py-3 text-[13px] text-[#8A3B1E]">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : method === "razorpay" ? <Lock /> : <WhatsAppIcon className="h-4 w-4" />}
          {method === "razorpay" ? `Pay ${formatINR(total)}` : "Place order on WhatsApp"}
        </Button>
        <p className="mt-3 text-center text-[13px] text-muted">By placing your order you agree to our handmade lead time of {siteConfig.leadDays}+ days.</p>
      </aside>
    </form>
  );
}
