"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Product photos. images[0] is the same main photo used on the product card. */
export function ProductGallery({ images, name, mainAlt }: { images: string[]; name: string; mainAlt?: string | null }) {
  const [active, setActive] = useState(0);
  const altFor = (i: number) => (i === 0 && mainAlt ? mainAlt : `${name}, photo ${i + 1} of ${images.length}`);
  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-cream shadow-soft">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} className="absolute inset-0">
            <Image src={images[active]} alt={altFor(active)} fill priority={active === 0} sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="flex gap-3" role="tablist" aria-label="Product photos">
          {images.map((src, i) => (
            <button
              key={src + i}
              role="tab"
              aria-selected={i === active}
              aria-label={`Show photo ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn("relative h-20 w-16 overflow-hidden rounded-2xl ring-2 transition", i === active ? "ring-sage-dark" : "ring-transparent opacity-70 hover:opacity-100")}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
