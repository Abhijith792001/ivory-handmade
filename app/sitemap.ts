import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { siteConfig } from "@/lib/config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();
  const fixed = ["", "/shop", "/build-a-gift", "/custom-frame", "/about", "/contact", "/faq", "/track"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...fixed,
    ...categories.map((c) => ({ url: `${base}/shop/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.created_at ? new Date(p.created_at) : now, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
