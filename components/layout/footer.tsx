"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { FlowerSprig, HeartDivider } from "@/components/brand/botanical";
import { siteConfig } from "@/lib/config";
import { waLink } from "@/lib/whatsapp";

const cols = [
  {
    title: "Shop",
    links: [
      ["/shop/frames", "Frames"],
      ["/shop/gifts", "Gifts"],
      ["/shop/hampers", "Hampers"],
      ["/shop/bouquets", "Bouquets"],
      ["/shop/crafts", "Crafts"],
    ],
  },
  {
    title: "Create",
    links: [
      ["/build-a-gift", "Build your own gift"],
      ["/custom-frame", "Custom photo frame"],
      ["/track", "Track your order"],
    ],
  },
  {
    title: "Ivory",
    links: [
      ["/about", "Our story"],
      ["/faq", "FAQ"],
      ["/contact", "Contact"],
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="paper relative mt-24 overflow-hidden border-t border-brown/10">
      <FlowerSprig className="pointer-events-none absolute -right-6 -top-6 h-64 w-40 rotate-12 opacity-30" />
      <div className="container grid gap-12 py-16 md:grid-cols-[1.3fr_2fr]">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <BrandLogo className="h-auto w-44" sizes="176px" />
          <p className="mt-6 max-w-xs font-script text-3xl leading-tight text-ink">Natural · Handmade · Thoughtful · Timeless</p>
          <div className="mt-6 flex gap-3">
            <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full bg-ivory text-brown transition hover:bg-beige/60">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={waLink("Hi Ivory! ♡")} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full bg-ivory text-brown transition hover:bg-beige/60">
              <MessageCircle className="h-4 w-4" />
            </a>
            <a href={`mailto:${siteConfig.email}`} aria-label="Email" className="grid h-10 w-10 place-items-center rounded-full bg-ivory text-brown transition hover:bg-beige/60">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="label mb-4 text-brown">{c.title}</p>
              <ul className="space-y-3">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-[17px] text-ink transition hover:text-brown">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-brown/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-[13px] text-muted sm:flex-row">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Made by hand in {siteConfig.location}
          </p>
          <HeartDivider className="hidden sm:flex" />
          <p>© {new Date().getFullYear()} Ivory Handmade</p>
        </div>
      </div>
    </footer>
  );
}
