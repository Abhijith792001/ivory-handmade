"use client";
import { useMemo, useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/layout/whatsapp-float";
import { useCart } from "@/store/cart";
import { productUnitPrice } from "@/lib/pricing";
import { siteConfig } from "@/lib/config";
import { waLink } from "@/lib/whatsapp";
import { cn, formatINR, isoDateFromToday } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductPurchase({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries((product.options ?? []).map((g) => [g.name, g.values[0]?.label ?? ""]))
  );
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [added, setAdded] = useState(false);
  const unit = useMemo(() => productUnitPrice(product, selected), [product, selected]);
  const soldOut = product.stock <= 0;
  const minDate = isoDateFromToday(siteConfig.leadDays);

  const handleAdd = () => {
    const key = `${product.id}|${JSON.stringify(selected)}|${note}|${date}`;
    add({
      kind: "product",
      key,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      unitPrice: unit,
      quantity: qty,
      options: selected,
      note: note.trim() || undefined,
      deliveryDate: date || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="space-y-7">
      <p className="flex items-baseline gap-3">
        <span className="font-serif text-4xl">{formatINR(unit)}</span>
        {product.compare_at_price && product.compare_at_price > product.price && (
          <span className="text-lg text-muted line-through">{formatINR(product.compare_at_price)}</span>
        )}
        <span className="text-[13px] text-muted">incl. of all taxes</span>
      </p>

      {product.options.map((g) => (
        <fieldset key={g.name}>
          <legend className="label mb-3">
            {g.name}: <span className="normal-case tracking-normal text-brown">{selected[g.name]}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {g.values.map((v) => {
              const on = selected[g.name] === v.label;
              return (
                <button
                  key={v.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected((s) => ({ ...s, [g.name]: v.label }))}
                  className={cn("rounded-full border px-5 py-2 text-[16px] transition", on ? "border-sage bg-sage-dark text-ivory shadow-soft" : "border-brown/20 bg-ivory/60 hover:border-brown/50")}
                >
                  {v.label}
                  {v.price_delta ? <span className="ml-1.5 text-[13px] opacity-75">+{formatINR(v.price_delta)}</span> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div>
        <Label htmlFor="note">Personalised note (optional)</Label>
        <Textarea id="note" maxLength={160} value={note} onChange={(e) => setNote(e.target.value)} placeholder="A name, a date, or a few words from the heart…" className="min-h-[80px]" />
        <p className="mt-1 text-right text-[13px] text-muted">{note.length}/160</p>
      </div>

      <div>
        <Label htmlFor="delivery-date">Preferred delivery date</Label>
        <Input id="delivery-date" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className="max-w-[220px]" />
        <p className="mt-1.5 text-[13px] text-muted">Handmade orders need at least {siteConfig.leadDays} days. You can confirm the time slot at checkout.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-12 items-center justify-between rounded-full border border-brown/20 bg-ivory/70 px-1 sm:w-36">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream" aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </button>
          <span aria-live="polite" className="text-[17px]">
            {qty}
          </span>
          <button type="button" onClick={() => setQty((q) => Math.min(Math.max(1, product.stock), q + 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-cream" aria-label="Increase quantity">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button size="lg" className="flex-1" onClick={handleAdd} disabled={soldOut}>
          {soldOut ? "Sold out" : added ? (<><Check /> Added to bag</>) : (<><ShoppingBag /> Add to bag · {formatINR(unit * qty)}</>)}
        </Button>
      </div>
      <a
        href={waLink(`Hi Ivory! I'm interested in "${product.name}"${Object.values(selected).length ? ` (${Object.values(selected).join(", ")})` : ""}. ${siteConfig.url}/product/${product.slug}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-[13px] text-muted underline-offset-4 hover:text-brown hover:underline"
      >
        <WhatsAppIcon className="h-4 w-4 text-sage-dark" /> Ask about this on WhatsApp
      </a>
    </div>
  );
}
