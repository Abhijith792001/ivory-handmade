import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const cat = (await getCategories()).find((c) => c.slug === params.category);
  if (!cat) return {};
  return {
    title: `Handmade ${cat.name}`,
    description: cat.description || `Shop handmade ${cat.name.toLowerCase()} from Ivory, Kerala.`,
    alternates: { canonical: `/shop/${cat.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: { category: string }; searchParams: { occasion?: string; sort?: string } }) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const cat = categories.find((c) => c.slug === params.category);
  if (!cat) notFound();
  return (
    <>
      <PageHeader eyebrow="Shop" title={cat.name} description={cat.description || undefined} />
      <div className="container py-12 sm:py-16">
        <ShopBrowser products={products} categories={categories} activeCategory={cat} initialOccasion={searchParams.occasion} initialSort={searchParams.sort} />
      </div>
    </>
  );
}
