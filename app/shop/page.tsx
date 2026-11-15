import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Shop handmade gifts",
  description: "Shop handmade photo frames, gifts, hampers, bouquets and crafts from Ivory, Kerala.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: { occasion?: string; sort?: string } }) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <PageHeader eyebrow="The collection" title="Shop" script="handmade" description="Frames, gifts, hampers, bouquets and crafts. Every piece is made to order in our Kerala studio." />
      <div className="container py-12 sm:py-16">
        <ShopBrowser products={products} categories={categories} initialOccasion={searchParams.occasion} initialSort={searchParams.sort} />
      </div>
    </>
  );
}
