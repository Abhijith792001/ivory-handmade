// Sample catalogue. Used by `npm run seed` to fill Supabase, and as the
// read-only fallback when Supabase env vars are not set (local preview).
import type { BuilderBox, BuilderItem, Category, FrameExtras, FrameSize, FrameStyle, Product } from "@/types";

export const seedCategories: Category[] = [
  { id: "cat-frames", name: "Frames", slug: "frames", icon: "frame", sort_order: 1, description: "Hand-finished photo frames for the memories you keep closest." },
  { id: "cat-gifts", name: "Gifts", slug: "gifts", icon: "sprig", sort_order: 2, description: "Small, thoughtful things, wrapped by hand." },
  { id: "cat-hampers", name: "Hampers", slug: "hampers", icon: "bow", sort_order: 3, description: "Curated boxes for every celebration." },
  { id: "cat-bouquets", name: "Bouquets", slug: "bouquets", icon: "flowers", sort_order: 4, description: "Dried, preserved and paper-flower bouquets that last." },
  { id: "cat-crafts", name: "Crafts", slug: "crafts", icon: "leaf", sort_order: 5, description: "Candles, resin and little crafted keepsakes." },
];

const sizeOpt = (vals: [string, number][]) => ({ name: "Size", values: vals.map(([label, price_delta]) => ({ label, price_delta })) });
const colourOpt = (vals: string[]) => ({ name: "Colour", values: vals.map((label) => ({ label })) });

