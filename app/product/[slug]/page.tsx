import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gift, Leaf, Truck } from "lucide-react";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductPurchase } from "@/components/shop/product-purchase";
import { ProductCard } from "@/components/shop/product-card";
import { HeartDivider } from "@/components/brand/botanical";
import { FadeUp } from "@/components/brand/motion";
import { getCategories, getProduct, getProducts } from "@/lib/data";
import { siteConfig } from "@/lib/config";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.description.slice(0, 160),
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title: p.name, description: p.description.slice(0, 160), images: p.images[0] ? [{ url: p.images[0], alt: p.image_alt || p.name }] : undefined },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, categories, all] = await Promise.all([getProduct(params.slug), getCategories(), getProducts()]);
  if (!product) notFound();
  const category = categories.find((c) => c.id === product.category_id);
  const related = all.filter((p) => p.category_id === product.category_id && p.id !== product.id).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => (i.startsWith("http") ? i : `${siteConfig.url}${i}`)),
    sku: product.id,
    brand: { "@type": "Brand", name: "Ivory Handmade" },
    category: category?.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/product/${product.slug}`,
    },
  };

  return (
    <div className="container py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-[13px] text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-brown">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/shop" className="hover:text-brown">Shop</Link></li>
          {category && (
            <>
              <li aria-hidden>/</li>
              <li><Link href={`/shop/${category.slug}`} className="hover:text-brown">{category.name}</Link></li>
            </>
          )}
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-brown">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <FadeUp>
          <ProductGallery images={product.images} name={product.name} mainAlt={product.image_alt} />
        </FadeUp>
        <FadeUp delay={0.1} className="lg:pt-4">
          {category && <p className="label">{category.name}</p>}
          <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">{product.name}</h1>
          <HeartDivider className="my-5 justify-start" />
          <p className="mb-8 text-[17px] leading-[1.7] text-ink">{product.description}</p>
          <ProductPurchase product={product} />
          <ul className="mt-10 grid gap-4 border-t border-brown/10 pt-8 text-[16px] text-ink sm:grid-cols-3">
            <li className="flex items-center gap-3"><Leaf className="h-5 w-5 text-sage-dark" /> Handmade to order</li>
            <li className="flex items-center gap-3"><Gift className="h-5 w-5 text-sage-dark" /> Gift wrapped free</li>
            <li className="flex items-center gap-3"><Truck className="h-5 w-5 text-sage-dark" /> {siteConfig.freeDeliveryCity ? `Free delivery in ${siteConfig.freeDeliveryCity}` : "Delivered with care"}</li>
          </ul>
        </FadeUp>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-center font-serif text-3xl">
            You may also <span className="font-script text-4xl text-sage-dark">love</span>
          </h2>
          <HeartDivider className="mb-10 mt-3" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} category={category} />
            ))}
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
