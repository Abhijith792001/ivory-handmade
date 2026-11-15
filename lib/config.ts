// Central, env-driven site configuration. Everything a shop owner may want to
// change without touching components lives here.

export const siteConfig = {
  name: "Ivory",
  tagline: "Handmade with love",
  description:
    "Handmade photo frames, gifts, hampers and bouquets from Kerala. Build your own gift box or frame your favourite memory, made by hand with love.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999",
  freeDeliveryCity: process.env.NEXT_PUBLIC_FREE_DELIVERY_CITY ?? "Kochi",
  freeDeliveryMin: Number(process.env.NEXT_PUBLIC_FREE_DELIVERY_MIN || 999),
  deliveryFee: Number(process.env.NEXT_PUBLIC_DELIVERY_FEE || 80),
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@ivoryhandmade.in",
  location: "Kerala, India",
  /** Minimum days between ordering and delivery (handmade lead time). */
  leadDays: 2,
  timeSlots: ["10 AM – 1 PM", "1 PM – 4 PM", "4 PM – 7 PM", "7 PM – 9 PM"],
};

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
);

export const isRazorpayConfigured = Boolean(
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes("xxxx")
);

export const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/build-a-gift", label: "Build a Gift" },
  { href: "/custom-frame", label: "Custom Frame" },
  { href: "/about", label: "Our Story" },
  { href: "/track", label: "Track Order" },
];

export const occasions = [
  { slug: "birthday", label: "Birthday" },
  { slug: "anniversary", label: "Anniversary" },
  { slug: "wedding", label: "Wedding" },
  { slug: "baby", label: "Baby" },
  { slug: "festival", label: "Festival" },
  { slug: "corporate", label: "Corporate" },
] as const;

export const orderStatusLabels: Record<string, string> = {
  new: "Order received",
  making: "Being handmade",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
export const orderStatusFlow = ["new", "making", "out_for_delivery", "delivered"] as const;
