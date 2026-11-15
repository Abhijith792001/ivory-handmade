"use client";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Download, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/layout/whatsapp-float";
import { adminFetch } from "./api";
import { orderStatusFlow, orderStatusLabels } from "@/lib/config";
import { waLink } from "@/lib/whatsapp";
import { cn, formatDate, formatINR } from "@/lib/utils";
import type { CartItem, Order, OrderStatus } from "@/types";

const statusColor: Record<string, string> = {
  new: "bg-beige/60 text-brown",
  making: "bg-sage-50 text-sage-dark",
  out_for_delivery: "bg-[#E6EEF2] text-[#36586B]",
  delivered: "bg-sage-dark text-ivory",
  cancelled: "bg-[#F6E1D6] text-[#8A3B1E]",
};

async function downloadOriginal(path: string, name: string) {
  try {
    const { url } = await adminFetch<{ url: string }>(`/api/admin/files?path=${encodeURIComponent(path)}&name=${encodeURIComponent(name)}`);
    window.open(url, "_blank", "noopener");
  } catch (e) {
    alert(e instanceof Error ? e.message : "Could not get the photo");
  }
}

function ItemDetail({ item, orderCode, n }: { item: CartItem; orderCode: string; n: number }) {
  const preview = item.kind === "product" ? item.image : item.previewUrl;
  return (
    <div className="flex gap-4 rounded-2xl bg-ivory/80 p-4">
      {preview && (
        <a href={preview} target="_blank" rel="noopener noreferrer" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="h-28 w-28 rounded-xl object-cover" />
        </a>
      )}
      <div className="min-w-0 flex-1 text-[13px]">
        <p className="font-serif text-lg">
          {item.name} <span className="text-muted">× {item.quantity}</span>
        </p>
        {item.kind === "product" && (
          <ul className="mt-1 space-y-0.5 text-ink">
            {Object.entries(item.options).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
            {item.note && <li>Note: “{item.note}”</li>}
            {item.deliveryDate && <li>Wanted by {formatDate(item.deliveryDate)}</li>}
          </ul>
        )}
        {item.kind === "frame" && (
          <ul className="mt-1 space-y-0.5 text-ink">
            <li>
              {item.sizeLabel} · {item.orientation} · {item.styleName}
              {item.mat ? " · white mat" : ""}
            </li>
            {item.engraving && <li>Engraving: “{item.engraving}”</li>}
            <li>
              Crop (px): x {Math.round(item.crop.x)}, y {Math.round(item.crop.y)}, {Math.round(item.crop.width)}×{Math.round(item.crop.height)}, rotate {item.crop.rotation}°
            </li>
            <li className={item.effectiveDpi < 150 ? "text-[#8A3B1E]" : ""}>Effective DPI: {item.effectiveDpi}</li>
            <li className="pt-2">
              {item.originalUrl ? (
                <Button size="sm" variant="outline" onClick={() => downloadOriginal(item.originalUrl!, `${orderCode}-${n}-${item.sizeLabel}.${item.originalUrl!.split(".").pop()}`)}>
                  <Download /> Original photo (full resolution)
                </Button>
              ) : (
                <span className="text-[#8A3B1E]">No upload: ask the customer to send the photo on WhatsApp.</span>
              )}
            </li>
          </ul>
        )}
        {item.kind === "gift" && (
          <ul className="mt-1 space-y-0.5 text-ink">
            <li>
              {item.boxName} box · {item.boxColor} · ribbon {item.ribbonColor} · shred {item.fillerColor}
            </li>
            <li>Items: {item.items.map((i) => i.name).join(", ")}</li>
            {item.note && <li className="font-script text-xl text-brown">“{item.note}”</li>}
          </ul>
        )}
      </div>
      <p className="shrink-0 text-[16px]">{formatINR(item.unitPrice * item.quantity)}</p>
    </div>
  );
}

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { rows } = await adminFetch<{ rows: Order[] }>(`/api/admin/orders${filter ? `?status=${filter}` : ""}`);
      setOrders(rows);
    } finally {
      setLoading(false);
    }
  }, [filter]);
  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (o: Order, order_status: OrderStatus) => {
    setSaving(o.id);
    try {
      await adminFetch("/api/admin/orders", { method: "PATCH", body: JSON.stringify({ id: o.id, order_status }) });
      setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, order_status } : x)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(null);
    }
  };

  const markPaid = async (o: Order) => {
    if (!confirm(`Mark #${o.order_code} as paid?`)) return;
    await adminFetch("/api/admin/orders", { method: "PATCH", body: JSON.stringify({ id: o.id, payment_status: "paid" }) });
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, payment_status: "paid" } : x)));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">Orders</h2>
        <div className="flex items-center gap-2">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 w-48 rounded-full text-[13px]" aria-label="Filter by status">
            <option value="">All statuses</option>
            {[...orderStatusFlow, "cancelled"].map((s) => (
              <option key={s} value={s}>
                {orderStatusLabels[s]}
              </option>
            ))}
          </Select>
          <Button size="icon" variant="ghost" onClick={load} aria-label="Refresh">
            <RefreshCw />
          </Button>
        </div>
      </div>
      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-sage-dark" />
      ) : orders.length === 0 ? (
        <p className="rounded-2xl bg-ivory/70 py-16 text-center text-muted">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const isOpen = open === o.id;
            const idx = orderStatusFlow.indexOf(o.order_status as (typeof orderStatusFlow)[number]);
            return (
              <li key={o.id} className="overflow-hidden rounded-2xl bg-ivory/70 ring-1 ring-brown/10">
                <button onClick={() => setOpen(isOpen ? null : o.id)} className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-left" aria-expanded={isOpen}>
                  <span className="font-serif text-xl">#{o.order_code}</span>
                  <span className="text-[13px]">{o.customer_name}</span>
                  <span className="text-[13px] text-muted">
                    For {formatDate(o.delivery_date)} · {o.time_slot}
                  </span>
                  <span className={cn("rounded-full px-3 py-1 text-[13px]", statusColor[o.order_status])}>{orderStatusLabels[o.order_status]}</span>
                  <span className={cn("rounded-full px-3 py-1 text-[13px]", o.payment_status === "paid" ? "bg-sage-50 text-sage-dark" : "bg-cream text-muted")}>
                    {o.payment_status === "whatsapp" ? "WhatsApp, unpaid" : o.payment_status}
                  </span>
                  <span className="ml-auto font-medium">{formatINR(Number(o.total))}</span>
                  <ChevronDown className={cn("h-4 w-4 transition", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="border-t border-brown/10 px-5 py-5">
                    <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
                      <div className="space-y-4 text-[13px]">
                        <div>
                          <p className="label mb-1">Customer</p>
                          <p>{o.customer_name}</p>
                          <p>+91 {o.customer_phone}</p>
                          {o.customer_email && <p>{o.customer_email}</p>}
                        </div>
                        <div>
                          <p className="label mb-1">Address</p>
                          <p>{o.address_line}</p>
                          {o.landmark && <p>Near {o.landmark}</p>}
                          <p>
                            {o.city} {o.pincode}
                          </p>
                        </div>
                        {o.gift_message && (
                          <div>
                            <p className="label mb-1">Gift message</p>
                            <p className="font-script text-2xl">“{o.gift_message}”</p>
                          </div>
                        )}
                        <div>
                          <p className="label mb-2">Status</p>
                          <div className="flex flex-wrap gap-2">
                            {orderStatusFlow.map((s, i) => (
                              <button
                                key={s}
                                onClick={() => setStatus(o, s)}
                                disabled={saving === o.id}
                                className={cn("rounded-full border px-3 py-1.5 text-[13px] transition", o.order_status === s ? "border-sage bg-sage-dark text-ivory" : i < idx ? "border-sage/40 text-sage-dark" : "border-brown/20 hover:border-brown/50")}
                              >
                                {orderStatusLabels[s]}
                              </button>
                            ))}
                            <button onClick={() => confirm("Cancel this order?") && setStatus(o, "cancelled")} className="rounded-full px-3 py-1.5 text-[13px] text-[#8A3B1E] hover:bg-[#F6E1D6]">
                              Cancel
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button asChild size="sm" variant="outline">
                            <a href={waLink(`Hi ${o.customer_name.split(" ")[0]}, this is Ivory about your order #${o.order_code} ♡ `, `91${o.customer_phone}`)} target="_blank" rel="noopener noreferrer">
                              <WhatsAppIcon className="h-4 w-4" /> Message customer
                            </a>
                          </Button>
                          {o.payment_status !== "paid" && (
                            <Button size="sm" variant="soft" onClick={() => markPaid(o)}>
                              Mark paid
                            </Button>
                          )}
                          {o.razorpay_payment_id && (
                            <Button asChild size="sm" variant="ghost">
                              <a href={`https://dashboard.razorpay.com/app/payments/${o.razorpay_payment_id}`} target="_blank" rel="noopener noreferrer">
                                Razorpay <ExternalLink />
                              </a>
                            </Button>
                          )}
                        </div>
                        <p className="text-[13px] text-muted">Placed {new Date(o.created_at).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="space-y-3">
                        {o.items.map((it, n) => (
                          <ItemDetail key={n} item={it} orderCode={o.order_code} n={n + 1} />
                        ))}
                        <div className="flex justify-end gap-6 pt-2 text-[13px]">
                          <span>Subtotal {formatINR(Number(o.subtotal))}</span>
                          <span>Delivery {formatINR(Number(o.delivery_fee))}</span>
                          <span className="font-medium">Total {formatINR(Number(o.total))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