export const seedProducts: Product[] = [
  {
    id: "p-botanical-frame", name: "Botanical Pressed-Leaf Frame", slug: "botanical-pressed-leaf-frame", category_id: "cat-frames",
    price: 690, compare_at_price: 790, images: ["/images/products/botanical-pressed-leaf-frame.jpg"],
    image_alt: "Natural wood frame with pressed green leaves and white blossoms, tied with jute twine and an Ivory tag",
    description: "Real pressed leaves and baby's breath set behind glass in a natural wood frame. Add a name or date and we'll hand-letter it in the corner.",
    occasion_tags: ["anniversary", "wedding", "birthday"], options: [sizeOpt([["5×7", 0], ["A4", 260]]), colourOpt(["Natural wood", "Walnut", "White"])],
    stock: 12, is_active: true, is_bestseller: true,
  },
  {
    id: "p-couple-frame", name: "Our Story Couple Frame", slug: "our-story-couple-frame", category_id: "cat-frames",
    price: 549, images: ["/images/products/our-story-couple-frame.jpg"],
    image_alt: "Light wood photo frame holding a couple's photo, with “Our Story” lettered on the white mat", description: "A minimal frame with your photo, names and the date you met, lettered in our signature serif.",
    occasion_tags: ["anniversary", "wedding"], options: [sizeOpt([["5×7", 0], ["A5", 40], ["A4", 160]]), colourOpt(["Natural wood", "Black", "Gold"])],
    stock: 20, is_active: true, is_bestseller: true,
  },
  {
    id: "p-baby-frame", name: "Little One Milestone Frame", slug: "little-one-milestone-frame", category_id: "cat-frames",
    price: 799, images: ["/images/products/little-one-milestone-frame.jpg"],
    image_alt: "Wooden frame with a sleeping newborn photo and “Little One” on the mat, beside knitted baby booties", description: "Birth details, a first photo and a hand-drawn sprig. A keepsake for the nursery wall.",
    occasion_tags: ["baby"], options: [sizeOpt([["A5", 0], ["A4", 120]]), colourOpt(["White", "Natural wood"])],
    stock: 10, is_active: true,
  },
  {
    id: "p-gift-box", name: "Ivory Signature Gift Box", slug: "ivory-signature-gift-box", category_id: "cat-gifts",
    price: 1299, compare_at_price: 1499, images: ["/images/products/ivory-signature-gift-box.jpg"],
    image_alt: "Open ivory gift box with a bubble candle, wrapped treats and a thank-you card, tied with jute twine",
    description: "Our most-loved box: a bubble candle, pressed-flower bookmark, Belgian chocolates and a handwritten note, tied with jute twine.",
    occasion_tags: ["birthday", "anniversary", "festival"], options: [colourOpt(["Ivory", "Kraft", "Sage"])],
    stock: 15, is_active: true, is_bestseller: true,
  },
  {
    id: "p-pouch", name: "Linen Keepsake Pouch", slug: "linen-keepsake-pouch", category_id: "cat-gifts",
    price: 349, images: ["/images/products/linen-keepsake-pouch.jpg"],
    image_alt: "Cream linen drawstring pouch printed with the Ivory botanical logo, beside a woven basket", description: "A soft cotton-linen drawstring pouch with our botanical print. Lovely for jewellery, letters or little surprises.",
    occasion_tags: ["birthday", "wedding", "corporate"], options: [], stock: 40, is_active: true,
  },
  {
    id: "p-thank-you-cards", name: "Thank You Card Set", slug: "thank-you-card-set", category_id: "cat-gifts",
    price: 249, images: ["/images/thankyou.webp"],
    image_alt: "Cream thank-you card with a hand-drawn leaf sprig, resting on linen", description: "Six textured cards with leaf illustrations and kraft envelopes.",
    occasion_tags: ["wedding", "corporate", "festival"], options: [], stock: 60, is_active: true,
  },
  {
    id: "p-celebration-hamper", name: "Celebration Hamper", slug: "celebration-hamper", category_id: "cat-hampers",
    price: 2499, images: ["/images/products/celebration-hamper.jpg"],
    image_alt: "Wicker hamper with a candle, a jar, a bottle and a “Celebrate” card, finished with an Ivory tag", description: "A wicker hamper with artisan chocolates, a soy candle, dried florals, a mini frame and a personalised card.",
    occasion_tags: ["birthday", "anniversary", "festival"], options: [sizeOpt([["Classic", 0], ["Grand", 1000]])],
    stock: 8, is_active: true, is_bestseller: true,
  },
  {
    id: "p-baby-hamper", name: "Welcome Baby Hamper", slug: "welcome-baby-hamper", category_id: "cat-hampers",
    price: 2199, images: [], description: "Organic muslin, a crochet toy, gentle skincare and a milestone frame for new parents.",
    occasion_tags: ["baby"], options: [colourOpt(["Sage", "Blush", "Ivory"])], stock: 6, is_active: true,
  },
  {
    id: "p-corporate-hamper", name: "Corporate Gratitude Box", slug: "corporate-gratitude-box", category_id: "cat-hampers",
    price: 1599, images: [], description: "Elegant thank-you boxes for teams and clients. Bulk pricing and logo cards on request.",
    occasion_tags: ["corporate", "festival"], options: [], stock: 50, is_active: true,
  },
  {
    id: "p-dried-bouquet", name: "Dried Baby's Breath Bouquet", slug: "dried-babys-breath-bouquet", category_id: "cat-bouquets",
    price: 899, images: ["/images/products/dried-babys-breath-bouquet.jpg"],
    image_alt: "Dried baby's breath bouquet wrapped in ivory paper and tied with a sage green ribbon", description: "A cloud of natural baby's breath wrapped in kraft and linen ribbon. Lasts for years.",
    occasion_tags: ["anniversary", "wedding", "birthday"], options: [sizeOpt([["Petite", 0], ["Lush", 400]])],
    stock: 14, is_active: true, is_bestseller: true,
  },
  {
    id: "p-paper-roses", name: "Handmade Paper Rose Bouquet", slug: "handmade-paper-rose-bouquet", category_id: "cat-bouquets",
    price: 1099, images: [], description: "Twelve paper roses, each folded and tinted by hand. Choose your shade.",
    occasion_tags: ["anniversary", "birthday"], options: [colourOpt(["Blush", "Ivory", "Peach"])], stock: 10, is_active: true,
  },
  {
    id: "p-bubble-candle", name: "Bubble Soy Candle", slug: "bubble-soy-candle", category_id: "cat-crafts",
    price: 399, images: ["/images/products/bubble-soy-candle.jpg"],
    image_alt: "Ivory bubble soy candle on a wood slice beside a small vase of dried flowers", description: "Hand-poured soy wax in our signature bubble shape. Gently scented with vanilla and sandalwood.",
    occasion_tags: ["birthday", "festival", "corporate"], options: [colourOpt(["Ivory", "Blush", "Sage"])],
    stock: 30, is_active: true, is_bestseller: true,
  },
  {
    id: "p-resin-coaster", name: "Pressed Flower Resin Coasters", slug: "pressed-flower-resin-coasters", category_id: "cat-crafts",
    price: 649, images: [], description: "A set of four clear resin coasters with real pressed flowers and gold flakes.",
    occasion_tags: ["wedding", "festival"], options: [], stock: 18, is_active: true,
  },
  {
    id: "p-name-tag", name: "Botanical Name Tags", slug: "botanical-name-tags", category_id: "cat-crafts",
    price: 199, images: ["/images/tag.webp"],
    image_alt: "Round Ivory card tag on jute twine beside dried baby's breath", description: "Round card tags with a name of your choice, finished with jute twine. Set of ten.",
    occasion_tags: ["wedding", "baby", "corporate"], options: [], stock: 100, is_active: true,
  },
];

