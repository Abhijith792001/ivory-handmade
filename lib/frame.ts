import type { FrameSize } from "@/types";

export type Orientation = "portrait" | "landscape";

/** Physical print dimensions for a size in the chosen orientation. */
export function printDims(size: FrameSize, orientation: Orientation) {
  const short = Math.min(size.width_in, size.height_in);
  const long = Math.max(size.width_in, size.height_in);
  if (short === long) return { w: short, h: long };
  return orientation === "portrait" ? { w: short, h: long } : { w: long, h: short };
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Real-world proportions (inches) of the moulding, mat and engraving strip. */
export function frameGeometry(dims: { w: number; h: number }, mat: boolean, engraving: boolean) {
  const minD = Math.min(dims.w, dims.h);
  const maxD = Math.max(dims.w, dims.h);
  const moulding = clamp(0.3 + 0.035 * maxD, 0.35, 1.1);
  const matIn = mat ? clamp(0.14 * minD, 0.3, 2.2) : 0;
  const plaque = engraving ? clamp(0.12 * minD, 0.35, 1.3) : 0;
  return {
    moulding,
    mat: matIn,
    plaque,
    outerW: dims.w + 2 * (moulding + matIn),
    outerH: dims.h + 2 * (moulding + matIn) + plaque,
  };
}

export const isSquare =(s: FrameSize) => s.width_in === s.height_in;

/** Effective DPI: cropped pixels across the printed inches (worst axis). */
export function effectiveDpi(cropPx: { width: number; height: number }, dims: { w: number; h: number }) {
  return Math.floor(Math.min(cropPx.width / dims.w, cropPx.height / dims.h));
}

export function dpiVerdict(dpi: number) {
  if (dpi >= 300) return { level: "great" as const, text: "Crisp and sharp. Perfect for printing." };
  if (dpi >= 150) return { level: "good" as const, text: "Good quality for this size." };
  return { level: "low" as const, text: "This photo may look blurry at this size." };
}

/** Largest size that still prints at 150 DPI or more from the full photo. */
export function largestGoodSize(sizes: FrameSize[], srcPx: { width: number; height: number }) {
  const longPx = Math.max(srcPx.width, srcPx.height);
  const shortPx = Math.min(srcPx.width, srcPx.height);
  const ok = sizes.filter(
    (s) => longPx / Math.max(s.width_in, s.height_in) >= 150 && shortPx / Math.min(s.width_in, s.height_in) >= 150
  );
  return ok.sort((a, b) => b.width_in * b.height_in - a.width_in * a.height_in)[0];
}
