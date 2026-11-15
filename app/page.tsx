import { Hero } from "@/components/home/hero";
import {
  Bestsellers,
  BrandStrip,
  CategoryCircles,
  FeatureBanners,
  HowItWorks,
  InstagramGallery,
  OccasionShop,
  Testimonials,
} from "@/components/home/sections";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 300;

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const best = [...products.filter((p) => p.is_bestseller), ...products.filter((p) => !p.is_bestseller)];
  return (
    <>
      <Hero />
      <CategoryCircles categories={categories} />
      <Bestsellers products={best} categories={categories} />
      <FeatureBanners />
      <OccasionShop />
      <HowItWorks />
      <Testimonials />
      <InstagramGallery />
      <BrandStrip />
    </>
  );
}
