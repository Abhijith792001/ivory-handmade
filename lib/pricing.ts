// Pricing rules shared by the client (live summaries) and the server (order
// validation). The server never trusts prices sent by the browser.
import { siteConfig } from "@/lib/config";
import type { BuilderBox, BuilderItem, FrameExtras, FrameSize, FrameStyle, Product } from "@/types";

export function framePrice(size: FrameSize, style: FrameStyle | undefined, mat: boolean, engraving: boolean, extras: FrameExtras) {
  return size.price + (style?.extra_price ?? 0) + (mat ? extras.mat_price : 0) + (engraving ? extras.engraving_price : 0);
}

export function giftPrice(box: BuilderBox, items: Pick<BuilderItem, "price">[], hasNote: boolean, noteCardPrice: number) {
  return box.price + items.reduce((s, i) => s + i.price, 0) + (hasNote ? noteCardPrice : 0);
}

export function productUnitPrice(product: Product, selected: Record<string, string>) {
  let price = product.price;
  for (const group of product.options ?? []) {
    const v = group.values.find((x) => x.label === selected[group.name]);
    price += v?.price_delta ?? 0;
  }
  return price;
}

export function deliveryFee(subtotal: number, city?: string) {
  if (subtotal <= 0) return 0;
  const freeCity = siteConfig.freeDeliveryCity;
  const free = !!freeCity && !!city && city.trim().toLowerCase() === freeCity.toLowerCase();
  if (free || subtotal >= siteConfig.freeDeliveryMin) return 0;
  return siteConfig.deliveryFee;
}
