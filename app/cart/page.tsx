"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartLine } from "@/components/cart/cart-line";
import { PageHeader } from "@/components/layout/page-header";
import { IvoryLoader } from "@/components/brand/loader";
import { cartSubtotal, useCart } from "@/store/cart";
import { useHydrated } from "@/lib/hooks";
import { formatINR } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const subtotal = cartSubtotal(items);

  return (
    <>
      <PageHeader title="Your" script="bag" />
      <div className="container max-w-5xl py-12">
        {!hydrated ? (
          <IvoryLoader className="py-20" compact />
        ) : items.length === 0 ? (
          <div className="card-soft py-20 text-center">
            <p className="font-script text-5xl">Your bag is empty</p>
            <p className="mt-3 text-muted">Find something lovely, or make it yourself.</p>
            <div className="mt-8 flex justify-center gap-3">
              <Button asChild>
                <Link href="/shop">Shop</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/build-a-gift">Build a gift</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div className="card-soft divide-y divide-brown/10 px-6">
              {items.map((i) => (
                <CartLine key={i.key} item={i} />
              ))}
            </div>
            <aside className="card-soft h-fit p-6 lg:sticky lg:top-28">
              <h2 className="font-serif text-2xl">Summary</h2>
              <div className="mt-4 flex justify-between text-[17px]">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <p className="mt-2 text-[13px] text-muted">
                {siteConfig.freeDeliveryCity ? `Free delivery in ${siteConfig.freeDeliveryCity}, ` : ""}and free everywhere on orders over {formatINR(siteConfig.freeDeliveryMin)}. Otherwise {formatINR(siteConfig.deliveryFee)}.
              </p>
              <Button asChild size="lg" className="mt-6 w-full">
                <Link href="/checkout">
                  Checkout <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="mt-2 w-full">
                <Link href="/shop">Continue shopping</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
