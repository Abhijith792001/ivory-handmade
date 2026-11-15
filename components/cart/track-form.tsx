"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { CategoryIcon } from "@/components/brand/category-icon";
import { orderStatusFlow, orderStatusLabels } from "@/lib/config";
import { cn, formatDate, formatINR } from "@/lib/utils";

interface Tracked {
  order_code: string;
  first_name: string;
  delivery_date: string;
  time_slot: string;
  items: { name: string; quantity: number }[];
  total: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

const icons = ["sprig", "leaf", "bow", "heart"];

export function TrackForm() {
  const [code, setCode] = useState("");
  // Prefill from ?code= after mount (keeps the page statically rendered, no layout shift).
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("code");
    if (c) setCode(c.toUpperCase());
  }, []);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Tracked | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, phone }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const idx = order ? orderStatusFlow.indexOf(order.order_status as (typeof orderStatusFlow)[number]) : -1;

  return (
    <div className="container max-w-2xl py-12">
      <form onSubmit={submit} className="card-soft grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-8">
        <div>
          <Label htmlFor="code">Order ID</Label>
          <Input id="code" required placeholder="IVXXXXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        </div>
        <div>
          <Label htmlFor="tphone">Phone number</Label>
          <Input id="tphone" required type="tel" inputMode="numeric" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Search />} Track
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-6 text-center text-[16px] text-[#8A3B1E]">
          {error}
        </p>
      )}

      {order && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-soft mt-8 p-6 sm:p-8" aria-live="polite">
          <p className="font-script text-4xl">Hello {order.first_name} ♡</p>
          <p className="mt-1 text-[16px] text-muted">
            Order #{order.order_code} · placed {formatDate(order.created_at)} · {formatINR(order.total)}
          </p>
          {order.order_status === "cancelled" ? (
            <p className="mt-8 rounded-xl bg-[#F6E1D6] px-4 py-3 text-[#8A3B1E]">This order was cancelled. Message us on WhatsApp if you have questions.</p>
          ) : (
            <ol className="mt-8 grid grid-cols-4 gap-2">
              {orderStatusFlow.map((s, i) => (
                <li key={s} className="relative flex flex-col items-center text-center">
                  {i > 0 && <span className={cn("absolute right-1/2 top-6 h-0.5 w-full -translate-y-1/2", i <= idx ? "bg-sage-dark" : "bg-brown/15")} aria-hidden />}
                  <span className={cn("relative grid h-12 w-12 place-items-center rounded-full transition", i <= idx ? "bg-sage-dark text-ivory" : "bg-ivory text-muted ring-1 ring-brown/15")}>
                    {i < idx ? <Check className="h-5 w-5" /> : <CategoryIcon name={icons[i]} className="h-6 w-6" />}
                  </span>
                  <span className={cn("mt-2 text-[13px] leading-tight sm:text-[13px]", i === idx ? "font-medium text-brown" : "text-muted")}>{orderStatusLabels[s]}</span>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-8 rounded-2xl bg-ivory/70 p-4 text-[16px]">
            <p>
              <span className="label mr-2">Delivery</span> {formatDate(order.delivery_date)}, {order.time_slot}
            </p>
            <ul className="mt-3 space-y-1 text-ink">
              {order.items.map((i, n) => (
                <li key={n}>
                  {i.name} × {i.quantity}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}
    </div>
  );
}
