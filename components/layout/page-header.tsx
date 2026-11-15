import { HeartDivider, Sprig } from "@/components/brand/botanical";
import { FadeUp } from "@/components/brand/motion";

export function PageHeader({ eyebrow, title, script, description }: { eyebrow?: string; title: string; script?: string; description?: string }) {
  return (
    <section className="relative overflow-hidden supports-[overflow:clip]:overflow-clip border-b border-brown/5 bg-gradient-to-b from-cream/70 to-ivory">
      <Sprig className="pointer-events-none absolute -left-4 -top-6 h-48 w-28 -rotate-[30deg] opacity-40" />
      <Sprig className="pointer-events-none absolute -bottom-10 -right-2 h-48 w-28 rotate-[24deg] opacity-30" />
      <FadeUp className="container relative py-14 text-center sm:py-20">
        {eyebrow && <p className="label mb-3">{eyebrow}</p>}
        <h1 className="heading-xl text-balance">
          {title} {script && <span className="font-script text-[1.2em] font-normal text-sage-dark">{script}</span>}
        </h1>
        <HeartDivider className="mt-5" />
        {description && <p className="mx-auto mt-5 max-w-xl text-[17px] leading-[1.7] text-ink">{description}</p>}
      </FadeUp>
    </section>
  );
}
