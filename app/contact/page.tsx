import type { Metadata } from "next";
import { Clock, Instagram, Mail, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeUp } from "@/components/brand/motion";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/layout/whatsapp-float";
import { ContactForm } from "@/components/cart/contact-form";
import { siteConfig } from "@/lib/config";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Ivory on WhatsApp, Instagram or email for custom gifts, bulk and corporate orders.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const display = siteConfig.whatsappNumber.replace(/^91/, "+91 ");
  return (
    <>
      <PageHeader eyebrow="Say hello" title="We'd love to" script="hear from you" description="Custom requests, bulk and corporate orders, or a question about a gift. We usually reply within a few hours." />
      <div className="container grid gap-10 py-16 lg:grid-cols-[1fr_1.2fr]">
        <FadeUp className="space-y-4">
          <a href={waLink("Hi Ivory! ♡")} target="_blank" rel="noopener noreferrer" className="card-soft hover-lift flex items-center gap-5 p-6">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-sage-dark text-ivory">
              <WhatsAppIcon className="h-6 w-6" />
            </span>
            <span>
              <span className="label block">WhatsApp (fastest)</span>
              <span className="font-serif text-2xl">{display}</span>
            </span>
          </a>
          <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" className="card-soft hover-lift flex items-center gap-5 p-6">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-cream text-brown">
              <Instagram className="h-6 w-6" />
            </span>
            <span>
              <span className="label block">Instagram</span>
              <span className="font-serif text-2xl">@{siteConfig.instagram.split("/").filter(Boolean).pop()}</span>
            </span>
          </a>
          <a href={`mailto:${siteConfig.email}`} className="card-soft hover-lift flex items-center gap-5 p-6">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-cream text-brown">
              <Mail className="h-6 w-6" />
            </span>
            <span>
              <span className="label block">Email</span>
              <span className="font-serif text-2xl">{siteConfig.email}</span>
            </span>
          </a>
          <div className="flex gap-6 px-2 pt-4 text-[16px] text-ink">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sage-dark" /> {siteConfig.location}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sage-dark" /> Mon–Sat, 10am–7pm
            </p>
          </div>
        </FadeUp>
        <FadeUp delay={0.1} className="card-soft p-6 sm:p-10">
          <h2 className="font-serif text-3xl">Send a message</h2>
          <p className="mt-2 text-[16px] text-muted">This opens WhatsApp with your message ready to send.</p>
          <ContactForm />
          <Button asChild variant="link" className="mt-4 px-0">
            <a href="/faq">Read our FAQ first →</a>
          </Button>
        </FadeUp>
      </div>
    </>
  );
}
