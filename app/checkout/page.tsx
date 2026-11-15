import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <>
      <PageHeader title="Checkout" description="Almost there. Tell us where and when to deliver your handmade gift." />
      <CheckoutForm />
    </>
  );
}
