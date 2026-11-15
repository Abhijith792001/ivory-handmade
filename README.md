# Ivory · Handmade with love

E-commerce site for **Ivory**, a handmade gifting studio in Kerala: photo frames, gifts, hampers, bouquets and crafts, with two interactive builders.

- **Build Your Own Gift** (`/build-a-gift`): a 3D gift box (React Three Fiber). Choose a box, drop items in, personalise the colours and a handwritten note, then watch the lid close and the ribbon tie itself. A screenshot of the finished box is saved with the order.
- **Custom Photo Frame** (`/custom-frame`): upload a photo (JPG/PNG/HEIC up to 20 MB), choose a size, crop, and pick a frame style. Includes a live frame preview, a to-scale "see on wall" view, a side-by-side size comparison and a DPI quality check.

**Stack:** Next.js 14 (App Router, TypeScript) · Tailwind CSS + shadcn/ui-style components · Framer Motion · React Three Fiber + drei · Zustand · Supabase (Postgres, Storage, Auth) · react-easy-crop · Razorpay · WhatsApp ordering.

---

## Quick start (local preview, no accounts needed)

```bash
npm install
cp .env.example .env.local      # optional for the preview
npm run dev                     # http://localhost:3000
```

Without Supabase keys the site runs on the bundled sample catalogue (`lib/seed-data.ts`):

- Browsing, both builders, the cart and **WhatsApp checkout** all work.
- Pay online, order tracking and `/admin` need Supabase. They show a friendly notice until it's connected.

## Full setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/schema.sql`. It creates the tables, row-level security policies and the storage buckets (`uploads` private, `previews` public, `products` public).
3. Copy the keys into `.env.local` (Settings → API):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # server only, never expose
   ADMIN_EMAILS=you@example.com
   ```
4. Seed the catalogue, frame sizes and gift-builder items:
   ```bash
   npm run seed
   ```
   Safe to re-run: it upserts by id.
5. Create your admin login: **Authentication → Users → Add user** with the same email as `ADMIN_EMAILS` and a password. Turn off public sign-ups (Authentication → Providers → Email → *Enable sign ups* off). Admin access is also checked against `ADMIN_EMAILS` on every request.

### 2. Razorpay (optional)

Add `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (use test keys first). The "Pay online" option appears automatically once they're set. Payments are verified server-side with the HMAC signature.
Recommended: add a webhook for `payment.captured` pointing at `https://<your-domain>/api/razorpay/webhook` and set `RAZORPAY_WEBHOOK_SECRET`. This marks orders paid even if the customer closes the tab right after paying.

### 3. Shop settings

All in `.env.local`:

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Click-to-chat number, digits only with country code (`91…`) |
| `NEXT_PUBLIC_FREE_DELIVERY_CITY` | City in the "Free delivery in …" banner; delivery to it is free. Leave empty to hide. |
| `NEXT_PUBLIC_FREE_DELIVERY_MIN` / `NEXT_PUBLIC_DELIVERY_FEE` | Free-delivery threshold and the standard fee |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO, sitemap and Open Graph |
| `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_CONTACT_EMAIL` | Footer and contact page |

Time slots and lead days live in `lib/config.ts`.

## Admin dashboard (`/admin`)

Sign in with your Supabase admin user.

- **Orders:** filter by status, move each order through New → Making → Out for delivery → Delivered (or cancel), mark WhatsApp orders paid, and message the customer on WhatsApp.
  - Frame orders show the crop, effective DPI and a **"Original photo (full resolution)"** download, served as a 30-minute signed URL from the private bucket.
  - Gift orders show the saved 3D screenshot.
- **Products, Categories:** full CRUD with image upload.
- **Gift items, Gift boxes:** name, price, category, slots, stock, image and optional GLB.
- **Frame sizes, Frame styles:** every price is editable here. Nothing is hard-coded in components.
- **Extras:** mat, engraving and note-card prices.

Saving in the admin revalidates the public pages immediately.

## 3D models

There was no existing Three.js gift-box build, so the box is procedural: `components/gift/gift-box-3d.tsx` (`<GiftBox3D />`). It includes the lift-off lid, ribbon tying animation, instanced paper shred and a canvas-textured script note card. Each item category has a simple procedural model in `components/gift/item-models.tsx`.

To use real models:

- **Box base:** export your box **without its lid** as GLB (Draco-compressed: `npx gltf-pipeline -i box.glb -o gift-box.glb -d`). Put it in `public/models/gift-box.glb` and set `NEXT_PUBLIC_GIFT_BOX_GLB=/models/gift-box.glb`, or set a GLB per box size in the admin. It's scaled to each box's footprint. The lid, ribbon and filler stay procedural so they can animate.
- **Items:** upload a GLB on the item in the admin. It's auto-scaled to its slot. Items with only an image fall back to a textured billboard.

