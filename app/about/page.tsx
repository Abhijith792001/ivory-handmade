import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { FadeUp } from "@/components/brand/motion";
import { HeartDivider, Sprig } from "@/components/brand/botanical";
import { CategoryIcon } from "@/components/brand/category-icon";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our story",
  description: "Ivory is a small handmade gifting studio in Kerala making photo frames, gift boxes, hampers and bouquets by hand.",
  alternates: { canonical: "/about" },
};

const values = [
  { icon: "leaf", title: "Natural", body: "Kraft board, linen, jute, dried flowers and soy wax. Materials that feel good to hold." },
  { icon: "sprig", title: "Handmade", body: "Every frame is assembled, every box wrapped and every note written by hand." },
  { icon: "heart", title: "Thoughtful", body: "We help you choose, personalise and time each gift so it lands just right." },
  { icon: "flowers", title: "Timeless", body: "Pieces made to be kept on a shelf or a wall for years, not thrown away." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="Our story" title="A little creation," script="a brighter tomorrow" />
      <section className="container grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <FadeUp className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift">
            <Image src="/images/pouch.webp" alt="Ivory linen pouch on a woven basket" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-8 -right-4 hidden w-48 overflow-hidden rounded-3xl shadow-soft ring-8 ring-ivory sm:block">
            <div className="relative aspect-square">
              <Image src="/images/thankyou.webp" alt="" fill sizes="192px" className="object-cover" />
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="label">Made in Kerala</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            Gifts that feel <span className="font-script text-5xl text-sage-dark sm:text-6xl">personal</span>
          </h2>
          <HeartDivider className="my-6 justify-start" />
          <div className="space-y-5 text-[17px] leading-[1.7] text-ink">
            <p>
              Ivory began at a kitchen table with one photo frame for a friend&apos;s wedding. Today we&apos;re a small studio making frames, gift boxes, hampers and
              dried-flower bouquets for people all over Kerala.
            </p>
            <p>
              We believe the best gifts carry a little bit of the giver. That&apos;s why you can build your own box piece by piece, frame the photo that means the most,
              and add a note we&apos;ll write out by hand.
            </p>
            <p className="font-script text-3xl text-brown">Thank you for supporting our small business ♡</p>
          </div>
          <div className="mt-8 flex gap-3">
            <Button asChild>
              <Link href="/build-a-gift">Build a gift</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Say hello</Link>
            </Button>
          </div>
        </FadeUp>
      </section>
      <section className="paper relative overflow-hidden supports-[overflow:clip]:overflow-clip py-20">
        <Sprig className="pointer-events-none absolute -right-4 top-6 h-56 w-32 rotate-12 opacity-40" />
        <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <FadeUp key={v.title} delay={i * 0.08} className="rounded-[2rem] bg-ivory/80 p-8 text-center shadow-soft">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cream text-sage-dark">
                <CategoryIcon name={v.icon} className="h-8 w-8" />
              </span>
              <h3 className="mt-5 font-script text-4xl">{v.title}</h3>
              <p className="mt-3 text-[16px] leading-[1.7] text-ink">{v.body}</p>
            </FadeUp>
          ))}
        </div>
      </section>
    </>
  );
}
