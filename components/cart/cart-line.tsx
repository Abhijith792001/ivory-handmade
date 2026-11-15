"use client";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatDate, formatINR } from "@/lib/utils";
import type { CartItem } from "@/types";

export function CartThumb({ item }: { item: CartItem }) {
  const src = item.kind === "product" ? item.image : item.previewUrl;
  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-cream">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-cream" aria-hidden />
      )}
    </div>
  );
}

export function CartLine({ item, compact = false }: { item: CartItem; compact?: boolean }) {
  const { remove, setQuantity } = useCart();
  const details: string[] = [];
  if (item.kind === "product") {
    details.push(...Object.entries(item.options).map(([k, v]) => `${k}: ${v}`));
    if (item.deliveryDate) details.push(`Delivery ${formatDate(item.deliveryDate)}`);
    if (item.note) details.push(`Note: “${item.note}”`);
  } else if (item.kind === "frame") {
    details.push(`${item.sizeLabel} · ${item.orientation} · ${item.styleName}`);
    if (item.mat) details.push("White mat");
    if (item.engraving) details.push(`Engraving: “${item.engraving}”`);
  } else {
    details.push(`${item.boxName} box · ${item.items.length} items`);
    details.push(item.items.map((i) => i.name).join(", "));
    if (item.note) details.push(`Card: “${item.note}”`);
  }
  return (
    <div className="flex gap-4 py-4">
      <CartThumb item={item} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          {item.kind === "product" ? (
            <Link href={`/product/${item.slug}`} className="font-serif text-lg leading-snug hover:underline">
              {item.name}
            </Link>
          ) : (
            <p className="font-serif text-lg leading-snug">{item.name}</p>
          )}
          <p className="shrink-0 text-[17px] font-medium">{formatINR(item.unitPrice * item.quantity)}</p>
        </div>
        <ul className={compact ? "mt-1 space-y-0.5 text-[13px] text-muted" : "mt-1 space-y-0.5 text-[13px] text-muted"}>
          {details.map((d, i) => (
            <li key={i} className="line-clamp-2">
              {d}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center rounded-full border border-brown/15 bg-ivory/70">
            <button onClick={() => setQuantity(item.key, item.quantity - 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-cream disabled:opacity-40" disabled={item.quantity <= 1} aria-label="Decrease quantity">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-[17px]" aria-live="polite">
              {item.quantity}
            </span>
            <button onClick={() => setQuantity(item.key, item.quantity + 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-cream" aria-label="Increase quantity">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button onClick={() => remove(item.key)} className="flex items-center gap-1 text-[13px] text-muted transition hover:text-destructive" aria-label={`Remove ${item.name}`}>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
