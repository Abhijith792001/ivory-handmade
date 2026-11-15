"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Candy, Check, Droplet, Flame, Flower2, Frame, Gem, KeyRound, Loader2, Mail, PawPrint, Plus, RotateCcw, ShoppingBag, SprayCan, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { IvoryLoader } from "@/components/brand/loader";
import { HeartDivider } from "@/components/brand/botanical";
import { BOX_COLORS, FILLER_COLORS, RIBBON_COLORS, slotsUsed, useBuilder, type BuilderStep } from "@/store/builder";
import { useCart } from "@/store/cart";
import { giftPrice } from "@/lib/pricing";
import { useIsMobile } from "@/lib/hooks";
import { dataUrlToBlob, thumbnailDataUrl } from "@/lib/image";
import { uploadToStorage } from "@/lib/upload";
import { script } from "@/lib/fonts";
import { cn, formatINR, uid } from "@/lib/utils";
import type { BuilderBox, BuilderItem, BuilderItemCategory } from "@/types";

const GiftScene = dynamic(() => import("./gift-scene"), {
  ssr: false,
  loading: () => <IvoryLoader className="h-full" label="Loading the 3D gift box" compact />,
});

const STEPS = ["Choose box", "Add items", "Personalise", "Finish"] as const;

export const categoryIcons: Record<BuilderItemCategory, React.ComponentType<{ className?: string }>> = {
  Chocolates: Candy,
  Jewellery: Gem,
  Candles: Flame,
  Flowers: Flower2,
  Perfume: SprayCan,
  Keychains: KeyRound,
  "Mini frames": Frame,
  Cards: Mail,
  Teddy: PawPrint,
  Skincare: Droplet,
};

