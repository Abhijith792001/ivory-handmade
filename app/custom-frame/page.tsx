import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { FrameBuilder } from "@/components/frame/frame-builder";
import { getFrameConfig } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Custom photo frame",
  description: "Upload a photo, choose a size from 2×2 to A2, crop it, pick a frame and see it on your wall. Handmade custom photo frames from Kerala.",
  alternates: { canonical: "/custom-frame" },
};

export default async function CustomFramePage() {
  const { sizes, styles, extras } = await getFrameConfig();
  return (
    <>
      <PageHeader eyebrow="Custom photo frame" title="Frame your" script="memory" description="Upload a photo, choose a size and frame, and see it on your wall before we make it by hand." />
      <div className="pt-10">
        <FrameBuilder sizes={sizes} styles={styles} extras={extras} />
      </div>
    </>
  );
}
