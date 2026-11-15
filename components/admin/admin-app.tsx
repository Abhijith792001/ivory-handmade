"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { Boxes, Frame, Gift, LayoutGrid, Loader2, LogOut, Package, Palette, Settings, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { BrandLogo } from "@/components/brand/logo";
import { iconNames } from "@/components/brand/category-icon";
import { getBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured, occasions } from "@/lib/config";
import { cn } from "@/lib/utils";
import { OrdersPanel } from "./orders-panel";
import { TableEditor, type Field } from "./table-editor";
import { SettingsPanel } from "./settings-panel";
import { adminFetch } from "./api";

const builderCategories = ["Chocolates", "Jewellery", "Candles", "Flowers", "Perfume", "Keychains", "Mini frames", "Cards", "Teddy", "Skincare"];

function useCategoryOptions() {
  const [opts, setOpts] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    adminFetch<{ rows: { id: string; name: string }[] }>("/api/admin/categories")
      .then(({ rows }) => setOpts(rows.map((r) => ({ value: r.id, label: r.name }))))
      .catch(() => {});
  }, []);
  return opts;
}

function ProductsTab() {
  const cats = useCategoryOptions();
  const fields: Field[] = [
    { key: "name", label: "Name", type: "text", required: true, list: true },
    { key: "slug", label: "URL slug", type: "text", required: true, help: "lowercase-with-dashes, used in /product/<slug>" },
    { key: "category_id", label: "Category", type: "select", options: cats, required: true, list: true },
    { key: "price", label: "Price (₹)", type: "number", required: true, list: true, money: true },
    { key: "compare_at_price", label: "Compare-at price (₹)", type: "number", help: "Optional original price to show a sale" },
    { key: "stock", label: "Stock", type: "number", list: true },
    { key: "images", label: "Images", type: "images", list: true, help: "The first image is the main photo. Products without a photo are hidden from the shop." },
    { key: "image_alt", label: "Main photo description (alt text)", type: "text", help: "Describe the photo for screen readers and search, e.g. \"Wicker hamper with a candle and a card\"" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "occasion_tags", label: "Occasions", type: "tags", options: occasions.map((o) => ({ value: o.slug, label: o.label })) },
    { key: "options", label: "Options (JSON)", type: "json", help: 'e.g. [{"name":"Size","values":[{"label":"5×7"},{"label":"A4","price_delta":160}]}]' },
    { key: "is_bestseller", label: "Bestseller", type: "bool", list: true },
    { key: "is_active", label: "Visible in shop", type: "bool", list: true },
  ];
  return <TableEditor table="products" title="Products" fields={fields} defaults={{ is_active: true, stock: 10, images: [], occasion_tags: [], options: [] }} idPrefix="p" />;
}

const tabs = [
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "products", label: "Products", icon: Package },
  { key: "categories", label: "Categories", icon: LayoutGrid },
  { key: "builder_items", label: "Gift items", icon: Gift },
  { key: "builder_boxes", label: "Gift boxes", icon: Boxes },
  { key: "frame_sizes", label: "Frame sizes", icon: Frame },
  { key: "frame_styles", label: "Frame styles", icon: Palette },
  { key: "settings", label: "Extras", icon: Settings },
] as const;

function Dashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("orders");
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="paper border-b border-brown/10 p-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
        <div className="flex items-center justify-between lg:block">
          <Link href="/" aria-label="View site">
            <BrandLogo className="h-12 w-auto" sizes="65px" />
          </Link>
          <p className="label mt-1 hidden text-[13px] lg:block">Studio dashboard</p>
        </div>
        <nav className="mt-4 flex gap-1 overflow-x-auto scrollbar-none lg:mt-10 lg:flex-col" aria-label="Admin">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-[16px] transition", tab === t.key ? "bg-ivory font-medium shadow-soft" : "hover:bg-ivory/60")}
            >
              <t.icon className="h-4 w-4 text-sage-dark" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-6 hidden text-[13px] text-muted lg:block">
          <p className="truncate">{session.user.email}</p>
          <button onClick={() => getBrowserClient()?.auth.signOut()} className="mt-2 flex items-center gap-2 hover:text-brown">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>
      <main className="p-4 sm:p-8">
        {tab === "orders" && <OrdersPanel />}
        {tab === "products" && <ProductsTab />}
        {tab === "categories" && (
          <TableEditor
            table="categories"
            title="Categories"
            idPrefix="cat"
            defaults={{ icon: "sprig", sort_order: 10 }}
            fields={[
              { key: "name", label: "Name", type: "text", required: true, list: true },
              { key: "slug", label: "Slug", type: "text", required: true, list: true },
              { key: "icon", label: "Icon", type: "select", options: iconNames.map((n) => ({ value: n, label: n })), list: true },
              { key: "description", label: "Description", type: "textarea" },
              { key: "sort_order", label: "Sort order", type: "number", list: true },
            ]}
          />
        )}
        {tab === "builder_items" && (
          <TableEditor
            table="builder_items"
            title="Gift builder items"
            idPrefix="bi"
            defaults={{ slots_used: 1, stock: 10 }}
            fields={[
              { key: "name", label: "Name", type: "text", required: true, list: true },
              { key: "category", label: "Category", type: "select", options: builderCategories.map((c) => ({ value: c, label: c })), required: true, list: true },
              { key: "price", label: "Price (₹)", type: "number", required: true, list: true, money: true },
              { key: "slots_used", label: "Slots used", type: "number", list: true, help: "How much box space it takes" },
              { key: "stock", label: "Stock", type: "number", list: true },
              { key: "image_url", label: "Image", type: "image" },
              { key: "glb_url", label: "3D model (GLB, optional)", type: "glb", help: "Draco-compressed GLB recommended. Without one, a built-in model is used." },
            ]}
          />
        )}
        {tab === "builder_boxes" && (
          <TableEditor
            table="builder_boxes"
            title="Gift boxes"
            idPrefix="box"
            defaults={{ sort_order: 10 }}
            fields={[
              { key: "name", label: "Name", type: "text", required: true, list: true },
              { key: "capacity", label: "Capacity (slots)", type: "number", required: true, list: true },
              { key: "price", label: "Price (₹)", type: "number", required: true, list: true, money: true },
              { key: "glb_url", label: "3D model (GLB, optional)", type: "glb" },
              { key: "sort_order", label: "Sort order", type: "number" },
            ]}
          />
        )}
        {tab === "frame_sizes" && (
          <TableEditor
            table="frame_sizes"
            title="Frame sizes & prices"
            idPrefix="fs"
            defaults={{ sort_order: 20 }}
            fields={[
              { key: "label", label: "Label", type: "text", required: true, list: true },
              { key: "width_in", label: "Width (in)", type: "number", required: true, list: true },
              { key: "height_in", label: "Height (in)", type: "number", required: true, list: true },
              { key: "price", label: "Price (₹)", type: "number", required: true, list: true, money: true },
              { key: "sort_order", label: "Sort order", type: "number", list: true },
            ]}
          />
        )}
        {tab === "frame_styles" && (
          <TableEditor
            table="frame_styles"
            title="Frame styles"
            idPrefix="style"
            defaults={{ extra_price: 0, sort_order: 10 }}
            fields={[
              { key: "name", label: "Name", type: "text", required: true, list: true },
              { key: "color", label: "Colour", type: "color", required: true, list: true },
              { key: "texture", label: "Shade colour (grain)", type: "color" },
              { key: "extra_price", label: "Extra price (₹)", type: "number", list: true, money: true },
              { key: "sort_order", label: "Sort order", type: "number" },
            ]}
          />
        )}
        {tab === "settings" && <SettingsPanel />}
      </main>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await getBrowserClient()!.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  };
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="card-soft w-full max-w-sm p-8">
        <div className="text-center">
          <BrandLogo className="mx-auto h-auto w-40" sizes="160px" />
          <p className="label mt-3">Studio dashboard</p>
        </div>
        <div className="mt-8 space-y-4">
          <div>
            <Label htmlFor="a-email">Email</Label>
            <Input id="a-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="a-pass">Password</Label>
            <Input id="a-pass" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        {error && <p role="alert" className="mt-4 text-[17px] text-destructive">{error}</p>}
        <Button type="submit" className="mt-6 w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Sign in
        </Button>
      </form>
    </div>
  );
}

export function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    const sb = getBrowserClient();
    if (!sb) return setSession(null);
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="grid min-h-screen place-items-center p-4">
        <div className="card-soft max-w-lg p-8 text-center">
          <BrandLogo className="mx-auto h-auto w-40" sizes="160px" />
          <h1 className="mt-6 font-serif text-2xl">Connect Supabase to use the dashboard</h1>
          <p className="mt-3 text-[16px] leading-[1.7] text-ink">
            Add your Supabase URL, anon key, service-role key and ADMIN_EMAILS to <code>.env.local</code>, run <code>supabase/schema.sql</code>, then <code>npm run seed</code>. See the README for details.
          </p>
        </div>
      </div>
    );
  }
  if (session === undefined) return <Loader2 className="mx-auto mt-40 h-8 w-8 animate-spin text-sage-dark" />;
  return session ? <Dashboard session={session} /> : <Login />;
}
