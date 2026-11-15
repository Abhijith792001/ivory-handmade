// Shared domain types. These mirror the Supabase tables in supabase/schema.sql.

export type Occasion = "birthday" | "anniversary" | "wedding" | "baby" | "festival" | "corporate";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // key into components/brand/category-icons
  description?: string | null;
  sort_order?: number;
}

export interface ProductOptionGroup {
  name: string; // e.g. "Size", "Colour"
  values: { label: string; price_delta?: number }[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  price: number;
  compare_at_price?: number | null;
  images: string[];
  /** Alt text for the main product photo (falls back to the product name). */
  image_alt?: string | null;
  description: string;
  occasion_tags: Occasion[];
  options: ProductOptionGroup[];
  stock: number;
  is_active: boolean;
  is_bestseller?: boolean;
  created_at?: string;
}

export interface FrameSize {
  id: string;
  label: string;
  width_in: number;
  height_in: number;
  price: number;
  sort_order: number;
}

export interface FrameStyle {
  id: string;
  name: string;
  /** CSS colour used for the moulding. */
  color: string;
  /** Optional secondary colour used to build a wood/metal gradient. */
  texture?: string | null;
  extra_price: number;
  sort_order?: number;
}

export interface FrameExtras {
  mat_price: number;
  engraving_price: number;
}

export interface BuilderBox {
  id: string;
  name: string;
  capacity: number;
  price: number;
  glb_url?: string | null;
  sort_order?: number;
}

export type BuilderItemCategory =
  | "Chocolates"
  | "Jewellery"
  | "Candles"
  | "Flowers"
  | "Perfume"
  | "Keychains"
  | "Mini frames"
  | "Cards"
  | "Teddy"
  | "Skincare";

export interface BuilderItem {
  id: string;
  name: string;
  category: BuilderItemCategory;
  price: number;
  image_url?: string | null;
  glb_url?: string | null;
  slots_used: number;
  stock: number;
}

// ── Cart ────────────────────────────────────────────────

export interface ProductCartItem {
  kind: "product";
  key: string;
  productId: string;
  slug: string;
  name: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  options: Record<string, string>;
  note?: string;
  deliveryDate?: string;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zoom: number;
}

export interface FrameCartItem {
  kind: "frame";
  key: string;
  name: string;
  quantity: number;
  unitPrice: number;
  sizeId: string;
  sizeLabel: string;
  orientation: "portrait" | "landscape";
  styleId: string;
  styleName: string;
  mat: boolean;
  engraving?: string;
  crop: CropData;
  originalUrl?: string; // storage path in the private uploads bucket
  previewUrl?: string; // public preview image (or small data URL when offline)
  effectiveDpi: number;
}

export interface GiftCartItem {
  kind: "gift";
  key: string;
  name: string;
  quantity: number;
  unitPrice: number;
  boxId: string;
  boxName: string;
  items: { id: string; name: string; price: number }[];
  boxColor: string;
  ribbonColor: string;
  fillerColor: string;
  note?: string;
  previewUrl?: string;
}

export type CartItem = ProductCartItem | FrameCartItem | GiftCartItem;

// ── Orders ──────────────────────────────────────────────

export type OrderStatus = "new" | "making" | "out_for_delivery" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "whatsapp";

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  address_line: string;
  city: string;
  pincode: string;
  landmark?: string | null;
  delivery_date: string;
  time_slot: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: "razorpay" | "whatsapp";
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  gift_message?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  created_at: string;
}

export interface CheckoutPayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  address_line: string;
  city: string;
  pincode: string;
  landmark?: string;
  delivery_date: string;
  time_slot: string;
  gift_message?: string;
  payment_method: "razorpay" | "whatsapp";
  items: CartItem[];
}
