"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/logo";
import { FlowerSprig, Sprig } from "@/components/brand/botanical";

const ease = [0.22, 1, 0.36, 1] as const;

// Explicit grid placement (5 columns × 6 rows) so each photo always lands in its spot.
const heroImages = [
  {
    src: "/images/hero-gift-box.jpg",
    alt: "Ivory handmade gift box tied with jute twine",
    cell: "col-start-1 col-span-3 row-start-1 row-span-4",
    sizes: "(max-width: 1024px) 58vw, 30vw",
    priority: true,
  },
  {
    src: "/images/hero-photo-frame.jpg",
    alt: "Handmade wooden photo frame by Ivory",
    cell: "col-start-4 col-span-2 row-start-1 row-span-3",
    sizes: "(max-width: 1024px) 38vw, 20vw",
  },
  {
    src: "/images/hero-hamper.jpg",
    alt: "Ivory gift hamper with candle, chocolates and earrings",
    cell: "col-start-1 col-span-3 row-start-5 row-span-2",
    sizes: "(max-width: 1024px) 58vw, 30vw",
  },
  {
    src: "/images/hero-bouquet.jpg",
    alt: "Ivory flower bouquet wrapped in ivory paper",
    cell: "col-start-4 col-span-2 row-start-4 row-span-3",
    sizes: "(max-width: 1024px) 38vw, 20vw",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Image src="/images/hero-bg.webp" alt="" fill priority className="object-cover opacity-60" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-ivory/40 via-ivory/50 to-ivory" />

      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.6, delay: 0.3, ease }} className="pointer-events-none absolute -left-8 bottom-0 hidden md:block">
        <Sprig className="h-80 w-48 -rotate-12 opacity-50" />
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.6, delay: 0.5, ease }} className="pointer-events-none absolute -right-6 top-6 hidden md:block">
        <FlowerSprig className="h-72 w-44 rotate-[20deg] opacity-40" />
      </motion.div>

      <div className="container relative grid items-center gap-12 pb-20 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-20">
        <div className="flex flex-col items-center text-center">
          {/* Width-based sizing + intrinsic dimensions reserve the space up front: no layout shift. */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease }} className="w-[240px] sm:w-[320px] lg:w-[380px] xl:w-[420px]">
            <BrandLogo priority className="h-auto w-full" sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 420px" />
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.25, ease }} className="mt-8 max-w-md text-balance text-[18px] leading-[1.7] text-ink">
            Photo frames, gift boxes, hampers and bouquets, each one made by hand in Kerala for the people you love.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4, ease }} className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <Link href="/build-a-gift">
                Build your gift <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-ivory/70">
              <Link href="/custom-frame">Frame your memory</Link>
            </Button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.7 }} className="mt-8 font-script text-[28px] leading-snug text-brown sm:text-[32px]">
            Natural · Handmade · Thoughtful · Timeless
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, delay: 0.2, ease }} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4" style={{ aspectRatio: "1 / 1.05" }}>
            {heroImages.map((img) => (
              <div key={img.src} className={`relative overflow-hidden rounded-[2rem] bg-cream ${img.priority ? "shadow-lift" : "shadow-soft"} ${img.cell}`}>
                <Image src={img.src} alt={img.alt} fill priority={img.priority} sizes={img.sizes} className="object-cover" />
              </div>
            ))}
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-ivory px-5 py-2.5 shadow-soft ring-1 ring-brown/10 sm:left-6 sm:translate-x-0">
            <p className="whitespace-nowrap font-sans text-[13px] font-medium uppercase tracking-[0.18em] text-ink">♡ Made to order in Kerala</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