**Performance:**
- The canvas is lazy-loaded with `next/dynamic({ ssr: false })` behind the Ivory loader.
- Phones get a lower pixel ratio, no shadow maps, fewer shred pieces and a smaller environment map.
- Draco decoding is handled by drei's `useGLTF`.

## How ordering works

1. The cart persists in `localStorage` (Zustand `persist`).
2. Checkout posts to `/api/orders`. The server **re-prices every line from the database**: product options, frame size/style/mat/engraving, and gift box + items + capacity. It also validates the phone, PIN code, delivery date (lead time) and slot, then saves the order.
3. **Razorpay:** a Razorpay order is created server-side, the checkout modal opens, and `/api/razorpay/verify` checks the signature and marks the order paid.
4. **WhatsApp:** the confirmation page opens WhatsApp with a pre-filled summary. It includes the order ID, items, gift-box contents, frame specs, preview links, address, slot and total.
5. Customers track orders at `/track` with their order ID and phone number.
6. Customer photos upload straight from the browser to the private `uploads` bucket via signed upload URLs (`/api/upload`), so large files never hit the 4.5 MB serverless body limit.

## Deploy (Vercel + Supabase)

1. Push this folder to a GitHub repo and import it in [Vercel](https://vercel.com/new) (framework: Next.js).
2. Add every variable from `.env.example` in **Project → Settings → Environment Variables**. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
3. Deploy. Then in Supabase, **Authentication → URL Configuration**, set the Site URL to your domain.
4. Point the Razorpay webhook at the production URL and switch to live keys when you're ready.

## Project structure

```
app/            routes (home, shop, product, build-a-gift, custom-frame, cart, checkout,
                order/[code], track, about, contact, faq, admin) + api/ + sitemap/robots/OG image
components/     brand/ (logo, botanical line art, loader, motion), layout/, home/, shop/,
                frame/ (builder + previews), gift/ (3D scene, box, item models), cart/, admin/, ui/
lib/            config, data access (Supabase with seed fallback), pricing, orders, image &
                upload helpers, Razorpay, WhatsApp message builder
store/          Zustand stores: cart (persisted), gift builder
types/          shared domain types
supabase/       schema.sql
scripts/        seed.ts, prepare-logo.mjs (makes the transparent web logo), prepare-brand-images.mjs
```

## Brand assets & accessibility

- **Logo:** `public/images/ivory-logo.png` is the master artwork (white background). Run `node scripts/prepare-logo.mjs` after replacing it. This regenerates `ivory-logo-web.png`, a trimmed, transparent version used everywhere through `<BrandLogo />` (`components/brand/logo.tsx`). If the new artwork's proportions change, update `LOGO_WIDTH`/`LOGO_HEIGHT` there.
- **Hero photos:** `public/images/hero-*.jpg`, served resized and compressed by `next/image`.
- **Text colours (WCAG AA on ivory and cream):**

  | Token | Colour | Used for | Contrast on ivory |
  |---|---|---|---|
  | `text-ink` | #4A2A17 | body text (17px, line-height 1.7) | 11.7:1 |
  | `text-label` | #5A3019 | small uppercase labels and nav (13px) | 10.2:1 |
  | `text-muted` | #6A4632 | secondary text | 7.5:1 |
  | `bg-sage-dark` | #5A6943 | buttons and panels with ivory text | 5.4:1 |

  The lighter brand sage (#6E7F52) is only used for decoration, borders and large script words. Ivory text on it is 3.96:1, which is too low for small text.

## Before launch

- Replace the sample products, prices and placeholder testimonials (`components/home/sections.tsx`) with real ones.
- **Product photos:** a product only appears in the shop once it has at least one photo. There are no placeholder cards. The first image is the main photo on the card and the product page, and its alt text comes from the *Main photo description* field in the admin. Sample photos live in `public/images/products/`.
  - Four sample products have no photo yet and are hidden: Welcome Baby Hamper, Corporate Gratitude Box, Handmade Paper Rose Bouquet and Pressed Flower Resin Coasters. Add photos in the admin to show them.
  - Already seeded Supabase before this change? Run `alter table products add column if not exists image_alt text;` (it's also in `schema.sql`), then `npm run seed` again to pick up the new images and alt text.
- Set the real WhatsApp number, Instagram handle and email.
