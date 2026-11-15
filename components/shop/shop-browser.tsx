"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./product-card";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { occasions } from "@/lib/config";
import { cn, formatINR } from "@/lib/utils";
import type { Category, Product } from "@/types";

type Sort = "featured" | "price-asc" | "price-desc" | "newest";

const SORTS: Sort[] = ["featured", "price-asc", "price-desc", "newest"];

/**
 * Filters arrive from the server (searchParams), so the product grid is in the
 * first HTML response: no client-only render, no layout shift.
 */
export function ShopBrowser({
  products,
  categories,
  activeCategory,
  initialOccasion = "",
  initialSort,
}: {
  products: Product[];
  categories: Category[];
  activeCategory?: Category;
  initialOccasion?: string;
  initialSort?: string;
}) {
  const maxPrice = Math.max(500, Math.ceil(Math.max(...products.map((p) => p.price), 0) / 500) * 500);
  const [price, setPrice] = useState<[number, number]>([0, maxPrice]);
  const [sort, setSort] = useState<Sort>(SORTS.includes(initialSort as Sort) ? (initialSort as Sort) : "featured");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [occasion, setOccasionState] = useState(occasions.some((o) => o.slug === initialOccasion) ? initialOccasion : "");
  const catById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);

  // Keep the URL shareable without a server round trip.
  const setOccasion = (o: string) => {
    const next = o && o !== occasion ? o : "";
    setOccasionState(next);
    const sp = new URLSearchParams(window.location.search);
    if (next) sp.set("occasion", next);
    else sp.delete("occasion");
    const qs = sp.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  };

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price >= price[0] && p.price <= price[1]);
    if (activeCategory) list = list.filter((p) => p.category_id === activeCategory.id);
    if (occasion) list = list.filter((p) => p.occasion_tags.includes(occasion as never));
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "newest") sorted.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    if (sort === "featured") sorted.sort((a, b) => Number(!!b.is_bestseller) - Number(!!a.is_bestseller));
    return sorted;
  }, [products, price, activeCategory, occasion, sort]);

  const filters = (
    <div className="space-y-9">
      <div>
        <p className="label mb-4 text-brown">Category</p>
        <ul className="space-y-1">
          <li>
            <Link href={`/shop${occasion ? `?occasion=${occasion}` : ""}`} className={cn("block rounded-xl px-3 py-2 text-[17px] transition hover:bg-cream", !activeCategory && "bg-cream font-medium")}>
              All
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/shop/${c.slug}${occasion ? `?occasion=${occasion}` : ""}`}
                className={cn("block rounded-xl px-3 py-2 text-[17px] transition hover:bg-cream", activeCategory?.id === c.id && "bg-cream font-medium")}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="label mb-4 text-brown">Occasion</p>
        <div className="flex flex-wrap gap-2">
          {occasions.map((o) => (
            <button
              key={o.slug}
              onClick={() => setOccasion(o.slug)}
              aria-pressed={occasion === o.slug}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[13px] transition",
                occasion === o.slug ? "border-sage bg-sage-dark text-ivory" : "border-brown/15 bg-ivory/60 hover:border-brown/40"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label mb-4 text-brown">Price</p>
        <Slider min={0} max={maxPrice} step={50} value={price} onValueChange={(v) => setPrice([v[0], v[1]])} thumbLabels={["Minimum price", "Maximum price"]} />
        <div className="mt-2 flex justify-between text-[13px] text-muted">
          <span>{formatINR(price[0])}</span>
          <span>{formatINR(price[1])}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-28">{filters}</div>
      </aside>

      <div>
        <div className="mb-8 flex items-center justify-between gap-4">
          <p className="text-[16px] text-muted" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
            {occasion && (
              <button onClick={() => setOccasion("")} className="ml-3 inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-[13px] capitalize">
                {occasion} <X className="h-3 w-3" aria-label="Clear occasion" />
              </button>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <SlidersHorizontal /> Filter
            </Button>
            <label className="sr-only" htmlFor="sort">
              Sort by
            </label>
            <Select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-9 w-40 rounded-full text-[13px]">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="newest">Newest</option>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card-soft py-20 text-center">
            <p className="font-script text-4xl">Nothing here yet</p>
            <p className="mt-2 text-[17px] text-muted">Try another filter, or ask us on WhatsApp. We love custom requests.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.5 }}>
                  <ProductCard product={p} category={catById[p.category_id]} priority={i < 4} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" title="Filter">
          <div className="flex-1 overflow-y-auto px-6 py-6">{filters}</div>
          <div className="border-t border-brown/10 p-6">
            <Button className="w-full" onClick={() => setMobileOpen(false)}>
              Show {filtered.length} pieces
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
