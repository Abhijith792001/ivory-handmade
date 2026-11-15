import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Instagram, Quote } from "lucide-react";
import { CategoryIcon } from "@/components/brand/category-icon";
import { FadeUp, Stagger, StaggerItem } from "@/components/brand/motion";
import { SectionHeading } from "@/components/brand/section-heading";
import { FlowerSprig, HeartDivider, Sprig } from "@/components/brand/botanical";
import { BrandLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { occasions, siteConfig } from "@/lib/config";
import type { Category, Product } from "@/types";

export function CategoryCircles({ categories }: { categories: Category[] }) {
  const all = [...categories, { id: "more", name: "More", slug: "", icon: "arch" } as Category];
  return (
    <section className="container py-16 sm:py-20" aria-labelledby="cat-heading">
      <h2 id="cat-heading" className="sr-only">Shop by category</h2>
      <FadeUp>
      <div className="flex snap-x gap-6 overflow-x-auto pb-2 scrollbar-none sm:justify-center sm:gap-0">
        {all.map((c, i) => (
          <StaggerItem key={c.id} className="flex shrink-0 snap-center items-stretch">
            {i > 0 && <span className="mx-4 hidden w-px bg-brown/15 sm:block lg:mx-8" aria-hidden />}
            <Link href={c.slug ? `/shop/${c.slug}` : "/shop"} className="group flex w-24 flex-col items-center gap-4 sm:w-28">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-cream text-brown shadow-[inset_0_0_0_1px_rgba(107,58,30,0.06)] transition duration-500 group-hover:-translate-y-1 group-hover:bg-beige/50 group-hover:shadow-soft sm:h-24 sm:w-24">
                <CategoryIcon name={c.icon} className="h-10 w-10 sm:h-11 sm:w-11" />
              </span>
              <span className="label text-[13px] text-brown transition group-hover:text-sage-dark">{c.name}</span>
            </Link>
          </StaggerItem>
        ))}
      </div>
      </FadeUp>
    </section>
  );
}

export function Bestsellers({ products, categories }: { products: Product[]; categories: Category[] }) {
  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
  return (
    <section className="container py-16 sm:py-20">
      <SectionHeading eyebrow="Most loved" title="Our" script="bestsellers" description="The pieces our customers come back for again and again." />
      <Stagger className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {products.slice(0, 8).map((p, i) => (
          <StaggerItem key={p.id}>
            <ProductCard product={p} category={catById[p.category_id]} priority={i < 2} />
          </StaggerItem>
        ))}
      </Stagger>
      <FadeUp className="mt-12 text-center">
        <Button asChild variant="outline">
          <Link href="/shop">
            Shop everything <ArrowRight />
          </Link>
        </Button>
      </FadeUp>
    </section>
  );
}

const occasionIcons: Record<string, string> = {
  birthday: "gift",
  anniversary: "heart",
  wedding: "flowers",
  baby: "sprig",
  festival: "bow",
  corporate: "house",
};

export function OccasionShop() {
  return (
    <section className="paper relative overflow-hidden supports-[overflow:clip]:overflow-clip py-20 sm:py-24">
      <Sprig className="pointer-events-none absolute -left-6 top-10 h-60 w-36 -rotate-12 opacity-40" />
      <div className="container relative">
        <SectionHeading eyebrow="Gift for every moment" title="Shop by" script="occasion" />
        <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {occasions.map((o) => (
            <StaggerItem key={o.slug}>
              <Link
                href={`/shop?occasion=${o.slug}`}
                className="group flex aspect-[4/5] flex-col items-center justify-center gap-4 rounded-[2rem] bg-ivory/80 text-center shadow-soft ring-1 ring-brown/5 transition duration-500 hover:-translate-y-1 hover:bg-ivory hover:shadow-lift"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-cream text-sage-dark transition group-hover:bg-sage-dark group-hover:text-ivory">
                  <CategoryIcon name={occasionIcons[o.slug]} className="h-8 w-8" />
                </span>
                <span className="font-serif text-xl">{o.label}</span>
                <span className="label text-[13px] text-muted transition group-hover:text-sage-dark">Explore →</span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

const steps = [
  { n: "01", title: "Choose or create", body: "Pick a ready piece, build your own gift box in 3D, or upload a photo to frame.", icon: "sprig" },
  { n: "02", title: "We make it by hand", body: "Every order is hand-finished, wrapped and checked in our little Kerala studio.", icon: "leaf" },
  { n: "03", title: "Delivered with love", body: "Choose a date and time slot. We'll send updates on WhatsApp until it arrives.", icon: "heart" },
];

export function HowItWorks() {
  return (
    <section className="container py-20 sm:py-24">
      <SectionHeading eyebrow="Simple & personal" title="How it" script="works" />
      <Stagger className="relative grid gap-6 md:grid-cols-3">
        <div className="absolute left-[16%] right-[16%] top-12 hidden border-t border-dashed border-brown/20 md:block" aria-hidden />
        {steps.map((s) => (
          <StaggerItem key={s.n} className="relative flex flex-col items-center text-center">
            <span className="relative grid h-24 w-24 place-items-center rounded-full bg-cream text-brown shadow-soft ring-8 ring-ivory">
              <CategoryIcon name={s.icon} className="h-10 w-10" />
              <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-sage-dark font-sans text-[13px] text-ivory">{s.n}</span>
            </span>
            <h3 className="mt-6 font-serif text-2xl">{s.title}</h3>
            <p className="mt-2 max-w-xs text-[17px] leading-[1.7] text-muted">{s.body}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function FeatureBanners() {
  return (
    <section className="container grid gap-6 py-10 lg:grid-cols-2">
      <FadeUp className="relative overflow-hidden rounded-[2rem] bg-sage-dark p-8 text-ivory shadow-lift sm:p-12">
        <FlowerSprig className="pointer-events-none absolute -bottom-8 -right-4 h-64 w-40 rotate-12 text-ivory opacity-30" />
        <p className="label text-ivory">Interactive 3D</p>
        <h3 className="mt-3 font-serif text-4xl text-ivory sm:text-5xl">
          Build your own <span className="font-script text-5xl sm:text-6xl">gift</span>
        </h3>
        <p className="mt-4 max-w-sm text-[17px] leading-[1.7] text-ivory">
          Choose a box, fill it with chocolates, candles, flowers and keepsakes, then watch us tie the ribbon. All live in 3D.
        </p>
        <Button asChild variant="soft" className="mt-8">
          <Link href="/build-a-gift">
            Start building <ArrowRight />
          </Link>
        </Button>
      </FadeUp>
      <FadeUp delay={0.1} className="relative overflow-hidden rounded-[2rem] bg-cream p-8 shadow-soft sm:p-12">
        <div className="pointer-events-none absolute -right-6 bottom-6 hidden w-44 rotate-6 rounded-sm border-[10px] border-[#C89B6D] bg-ivory p-2 shadow-frame sm:block">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image src="/images/pouch.webp" alt="" fill sizes="176px" className="object-cover" />
          </div>
        </div>
        <p className="label">Photo frames</p>
        <h3 className="mt-3 font-serif text-4xl sm:text-5xl">
          Frame your <span className="font-script text-5xl text-sage-dark sm:text-6xl">memory</span>
        </h3>
        <p className="mt-4 max-w-xs text-[17px] leading-[1.7] text-ink">
          Upload a photo, pick a size from 2×2 to A2, choose a moulding and see it on a wall before you order.
        </p>
        <Button asChild className="mt-8">
          <Link href="/custom-frame">
            Frame a photo <ArrowRight />
          </Link>
        </Button>
      </FadeUp>
    </section>
  );
}

// Square studio photos, shown in this order.
const gallery = [
  { src: "/images/studio/studio-tying-ribbon.jpg", alt: "Hands tying jute twine around a leaf-print gift box with an Ivory tag on a linen worktable" },
  { src: "/images/studio/studio-worktable-flatlay.jpg", alt: "Flat lay of the Ivory worktable with jute twine, sage ribbon, scissors, blank round tags, handmade paper and eucalyptus" },
  { src: "/images/studio/studio-packing-hamper.jpg", alt: "Hands packing a wicker hamper with a bubble candle, a wrapped gift, dried baby's breath and an Ivory tag" },
  { src: "/images/studio/studio-framing-photo.jpg", alt: "Hands placing a couple's photo into a light wood frame tied with jute twine and an Ivory tag" },
  { src: "/images/studio/studio-wrapping-bouquet.jpg", alt: "Hands wrapping a bouquet of cream roses and baby's breath in ivory paper, with sage ribbon nearby" },
  { src: "/images/studio/studio-writing-note.jpg", alt: "Hand writing a note card with a fountain pen beside a wax-sealed envelope and an Ivory tag" },
];

export function InstagramGallery() {
  return (
    <section className="container py-20 sm:py-24">
      <SectionHeading eyebrow="@ivory.handmade" title="From our" script="studio" description="Little moments from our worktable. Tag us to be featured." />
      <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {gallery.map((g, i) => (
          <StaggerItem key={g.src} className={i === 0 ? "col-span-2 row-span-2 sm:col-span-1 sm:row-span-1" : ""}>
            {/* 1:1 box + `fill` image: space is reserved up front (no layout shift). */}
            <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden rounded-3xl bg-cream shadow-soft">
              <span className="sr-only">Ivory on Instagram: </span>
              <Image
                src={g.src}
                alt={g.alt}
                fill
                sizes={i === 0 ? "(max-width:640px) 100vw, (max-width:1024px) 33vw, 16vw" : "(max-width:640px) 50vw, (max-width:1024px) 33vw, 16vw"}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <span className="absolute inset-0 grid place-items-center bg-brown/0 text-ivory opacity-0 transition duration-500 group-hover:bg-brown/25 group-hover:opacity-100 group-focus-visible:bg-brown/25 group-focus-visible:opacity-100" aria-hidden>
                <Instagram className="h-6 w-6" />
              </span>
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// Sample testimonials. Replace with real customer reviews before launch.
const testimonials = [
  { quote: "The A4 frame of my parents' wedding photo looked even better than the preview. My mother cried happy tears.", name: "Anjali", place: "Kochi" },
  { quote: "I built a gift box for my sister's birthday on my phone in five minutes. The note card was written exactly as I typed it.", name: "Rahul", place: "Thrissur" },
  { quote: "Beautiful wrapping, on-time delivery and such a sweet WhatsApp update. Ordering again for Onam.", name: "Fathima", place: "Kozhikode" },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden supports-[overflow:clip]:overflow-clip bg-sage-dark py-20 text-ivory sm:py-24">
      <Sprig className="pointer-events-none absolute -right-4 top-6 h-64 w-40 rotate-12 text-ivory opacity-20" />
      <div className="container relative">
        <FadeUp className="mb-12 text-center">
          <p className="label text-ivory">Kind words</p>
          <h2 className="heading-lg mt-3 text-ivory">
            Thank <span className="font-script text-[1.3em]">you</span>
          </h2>
          <HeartDivider light className="mt-4" />
        </FadeUp>
        <Stagger className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="h-full rounded-[2rem] bg-[#4E5C3A] p-8 ring-1 ring-ivory/15">
                <Quote className="h-6 w-6 text-beige" />
                <blockquote className="mt-4 font-serif text-xl leading-[1.7]">{t.quote}</blockquote>
                <figcaption className="mt-6 label text-ivory">
                  {t.name} · {t.place}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function BrandStrip() {
  return (
    <section className="container py-20 text-center">
      <FadeUp>
        <BrandLogo className="mx-auto h-auto w-48 sm:w-56" sizes="224px" />
        <p className="label mt-4">A little creation · a brighter tomorrow</p>
        <HeartDivider className="mt-4" />
      </FadeUp>
    </section>
  );
}
