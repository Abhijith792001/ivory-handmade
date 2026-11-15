import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeUp } from "@/components/brand/motion";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Delivery, custom frames, photo quality, payments and returns at Ivory Handmade.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "How long does a handmade order take?",
    a: `Most orders are ready in ${siteConfig.leadDays}–4 days. Large frames (A3, A2) and hampers can take a little longer. Choose your delivery date at checkout and we'll plan around it.`,
  },
  {
    q: "Where do you deliver?",
    a: `We deliver across Kerala and ship India-wide. Delivery is free in ${siteConfig.freeDeliveryCity || "our home city"} and free everywhere on orders over ₹${siteConfig.freeDeliveryMin}.`,
  },
  {
    q: "Which photo should I upload for a custom frame?",
    a: "The original photo from your phone or camera. WhatsApp compresses photos, so forwarded images can look soft at bigger sizes. Our frame builder checks the print quality and warns you if a size is too large for your photo.",
  },
  {
    q: "Can I see the frame before you make it?",
    a: "Yes. The builder shows a live preview, a to-scale wall view and a side-by-side size comparison. We also send a final proof on WhatsApp for engraved or large frames.",
  },
  {
    q: "How does Build Your Own Gift work?",
    a: "Choose a box size, add items until it's full, pick your box, ribbon and paper-shred colours, and write a note. We save a picture of your exact box with the order so our makers recreate it precisely.",
  },
  {
    q: "How can I pay?",
    a: "Pay online with UPI, cards or netbanking through Razorpay, or place your order on WhatsApp and pay by UPI after we confirm it.",
  },
  {
    q: "Can I return or exchange?",
    a: "Personalised pieces can't be returned, but if anything arrives damaged, send us a photo on WhatsApp within 24 hours and we'll remake it.",
  },
  {
    q: "Do you take bulk and corporate orders?",
    a: "Yes, with your logo on the cards and custom packaging. Message us on WhatsApp with quantities and your date.",
  },
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <PageHeader eyebrow="Help" title="Questions," script="answered" />
      <div className="container max-w-3xl py-16">
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <FadeUp key={f.q} delay={i * 0.04}>
              <details className="group card-soft p-0 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-serif text-xl">
                  {f.q}
                  <Plus className="h-5 w-5 shrink-0 text-sage-dark transition duration-300 group-open:rotate-45" />
                </summary>
                <p className="px-6 pb-6 text-[17px] leading-[1.7] text-ink">{f.a}</p>
              </details>
            </FadeUp>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
