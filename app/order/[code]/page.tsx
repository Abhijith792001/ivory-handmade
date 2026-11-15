"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FlowerSprig, HeartDivider } from "@/components/brand/botanical";
import { WhatsAppIcon } from "@/components/layout/whatsapp-float";
import type { LastOrder } from "@/components/cart/checkout-form";
import { waLink } from "@/lib/whatsapp";
import { formatDate, formatINR } from "@/lib/utils";

export default function OrderConfirmation({ params }: { params: { code: string } }) {
  const [order, setOrder] = useState<LastOrder | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ivory-last-order");
      const o = raw ? (JSON.parse(raw) as LastOrder) : null;
      if (o?.code === params.code) setOrder(o);
    } catch {}
  }, [params.code]);

  const needsWhatsApp = order?.method === "whatsapp";

  return (
    <div className="container relative max-w-2xl overflow-hidden py-20 text-center">
      <FlowerSprig className="pointer-events-none absolute -right-10 top-4 h-64 w-40 rotate-12 opacity-30" />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
        <p className="font-script text-6xl text-brown sm:text-7xl">Thank you</p>
        <p className="label mt-4">{needsWhatsApp ? "One last step" : "Your order is placed"}</p>
        <HeartDivider className="mt-4" />
        <p className="mt-8 font-serif text-2xl">
          Order <span className="text-sage-dark">#{params.code}</span>
        </p>
        {order && (
          <p className="mt-3 text-ink">
            {formatINR(order.total)} · delivery on {formatDate(order.deliveryDate)}, {order.timeSlot}
          </p>
        )}

        {needsWhatsApp ? (
          <div className="card-soft mx-auto mt-10 max-w-md p-8">
            <p className="text-[17px] leading-[1.7] text-ink">
              Tap below to send your order summary to us on WhatsApp. We&apos;ll confirm it and share UPI details for payment.
              {" "}If you ordered a custom frame, please attach your photo in the chat too.
            </p>
            <Button asChild size="lg" className="mt-6 w-full">
              <a href={waLink(order!.waMessage)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="h-5 w-5" /> Send order on WhatsApp
              </a>
            </Button>
          </div>
        ) : (
          <p className="mx-auto mt-8 max-w-md text-[17px] leading-[1.7] text-ink">
            {order?.paid ? "Payment received. " : ""}We&apos;ve started on your order and will send updates on WhatsApp. Keep your order ID handy to track it anytime.
          </p>
        )}

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <Link href={`/track?code=${params.code}`}>Track your order</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
