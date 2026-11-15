import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import type { Category, Product } from "@/types";

export function ProductCard({ product, category, priority = false }: { product: Product; category?: Category; priority?: boolean }) {
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  return (
    <Link href={`/product/${product.slug}`} className="group block rounded-3xl focus-visible:outline-offset-4">
      {/* Fixed 4:5 box + `fill` image: space is reserved before the photo loads (no layout shift). */}
      <div className="hover-lift relative aspect-[4/5] overflow-hidden rounded-3xl bg-cream shadow-soft">
        <Image
          src={product.images[0]}
          alt={product.image_alt || product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.is_bestseller && <Badge>Bestseller</Badge>}
          {onSale && <Badge className="bg-sage-dark text-ivory">Sale</Badge>}
        </div>
        {product.stock <= 0 && (
          <div className="absolute inset-0 grid place-items-center bg-ivory/60">
            <Badge>Sold out</Badge>
          </div>
        )}
      </div>
      <div className="px-1 pt-4">
        {category && <p className="label text-muted">{category.name}</p>}
        <h3 className="mt-1 font-serif text-lg leading-snug sm:text-xl">{product.name}</h3>
        <p className="mt-1 flex items-baseline gap-2 text-[17px]">
          <span>{formatINR(product.price)}</span>
          {onSale && (
            <span className="text-[15px] text-muted line-through">
              <span className="sr-only">Was </span>
              {formatINR(product.compare_at_price!)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
