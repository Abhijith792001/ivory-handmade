"use client";
import Link from "next/link";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sprig } from "@/components/brand/botanical";
import { CartLine } from "./cart-line";
import { cartSubtotal, useCart } from "@/store/cart";
import { useHydrated } from "@/lib/hooks";
import { formatINR } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

export function CartDrawer() {
  const { items, isOpen, close } = useCart();
  const hydrated = useHydrated();
  if (!hydrated) return null;
  const subtotal = cartSubtotal(items);
  const toFree = siteConfig.freeDeliveryMin - subtotal;

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent title="Your bag">
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <Sprig className="h-32 w-20 opacity-60" />
            <p className="mt-4 font-script text-4xl text-ink">Your bag is empty</p>
            <p className="mt-2 text-[17px] text-muted">Something handmade is waiting for you.</p>
            <div className="mt-8 flex flex-col gap-3">
              <Button asChild onClick={close}>
                <Link href="/shop">Browse the shop</Link>
              </Button>
              <Button asChild variant="outline" onClick={close}>
                <Link href="/build-a-gift">Build a gift</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {toFree > 0 && (
              <div className="mx-6 mt-4 rounded-2xl bg-ivory/80 px-4 py-3 text-center text-[13px] text-ink">
                Add {formatINR(toFree)} more for free delivery anywhere
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-beige/50">
                  <div className="h-full rounded-full bg-sage-dark transition-all duration-700" style={{ width: `${Math.min(100, (subtotal / siteConfig.freeDeliveryMin) * 100)}%` }} />
                </div>
              </div>
            )}
            <div className="flex-1 divide-y divide-brown/10 overflow-y-auto px-6">
              {items.map((i) => (
                <CartLine key={i.key} item={i} compact />
              ))}
            </div>
            <div className="border-t border-brown/10 px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="label">Subtotal</span>
                <span className="font-serif text-2xl">{formatINR(subtotal)}</span>
              </div>
              <p className="mt-1 text-[13px] text-muted">Delivery and gift message are added at checkout.</p>
              <div className="mt-4 grid gap-2">
                <Button asChild size="lg" onClick={close}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <Button asChild variant="ghost" onClick={close}>
                  <Link href="/cart">View bag</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
