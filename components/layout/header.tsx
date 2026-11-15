"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navLinks } from "@/lib/config";
import { cartCount, useCart } from "@/store/cart";
import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { HeartDivider, Sprig } from "@/components/brand/botanical";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setMenuOpen(false), [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className={cn("sticky top-0 z-40 transition-[background-color,box-shadow] duration-500", scrolled ? "bg-ivory/95 shadow-[0_1px_0_rgba(107,58,30,0.1)] backdrop-blur-md" : "bg-ivory/80 backdrop-blur-sm")}>
      <div className="container flex h-16 items-center justify-between sm:h-20">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger className="-ml-2 rounded-full p-2 text-brown lg:hidden" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" title="Menu">
            <nav className="flex flex-col gap-1 px-6 py-6" aria-label="Mobile">
              {[{ href: "/", label: "Home" }, ...navLinks, { href: "/faq", label: "FAQ" }, { href: "/contact", label: "Contact" }].map((l) => (
                <Link key={l.href} href={l.href} className={cn("rounded-xl px-3 py-3 font-serif text-2xl text-brown transition hover:bg-ivory", pathname === l.href && "text-sage-dark")}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto px-6 pb-10 text-center">
              <Sprig className="mx-auto h-24 w-14 opacity-60" />
              <p className="mt-2 font-script text-3xl text-brown">Handmade with love</p>
              <HeartDivider className="mt-3" />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" aria-label="Ivory home" className="flex shrink-0 items-center">
          <BrandLogo priority className="h-10 w-auto sm:h-12" sizes="(max-width: 640px) 54px, 65px" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-9" aria-label="Main">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative font-sans text-[13px] font-medium uppercase tracking-[0.18em] text-[#5A3019] transition hover:text-brown after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-sage-dark after:transition-all after:duration-500 hover:after:w-full",
                pathname.startsWith(l.href) && "text-brown after:w-full"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button onClick={openCart} className="relative -mr-2 rounded-full p-2 text-brown transition hover:bg-cream" aria-label={`Open bag, ${count} items`}>
          <ShoppingBag className="h-6 w-6" strokeWidth={1.6} />
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-sage-dark px-1 text-[13px] font-medium leading-none text-ivory">{count}</span>
          )}
        </button>
      </div>
    </header>
  );
}