function Swatches({ label, options, value, onChange }: { label: string; options: readonly { name: string; hex: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="label mb-3">
        {label}: <span className="normal-case tracking-normal text-brown">{value}</span>
      </legend>
      <div className="flex flex-wrap gap-3">
        {options.map((o) => (
          <button
            key={o.name}
            type="button"
            onClick={() => onChange(o.name)}
            aria-pressed={value === o.name}
            aria-label={o.name}
            className={cn("h-11 w-11 rounded-full shadow-soft ring-2 ring-offset-2 ring-offset-cream transition", value === o.name ? "ring-sage" : "ring-transparent hover:ring-brown/20")}
            style={{ background: o.hex, boxShadow: "inset 0 0 0 1px rgba(107,58,30,0.15)" }}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function GiftBuilder({ boxes, items, noteCardPrice }: { boxes: BuilderBox[]; items: BuilderItem[]; noteCardPrice: number }) {
  const b = useBuilder();
  const addToCart = useCart((s) => s.add);
  const isMobile = useIsMobile();
  const captureRef = useRef<(() => string) | null>(null);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<BuilderItemCategory | "All">("All");
  const [shake, setShake] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (b.step !== 3) setReady(false);
  }, [b.step]);

  const used = slotsUsed(b.placed);
  const capacity = b.box?.capacity ?? 0;
  const hasNote = b.note.trim().length > 0;
  const total = b.box ? giftPrice(b.box, b.placed.map((p) => p.item), hasNote, noteCardPrice) : 0;
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))] as (BuilderItemCategory | "All")[], [items]);
  const visible = filter === "All" ? items : items.filter((i) => i.category === filter);

  const canGo = (i: number) => i === 0 || (!!b.box && (i < 3 || b.placed.length > 0));
  const go = (i: number) => canGo(i) && b.setStep(i as BuilderStep);

  const tryAdd = (item: BuilderItem) => {
    if (!b.addItem(item)) {
      setShake(item.id);
      setTimeout(() => setShake(null), 500);
    }
  };

  const handleAddToCart = async () => {
    if (!b.box || !captureRef.current) return;
    setAdding(true);
    try {
      const shot = captureRef.current();
      let previewUrl = await thumbnailDataUrl(shot, 420);
      try {
        const up = await uploadToStorage("previews", dataUrlToBlob(shot), "jpg");
        if (up?.publicUrl) previewUrl = up.publicUrl;
      } catch {
        /* keep local thumbnail */
      }
      addToCart({
        kind: "gift",
        key: uid("gift-"),
        name: `Build-your-own Gift · ${b.box.name}`,
        quantity: 1,
        unitPrice: total,
        boxId: b.box.id,
        boxName: b.box.name,
        items: b.placed.map((p) => ({ id: p.item.id, name: p.item.name, price: p.item.price })),
        boxColor: b.boxColor,
        ribbonColor: b.ribbonColor,
        fillerColor: b.fillerColor,
        note: b.note.trim() || undefined,
        previewUrl,
      });
      setAdded(true);
    } finally {
      setAdding(false);
    }
  };

  const startOver = () => {
    b.reset();
    setAdded(false);
    setReady(false);
  };

  return (
    <div className="container pb-16">
      {/* Stepper */}
      <nav aria-label="Gift builder steps" className="mx-auto mb-6 max-w-2xl sm:mb-8">
        <ol className="flex items-center">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <button onClick={() => go(i)} disabled={!canGo(i)} aria-current={b.step === i ? "step" : undefined} className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-40">
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full border text-[13px] transition duration-500",
                    b.step === i ? "border-sage bg-sage-dark text-ivory shadow-soft" : i < b.step ? "border-sage bg-sage-50 text-sage-dark" : "border-brown/20 bg-ivory text-muted"
                  )}
                >
                  {i < b.step ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className="label whitespace-nowrap text-[13px] sm:text-[13px]">{label}</span>
              </button>
              {i < STEPS.length - 1 && <span className={cn("mx-2 mb-5 h-px flex-1 transition-colors duration-500", i < b.step ? "bg-sage-dark" : "bg-brown/15")} />}
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
        {/* ── 3D stage ── */}
        <div className="sticky top-16 z-10 -mx-4 min-w-0 sm:mx-0 lg:top-28 lg:self-start">
          <div className="relative h-[42vh] min-h-[280px] overflow-hidden bg-[#F6ECE0] shadow-soft sm:rounded-[2rem] lg:h-[620px]">
            <GiftScene captureRef={captureRef} onRibbonTied={() => setReady(true)} noteFont={script.style.fontFamily} lowQuality={isMobile} />

            {/* capacity bar overlay */}
            {b.box && b.step < 3 && (
              <div className="pointer-events-none absolute left-4 right-4 top-4 rounded-2xl bg-ivory/85 px-4 py-3 shadow-soft backdrop-blur sm:left-6 sm:right-auto sm:w-64">
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="label text-[13px]">{b.box.name} box</span>
                  <span aria-live="polite">
                    {used}/{capacity} slots
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-beige/50" role="progressbar" aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={used} aria-label="Box capacity">
                  <motion.div className={cn("h-full rounded-full", used >= capacity ? "bg-brown" : "bg-sage-dark")} animate={{ width: `${capacity ? (used / capacity) * 100 : 0}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
                </div>
              </div>
            )}

            <AnimatePresence>
              {b.step === 3 && ready && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                  className="pointer-events-none absolute inset-x-0 top-6 text-center"
                >
                  <p className="font-script text-5xl text-brown drop-shadow-[0_2px_8px_rgba(251,243,234,0.9)] sm:text-6xl">Your gift is ready ♡</p>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[13px] text-muted">Drag to turn · pinch or scroll to zoom</p>
          </div>
        </div>

        {/* ── Options ── */}
        <div className="card-soft flex min-w-0 flex-col p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={b.step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35 }} className="flex-1">
              {b.step === 0 && (
                <div>
                  <h2 className="font-serif text-3xl">Choose your box</h2>
                  <p className="mt-1 text-[16px] text-muted">Each box is handmade from thick textured board and lined with paper shred.</p>
                  <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Box size">
                    {boxes.map((box) => {
                      const on = b.box?.id === box.id;
                      return (
                        <button
                          key={box.id}
                          role="radio"
                          aria-checked={on}
                          onClick={() => b.chooseBox(box)}
                          className={cn("flex items-center gap-4 rounded-2xl border p-4 text-left transition", on ? "border-sage bg-ivory shadow-soft" : "border-brown/10 bg-ivory/50 hover:border-brown/30")}
                        >
                          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-cream">
                            <span className="block rounded-[3px] border-2 border-brown/60 bg-beige/50" style={{ width: 14 + box.capacity * 2.2, height: 10 + box.capacity * 1.4 }} />
                          </span>
                          <span className="flex-1">
                            <span className="block font-serif text-2xl leading-none">{box.name}</span>
                            <span className="mt-1 block text-[13px] text-muted">Holds up to {box.capacity} items</span>
                          </span>
                          <span className="text-[17px] font-medium">{formatINR(box.price)}</span>
                          {on && <Check className="h-5 w-5 text-sage-dark" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {b.step === 1 && (
                <div>
                  <h2 className="font-serif text-3xl">Fill your box</h2>
                  <p className="mt-1 text-[16px] text-muted">Tap add and watch it drop in. Bigger pieces use more than one slot.</p>
                  <div className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-2 scrollbar-none" role="tablist" aria-label="Item categories">
                    {categories.map((c) => (
                      <button
                        key={c}
                        role="tab"
                        aria-selected={filter === c}
                        onClick={() => setFilter(c)}
                        className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition", filter === c ? "border-sage bg-sage-dark text-ivory" : "border-brown/15 bg-ivory/60 hover:border-brown/40")}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 grid max-h-[460px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                    {visible.map((item) => {
                      const Icon = categoryIcons[item.category] ?? Gem;
                      const inBox = b.placed.filter((p) => p.item.id === item.id).length;
                      const fits = used + item.slots_used <= capacity;
                      const inStock = item.stock > inBox;
                      return (
                        <motion.div key={item.id} animate={shake === item.id ? { x: [0, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.4 }} className="flex flex-col rounded-2xl bg-ivory/70 p-3 ring-1 ring-brown/5">
                          <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl bg-cream text-muted">
                            {item.image_url ? <Image src={item.image_url} alt="" fill sizes="160px" className="object-cover" /> : <Icon className="h-9 w-9" />}
                            {inBox > 0 && <span className="absolute right-2 top-2 grid h-6 min-w-6 place-items-center rounded-full bg-sage-dark px-1 text-[13px] text-ivory">{inBox}</span>}
                          </div>
                          <p className="mt-2 line-clamp-2 text-[13px] leading-snug">{item.name}</p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <span className="text-[13px] font-medium">{formatINR(item.price)}</span>
                            <button
                              onClick={() => tryAdd(item)}
                              disabled={!inStock}
                              aria-label={`Add ${item.name}`}
                              title={!inStock ? "Out of stock" : !fits ? "Not enough space in the box" : `Uses ${item.slots_used} slot${item.slots_used > 1 ? "s" : ""}`}
                              className={cn("grid h-8 w-8 place-items-center rounded-full transition", fits && inStock ? "bg-sage-dark text-ivory hover:bg-sage-dark" : "bg-brown/10 text-muted")}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          {item.slots_used > 1 && <p className="text-[13px] text-muted">{item.slots_used} slots</p>}
                        </motion.div>
                      );
                    })}
                  </div>
                  {used >= capacity && <p className="mt-3 text-[13px] text-muted" role="status">Your box is full. Remove something or choose a bigger box.</p>}
                </div>
              )}

              {b.step === 2 && (
                <div className="space-y-7">
                  <h2 className="font-serif text-3xl">Make it yours</h2>
                  <Swatches label="Box colour" options={BOX_COLORS} value={b.boxColor} onChange={b.setBoxColor} />
                  <Swatches label="Ribbon" options={RIBBON_COLORS} value={b.ribbonColor} onChange={b.setRibbonColor} />
                  <Swatches label="Paper shred" options={FILLER_COLORS} value={b.fillerColor} onChange={b.setFillerColor} />
                  <div>
                    <label htmlFor="gift-note" className="label mb-2 block">
                      Handwritten note card {noteCardPrice ? `· +${formatINR(noteCardPrice)}` : "· free"}
                    </label>
                    <Textarea id="gift-note" value={b.note} onChange={(e) => b.setNote(e.target.value)} maxLength={140} placeholder="Happy birthday, Ammu! With all my love…" className="font-script text-2xl leading-snug" />
                    <p className="mt-1 text-right text-[13px] text-muted">{b.note.length}/140 · we write it by hand</p>
                  </div>
                </div>
              )}

              {b.step === 3 && (
                <div>
                  <h2 className="font-serif text-3xl">{ready ? "All wrapped up" : "Wrapping your gift…"}</h2>
                  <p className="mt-1 text-[16px] text-muted">We&apos;ll make it exactly like this, by hand.</p>
                  <ul className="mt-6 space-y-2 text-[16px]">
                    {b.placed.map((p) => (
                      <li key={p.uid} className="flex justify-between border-b border-brown/10 pb-2">
                        <span>{p.item.name}</span>
                        <span>{formatINR(p.item.price)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-[13px] text-muted">
                    {b.boxColor} box · {b.ribbonColor} ribbon · {b.fillerColor} shred
                  </p>
                  {hasNote && <p className="mt-3 rounded-xl bg-ivory/80 px-4 py-3 font-script text-2xl">“{b.note}”</p>}
                  {added ? (
                    <div className="mt-6 rounded-2xl bg-sage-50 p-5 text-center">
                      <p className="font-script text-4xl text-sage-dark">Added to your bag ♡</p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <Button asChild>
                          <Link href="/checkout">Checkout</Link>
                        </Button>
                        <Button variant="outline" onClick={startOver}>
                          <RotateCcw /> Build another
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="lg" className="mt-6 w-full" onClick={handleAddToCart} disabled={!ready || adding}>
                      {adding || !ready ? <Loader2 className="animate-spin" /> : <ShoppingBag />} {ready ? `Add to bag · ${formatINR(total)}` : "Tying the ribbon…"}
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Price summary */}
          <div className="mt-8 border-t border-brown/10 pt-5">
            {b.box && b.step < 3 && b.placed.length > 0 && (
              <ul className="mb-4 flex flex-wrap gap-2" aria-label="Items in your box">
                {b.placed.map((p) => (
                  <li key={p.uid} className="flex items-center gap-1 rounded-full bg-ivory/80 py-1 pl-3 pr-1 text-[13px]">
                    {p.item.name}
                    <button onClick={() => b.removeItem(p.uid)} className="grid h-5 w-5 place-items-center rounded-full hover:bg-cream" aria-label={`Remove ${p.item.name}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <dl className="space-y-1 text-[13px] text-ink">
              <div className="flex justify-between">
                <dt>{b.box ? `${b.box.name} box` : "Box"}</dt>
                <dd>{b.box ? formatINR(b.box.price) : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{b.placed.length} items</dt>
                <dd>{formatINR(b.placed.reduce((s, p) => s + p.item.price, 0))}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Extras (note card, ribbon, shred)</dt>
                <dd>{hasNote && noteCardPrice ? formatINR(noteCardPrice) : "Free"}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="label">Total</span>
              <span className="font-serif text-3xl">{formatINR(total)}</span>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <Button variant="ghost" onClick={() => go(b.step - 1)} disabled={b.step === 0}>
                <ArrowLeft /> Back
              </Button>
              {b.step < 3 && (
                <Button onClick={() => go(b.step + 1)} disabled={!canGo(b.step + 1)}>
                  {b.step === 2 ? "Wrap it" : "Next"} <ArrowRight />
                </Button>
              )}
            </div>
            {b.step === 1 && b.placed.length === 0 && <p className="mt-2 text-right text-[13px] text-muted">Add at least one item to continue</p>}
          </div>
          <HeartDivider className="mt-6" />
        </div>
      </div>
    </div>
  );
}
