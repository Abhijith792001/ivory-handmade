"use client";
import { frameGeometry } from "@/lib/frame";
import { cn } from "@/lib/utils";
import type { FrameStyle } from "@/types";

export function mouldingBackground(style: Pick<FrameStyle, "color" | "texture" | "name">) {
  const shade = style.texture || style.color;
  const isMetal = /gold/i.test(style.name);
  const grain = isMetal
    ? "linear-gradient(115deg, rgba(255,255,255,0.0) 30%, rgba(255,255,255,0.45) 45%, rgba(255,255,255,0) 60%)"
    : "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 1px, transparent 1px 5px), repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0 1px, transparent 1px 7px)";
  return `${grain}, linear-gradient(135deg, ${style.color} 0%, ${shade} 50%, ${style.color} 100%)`;
}

/**
 * CSS rendering of a framed print at true proportions.
 * `ppi` = screen pixels per real inch, so several frames drawn with the same
 * ppi are at correct relative scale.
 */
export function FramedPhoto({
  src,
  dims,
  ppi,
  style,
  mat,
  engraving,
  className,
  engravingFont,
}: {
  src?: string | null;
  dims: { w: number; h: number };
  ppi: number;
  style: FrameStyle;
  mat: boolean;
  engraving?: string;
  className?: string;
  engravingFont?: string;
}) {
  const geo = frameGeometry(dims, mat, !!engraving);
  const m = Math.max(2, geo.moulding * ppi);
  const matPx = geo.mat * ppi;
  const plaquePx = geo.plaque * ppi;
  return (
    <div
      className={cn("relative shadow-frame", className)}
      style={{
        width: geo.outerW * ppi,
        height: geo.outerH * ppi,
        padding: m,
        background: mouldingBackground(style),
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 0 ${m / 2}px rgba(0,0,0,0.25), 0 ${Math.max(4, ppi * 0.4)}px ${Math.max(8, ppi * 0.9)}px -${Math.max(2, ppi * 0.2)}px rgba(60,35,20,0.45)`,
      }}
    >
      <div className="flex h-full w-full flex-col items-center" style={{ background: mat || engraving ? "#FBF8F3" : "#1a1a1a", padding: matPx, boxShadow: `inset 0 ${Math.max(1, m / 6)}px ${Math.max(2, m / 3)}px rgba(0,0,0,0.25)` }}>
        <div className="relative w-full overflow-hidden bg-cream" style={{ height: dims.h * ppi, boxShadow: mat ? "0 0 0 1px rgba(0,0,0,0.08), inset 0 1px 3px rgba(0,0,0,0.2)" : undefined }}>
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="Your photo in the frame" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-beige/50 to-cream" />
          )}
          {/* glass sheen */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_35%,rgba(255,255,255,0)_70%,rgba(255,255,255,0.08)_100%)]" />
        </div>
        {engraving && (
          <div
            className="flex w-full items-center justify-center overflow-hidden whitespace-nowrap text-brown"
            style={{ height: plaquePx + matPx, marginBottom: -matPx, fontSize: Math.max(6, plaquePx * 0.5), fontFamily: engravingFont }}
          >
            {engraving}
          </div>
        )}
      </div>
    </div>
  );
}