/** Frame sizes. Edit prices in the admin, not in components. */
export const seedFrameSizes: FrameSize[] = [
  { id: "fs-2x2", label: "2×2", width_in: 2, height_in: 2, price: 60, sort_order: 1 },
  { id: "fs-3x3", label: "3×3", width_in: 3, height_in: 3, price: 80, sort_order: 2 },
  { id: "fs-4x4", label: "4×4", width_in: 4, height_in: 4, price: 90, sort_order: 3 },
  { id: "fs-4x6", label: "4×6", width_in: 4, height_in: 6, price: 130, sort_order: 4 },
  { id: "fs-5x5", label: "5×5", width_in: 5, height_in: 5, price: 160, sort_order: 5 },
  { id: "fs-5x7", label: "5×7", width_in: 5, height_in: 7, price: 195, sort_order: 6 },
  { id: "fs-a5", label: "A5", width_in: 5.8, height_in: 8.3, price: 230, sort_order: 7 },
  { id: "fs-10x8", label: "10×8", width_in: 10, height_in: 8, price: 300, sort_order: 8 },
  { id: "fs-a4", label: "A4", width_in: 8.3, height_in: 11.7, price: 350, sort_order: 9 },
  { id: "fs-a3", label: "A3", width_in: 11.7, height_in: 16.5, price: 520, sort_order: 10 },
  { id: "fs-a2", label: "A2", width_in: 16.5, height_in: 23.4, price: 1600, sort_order: 11 },
];

export const seedFrameStyles: FrameStyle[] = [
  { id: "style-natural", name: "Natural wood", color: "#C89B6D", texture: "#A87B4F", extra_price: 0, sort_order: 1 },
  { id: "style-walnut", name: "Walnut", color: "#5C3A22", texture: "#3F2614", extra_price: 40, sort_order: 2 },
  { id: "style-white", name: "White", color: "#F7F3EE", texture: "#E4DDD3", extra_price: 0, sort_order: 3 },
  { id: "style-black", name: "Black", color: "#222020", texture: "#3A3634", extra_price: 0, sort_order: 4 },
  { id: "style-gold", name: "Gold", color: "#D4AF6A", texture: "#A9823F", extra_price: 80, sort_order: 5 },
];

export const seedFrameExtras: FrameExtras = { mat_price: 40, engraving_price: 50 };

export const seedBuilderBoxes: BuilderBox[] = [
  { id: "box-small", name: "Small", capacity: 4, price: 249, sort_order: 1 },
  { id: "box-medium", name: "Medium", capacity: 7, price: 349, sort_order: 2 },
  { id: "box-large", name: "Large", capacity: 12, price: 499, sort_order: 3 },
];

export const seedBuilderItems: BuilderItem[] = [
  { id: "bi-choc-truffle", name: "Dark Truffle Box", category: "Chocolates", price: 220, slots_used: 1, stock: 40 },
  { id: "bi-choc-bar", name: "Hazelnut Milk Bar", category: "Chocolates", price: 140, slots_used: 1, stock: 40 },
  { id: "bi-earrings", name: "Pearl Drop Earrings", category: "Jewellery", price: 350, slots_used: 1, stock: 15 },
  { id: "bi-bracelet", name: "Gold Charm Bracelet", category: "Jewellery", price: 420, slots_used: 1, stock: 12 },
  { id: "bi-candle-bubble", name: "Bubble Candle", category: "Candles", price: 299, slots_used: 2, stock: 25 },
  { id: "bi-candle-jar", name: "Vanilla Jar Candle", category: "Candles", price: 260, slots_used: 1, stock: 25 },
  { id: "bi-dried-bunch", name: "Dried Flower Bunch", category: "Flowers", price: 180, slots_used: 2, stock: 30 },
  { id: "bi-rose", name: "Preserved Rose", category: "Flowers", price: 240, slots_used: 1, stock: 20 },
  { id: "bi-perfume", name: "Jasmine Mini Perfume", category: "Perfume", price: 380, slots_used: 1, stock: 18 },
  { id: "bi-keychain-heart", name: "Resin Heart Keychain", category: "Keychains", price: 120, slots_used: 1, stock: 50 },
  { id: "bi-keychain-name", name: "Initial Keychain", category: "Keychains", price: 150, slots_used: 1, stock: 50 },
  { id: "bi-mini-frame", name: "Mini Photo Frame 3×3", category: "Mini frames", price: 160, slots_used: 1, stock: 30 },
  { id: "bi-card", name: "Pressed Flower Card", category: "Cards", price: 90, slots_used: 1, stock: 80 },
  { id: "bi-teddy", name: "Little Linen Teddy", category: "Teddy", price: 450, slots_used: 3, stock: 10 },
  { id: "bi-lip-balm", name: "Rose Lip Balm", category: "Skincare", price: 140, slots_used: 1, stock: 40 },
  { id: "bi-face-mist", name: "Rose Water Mist", category: "Skincare", price: 290, slots_used: 1, stock: 22 },
];

export const seedBuilderExtras = { note_card_price: 0 };
