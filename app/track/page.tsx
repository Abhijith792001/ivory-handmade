import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { TrackForm } from "@/components/cart/track-form";

export const metadata: Metadata = { title: "Track your order", description: "Track your Ivory order with your order ID and phone number." };

export default function TrackPage() {
  return (
    <>
      <PageHeader eyebrow="Order tracking" title="Where is my" script="gift?" description="Enter your order ID and the phone number you used at checkout." />
      <TrackForm />
    </>
  );
}
