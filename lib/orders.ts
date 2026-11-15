import "server-only";
import { getBuilderConfig, getFrameConfig, getProducts } from "@/lib/data";
import { deliveryFee, framePrice, giftPrice, productUnitPrice } from "@/lib/pricing";
import { siteConfig } from "@/lib/config";
import { isoDateFromToday, normalisePhone } from "@/lib/utils";
import type { CartItem, CheckoutPayload } from "@/types";

export class OrderError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const clean = (s: unknown, max = 300) => (typeof s === "string" ? s.trim().slice(0, max) : "");
const remote = (u?: string) => (u && /^https:\/\//.test(u) ? u : undefined);

/** Re-prices every cart line from the catalogue. Browser prices are ignored. */
export async function priceCart(items: CartItem[]) {
  if (!Array.isArray(items) || items.length === 0) throw new OrderError("Your bag is empty");
  if (items.length > 30) throw new OrderError("Too many items in one order");
  const [products, frame, builder] = await Promise.all([getProducts(), getFrameConfig(), getBuilderConfig()]);

  const priced: CartItem[] = items.map((raw) => {
    const quantity = Math.max(1, Math.min(20, Math.floor(Number(raw.quantity) || 1)));
    if (raw.kind === "product") {
      const p = products.find((x) => x.id === raw.productId);
      if (!p) throw new OrderError(`"${clean(raw.name, 80)}" is no longer available`);
      if (p.stock < quantity) throw new OrderError(`Only ${p.stock} of "${p.name}" left`);
      const options: Record<string, string> = {};
      for (const g of p.options) {
        const v = raw.options?.[g.name];
        if (!g.values.some((x) => x.label === v)) throw new OrderError(`Please choose a ${g.name.toLowerCase()} for "${p.name}"`);
        options[g.name] = v;
      }
      return {
        kind: "product",
        key: clean(raw.key, 200),
        productId: p.id,
        slug: p.slug,
        name: p.name,
        image: p.images[0],
        unitPrice: productUnitPrice(p, options),
        quantity,
        options,
        note: clean(raw.note, 160) || undefined,
        deliveryDate: clean(raw.deliveryDate, 10) || undefined,
      };
    }
    if (raw.kind === "frame") {
      const size = frame.sizes.find((s) => s.id === raw.sizeId);
      const style = frame.styles.find((s) => s.id === raw.styleId);
      if (!size || !style) throw new OrderError("A frame size or style is no longer available");
      const engraving = clean(raw.engraving, 40) || undefined;
      return {
        kind: "frame",
        key: clean(raw.key, 60),
        name: `Custom Photo Frame · ${size.label}`,
        quantity,
        unitPrice: framePrice(size, style, !!raw.mat, !!engraving, frame.extras),
        sizeId: size.id,
        sizeLabel: size.label,
        orientation: raw.orientation === "landscape" ? "landscape" : "portrait",
        styleId: style.id,
        styleName: style.name,
        mat: !!raw.mat,
        engraving,
        crop: {
          x: Number(raw.crop?.x) || 0,
          y: Number(raw.crop?.y) || 0,
          width: Number(raw.crop?.width) || 0,
          height: Number(raw.crop?.height) || 0,
          rotation: Number(raw.crop?.rotation) || 0,
          zoom: Number(raw.crop?.zoom) || 1,
        },
        originalUrl: clean(raw.originalUrl, 200) || undefined,
        previewUrl: remote(raw.previewUrl),
        effectiveDpi: Number(raw.effectiveDpi) || 0,
      };
    }
    if (raw.kind === "gift") {
      const box = builder.boxes.find((b) => b.id === raw.boxId);
      if (!box) throw new OrderError("That gift box size is no longer available");
      const chosen = (raw.items || []).map((i) => {
        const it = builder.items.find((x) => x.id === i.id);
        if (!it) throw new OrderError(`"${clean(i.name, 60)}" is no longer available for gift boxes`);
        return it;
      });
      if (chosen.length === 0) throw new OrderError("Your gift box is empty");
      const slots = chosen.reduce((s, i) => s + i.slots_used, 0);
      if (slots > box.capacity) throw new OrderError(`Your ${box.name} gift box is over capacity`);
      const note = clean(raw.note, 140) || undefined;
      return {
        kind: "gift",
        key: clean(raw.key, 60),
        name: `Build-your-own Gift · ${box.name}`,
        quantity,
        unitPrice: giftPrice(box, chosen, !!note, builder.extras.note_card_price),
        boxId: box.id,
        boxName: box.name,
        items: chosen.map((i) => ({ id: i.id, name: i.name, price: i.price })),
        boxColor: clean(raw.boxColor, 20),
        ribbonColor: clean(raw.ribbonColor, 20),
        fillerColor: clean(raw.fillerColor, 20),
        note,
        previewUrl: remote(raw.previewUrl),
      };
    }
    throw new OrderError("Unknown item in bag");
  });

  const subtotal = priced.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  return { items: priced, subtotal };
}

export function validateCustomer(b: CheckoutPayload) {
  const name = clean(b.customer_name, 80);
  const phone = normalisePhone(clean(b.customer_phone, 20));
  const address = clean(b.address_line, 300);
  const city = clean(b.city, 60);
  const pincode = clean(b.pincode, 6);
  const date = clean(b.delivery_date, 10);
  if (name.length < 2) throw new OrderError("Please enter your name");
  if (!phone) throw new OrderError("Please enter a valid 10-digit mobile number");
  if (address.length < 8) throw new OrderError("Please enter your full delivery address");
  if (!city) throw new OrderError("Please enter your city");
  if (!/^[1-9]\d{5}$/.test(pincode)) throw new OrderError("Please enter a valid 6-digit PIN code");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < isoDateFromToday(siteConfig.leadDays)) throw new OrderError(`Please choose a delivery date at least ${siteConfig.leadDays} days from today`);
  if (!siteConfig.timeSlots.includes(b.time_slot)) throw new OrderError("Please choose a delivery time slot");
  if (b.payment_method !== "razorpay" && b.payment_method !== "whatsapp") throw new OrderError("Please choose a payment method");
  return {
    customer_name: name,
    customer_phone: phone,
    customer_email: clean(b.customer_email, 120) || null,
    address_line: address,
    city,
    pincode,
    landmark: clean(b.landmark, 120) || null,
    delivery_date: date,
    time_slot: b.time_slot,
    gift_message: clean(b.gift_message, 300) || null,
    payment_method: b.payment_method,
  };
}

export function orderCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "IV" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export { deliveryFee };
