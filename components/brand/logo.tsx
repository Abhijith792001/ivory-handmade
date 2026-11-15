import Image from "next/image";
import { cn } from "@/lib/utils";

// The brand logo artwork. ivory-logo-web.png is generated from
// public/images/ivory-logo.png by scripts/prepare-logo.mjs (trimmed + transparent).
export const LOGO_SRC = "/images/ivory-logo-web.png";
export const LOGO_WIDTH = 1036;
export const LOGO_HEIGHT = 772;
export const LOGO_ALT = "Ivory – Handmade with love";

/**
 * Size it with a height (e.g. "h-11 w-auto") or a width (e.g. "w-64 h-auto").
 * Intrinsic width/height are always passed, so the browser reserves the right
 * space before the image loads (no layout shift).
 */
export function BrandLogo({
  className,
  priority = false,
  sizes = "200px",
  alt = LOGO_ALT,
}: {
  className?: string;
  priority?: boolean;
  sizes?: string;
  alt?: string;
}) {
  return <Image src={LOGO_SRC} alt={alt} width={LOGO_WIDTH} height={LOGO_HEIGHT} priority={priority} sizes={sizes} className={cn("select-none", className)} draggable={false} />;
}
