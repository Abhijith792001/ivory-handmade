-- Ivory — Supabase schema
-- Run this once in the Supabase SQL editor (or `supabase db push`), then `npm run seed`.

create extension if not exists pgcrypto;

-- ── Catalogue ──────────────────────────────────────────────
create table if not exists categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text not null unique,
  icon text not null default 'sprig',
  description text,
  sort_order int not null default 0
);

create table if not exists products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text not null unique,
  category_id text references categories(id) on delete set null,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  images text[] not null default '{}',
  image_alt text,
  description text not null default '',
  occasion_tags text[] not null default '{}',
  options jsonb not null default '[]',
  stock int not null default 0,
  is_active boolean not null default true,
  is_bestseller boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on products(category_id);
-- for databases created before image_alt existed
alter table products add column if not exists image_alt text;

create table if not exists frame_sizes (
  id text primary key default gen_random_uuid()::text,
  label text not null,
  width_in numeric(6,2) not null,
  height_in numeric(6,2) not null,
  price numeric(10,2) not null,
  sort_order int not null default 0
);

create table if not exists frame_styles (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  color text not null,
  texture text,
  extra_price numeric(10,2) not null default 0,
  sort_order int not null default 0
);

create table if not exists builder_boxes (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  capacity int not null,
  price numeric(10,2) not null,
  glb_url text,
  sort_order int not null default 0
);

create table if not exists builder_items (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text not null,
  price numeric(10,2) not null,
  image_url text,
  glb_url text,
  slots_used int not null default 1,
  stock int not null default 0
);

-- Key/value settings (frame mat & engraving prices, builder extras, …)
create table if not exists settings (
  key text primary key,
  value jsonb not null
);

-- ── Orders ─────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address_line text not null,
  city text not null,
  pincode text not null,
  landmark text,
  delivery_date date not null,
  time_slot text not null,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payment_method text not null check (payment_method in ('razorpay','whatsapp')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','whatsapp')),
  order_status text not null default 'new' check (order_status in ('new','making','out_for_delivery','delivered','cancelled')),
  gift_message text,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);
create index if not exists orders_phone_idx on orders(customer_phone);

-- ── Row level security ─────────────────────────────────────
-- The public (anon) key can only READ the catalogue. Orders and all writes go
-- through Next.js API routes using the service-role key, which bypasses RLS.
alter table categories    enable row level security;
alter table products      enable row level security;
alter table frame_sizes   enable row level security;
alter table frame_styles  enable row level security;
alter table builder_boxes enable row level security;
alter table builder_items enable row level security;
alter table settings      enable row level security;
alter table orders        enable row level security;

drop policy if exists "public read" on categories;
create policy "public read" on categories    for select using (true);
drop policy if exists "public read" on products;
create policy "public read" on products      for select using (is_active);
drop policy if exists "public read" on frame_sizes;
create policy "public read" on frame_sizes   for select using (true);
drop policy if exists "public read" on frame_styles;
create policy "public read" on frame_styles  for select using (true);
drop policy if exists "public read" on builder_boxes;
create policy "public read" on builder_boxes for select using (true);
drop policy if exists "public read" on builder_items;
create policy "public read" on builder_items for select using (true);
drop policy if exists "public read" on settings;
create policy "public read" on settings      for select using (true);
-- orders: no anon policies at all (tracking is served by /api/track).

-- ── Storage buckets ────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('uploads',  'uploads',  false, 20971520),  -- customer photos, private, 20 MB
  ('previews', 'previews', true,  5242880),   -- rendered gift/frame previews
  ('products', 'products', true,  10485760)   -- product images
on conflict (id) do nothing;
-- Uploads use signed upload URLs created server-side, so no anon storage
-- policies are needed. Public buckets are readable by URL.
