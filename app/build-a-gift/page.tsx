import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { GiftBuilder } from "@/components/gift/gift-builder";
import { getBuilderConfig } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Build your own gift box",
  description: "Design a handmade gift box in 3D. Choose a box, fill it with chocolates, candles, flowers and keepsakes, add a handwritten note and we'll wrap it by hand.",
  alternates: { canonical: "/build-a-gift" },
};

export default async function BuildAGiftPage() {
  const { boxes, items, extras } = await getBuilderConfig();
  return (
    <>
      <PageHeader eyebrow="Build your own" title="Build your" script="gift" description="Choose a box, fill it with little things they'll love, and watch us tie the ribbon." />
      <div className="pt-8">
        <GiftBuilder boxes={boxes} items={items} noteCardPrice={extras.note_card_price} />
      </div>
    </>
  );
}
