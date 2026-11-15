import { siteConfig } from "@/lib/config";
import { formatDate, formatINR } from "@/lib/utils";
import type { CartItem } from "@/types";

export function waLink(text: string, number = siteConfig.whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

const isRemote = (u?: string) => !!u && u.startsWith("http");

export function describeItem(i: CartItem) {
  if (i.kind === "product") {
    const opts = Object.entries(i.options).map(([k, v]) => `${k}: ${v}`).join(", ");
    const extra = [i.note ? `Note: "${i.note}"` : "", i.deliveryDate ? `Needed by ${formatDate(i.deliveryDate)}` : ""].filter(Boolean);
    return `${i.name}${opts ? ` (${opts})` : ""}${extra.length ? `\n   ${extra.join(" · ")}` : ""}`;
  }
  if (i.kind === "frame") {
    return (
      `Custom frame ${i.sizeLabel} ${i.orientation}, ${i.styleName}${i.mat ? " + white mat" : ""}` +
      `${i.engraving ? `, engraving "${i.engraving}"` : ""}` +
      `${isRemote(i.previewUrl) ? `\n   Preview: ${i.previewUrl}` : "\n   (I'll send the photo here)"}`
    );
  }
  return (
    `Build-your-own gift (${i.boxName} box): ${i.items.map((x) => x.name).join(", ")}; box ${i.boxColor}, ribbon ${i.ribbonColor}, filler ${i.fillerColor}` +
    `${i.note ? `\n   Card: "${i.note}"` : ""}${isRemote(i.previewUrl) ? `\n   Preview: ${i.previewUrl}` : ""}`
  );
}

export function orderWhatsAppMessage(o: {
  orderCode?: string;
  name: string;
  phone: string;
  address: string;
  deliveryDate: string;
  timeSlot: string;
  giftMessage?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}) {
  const lines = [
    `Hello Ivory ♡ I'd like to place an order${o.orderCode ? ` (#${o.orderCode})` : ""}.`,
    "",
    ...o.items.map((i, n) => `${n + 1}. ${describeItem(i)}\n   × ${i.quantity} = ${formatINR(i.unitPrice * i.quantity)}`),
    "",
    `Subtotal: ${formatINR(o.subtotal)}`,
    `Delivery: ${o.deliveryFee ? formatINR(o.deliveryFee) : "Free"}`,
    `Total: ${formatINR(o.total)}`,
    "",
    `Name: ${o.name}`,
    `Phone: ${o.phone}`,
    `Address: ${o.address}`,
    `Delivery: ${formatDate(o.deliveryDate)}, ${o.timeSlot}`,
  ];
  if (o.giftMessage) lines.push(`Gift message: "${o.giftMessage}"`);
  return lines.join("\n");
}
