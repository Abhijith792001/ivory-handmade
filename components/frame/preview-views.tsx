"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FramedPhoto } from "./framed-photo";
import { frameGeometry, printDims, type Orientation } from "@/lib/frame";
import { cn, formatINR } from "@/lib/utils";
import type { FrameSize, FrameStyle } from "@/types";

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

interface Common {
  src?: string | null;
  style: FrameStyle;
  mat: boolean;
  engraving?: string;
  engravingFont?: string;
}

/** Single framed photo, scaled to fit the stage. */
export function FrameStage({ dims, ...p }: Common & { dims: { w: number; h: number } }) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const geo = frameGeometry(dims, p.mat, !!p.engraving);
  const maxH = 380;
  const ppi = width ? Math.min((width * 0.78) / geo.outerW, maxH / geo.outerH) : 0;
  return (
    <div ref={ref} className="relative flex h-[480px] items-center justify-center overflow-hidden rounded-[2rem] bg-[radial-gradient(ellipse_at_center,#FBF3EA_0%,#F3E6D6_70%)]">
      {ppi > 0 && (
        <motion.div key={`${dims.w}x${dims.h}`} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <FramedPhoto {...p} dims={dims} ppi={ppi} />
        </motion.div>
      )}
      <p className="absolute bottom-4 left-0 right-0 text-center text-[13px] text-muted">
        Print {dims.w}″ × {dims.h}″ · framed approx. {geo.outerW.toFixed(1)}″ × {geo.outerH.toFixed(1)}″
      </p>
    </div>
  );
}

/**
 * Room-wall mockup drawn at true scale: the wall shown is 84 inches wide,
 * with a 48-inch sideboard and a 30-inch-tall vase for reference.
 */
export function WallPreview({ dims, ...p }: Common & { dims: { w: number; h: number } }) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const WALL_IN = 84;
  const ppi = width / WALL_IN;
  const H = 480;
  const boardTop = H - 30 * ppi; // sideboard top 30" from floor (floor = bottom of stage)
  const geo = frameGeometry(dims, p.mat, !!p.engraving);
  const frameBottom = boardTop - 18 * ppi; // hang 18" above the sideboard, clear of the vase
  return (
    <div ref={ref} className="relative overflow-hidden rounded-[2rem]" style={{ height: H, background: "linear-gradient(180deg,#EFE4D6 0%,#E8DACA 100%)" }}>
      {/* soft window light */}
      <div className="pointer-events-none absolute -left-20 -top-10 h-[140%] w-1/2 rotate-12 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,250,240,0.55)_50%,rgba(255,255,255,0)_100%)] blur-2xl" />
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "var(--linen)" }} />
      {width > 0 && (
        <>
          <motion.div
            key={`${dims.w}x${dims.h}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: Math.max(12, frameBottom - geo.outerH * ppi) }}
          >
            <FramedPhoto {...p} dims={dims} ppi={ppi} />
          </motion.div>
          {/* sideboard */}
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: boardTop, width: 48 * ppi, height: 30 * ppi }}>
            <div className="h-[10%] rounded-t-sm bg-[#B98E66] shadow-[0_6px_14px_rgba(60,35,20,0.25)]" />
            <div className="flex h-[78%] gap-[2%] bg-[#C9A27C] px-[3%] py-[4%]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex-1 rounded-[2px] border border-[#A57D57]/50 bg-[#CFAA84]" />
              ))}
            </div>
            <div className="flex h-[12%] justify-between px-[6%]">
              <div className="w-[3%] bg-[#8F6A48]" />
              <div className="w-[3%] bg-[#8F6A48]" />
            </div>
          </div>
          {/* vase with sprigs */}
          <svg className="absolute" viewBox="0 0 40 120" style={{ left: `calc(50% + ${15 * ppi}px)`, top: boardTop - 16 * ppi, width: 5.5 * ppi, height: 16 * ppi }} aria-hidden>
            <path d="M20 118 C 8 118, 6 100, 12 86 C 14 80, 14 74, 16 70 L 24 70 C 26 74, 26 80, 28 86 C 34 100, 32 118, 20 118 Z" fill="#F6EEE2" stroke="#D9C7AE" />
            <g stroke="#6E7F52" fill="none" strokeWidth={1}>
              <path d="M20 70 C 18 50, 10 30, 6 6" />
              <path d="M20 70 C 22 46, 28 26, 34 10" />
              <path d="M20 70 V 14" />
            </g>
            {[[6, 6], [34, 10], [20, 14], [10, 26], [30, 28]].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r={2.4} fill="#F3E6D6" stroke="#C9B08F" strokeWidth={0.5} />
            ))}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D8C6B0]" />
        </>
      )}
      <p className="absolute bottom-3 right-4 rounded-full bg-ivory/80 px-3 py-1 text-[13px] text-muted">Shown to scale above a 48″ sideboard</p>
    </div>
  );
}

/** Every size side by side, at the same scale, with the photo inside each. */
export function SizeComparison({
  sizes,
  orientation,
  selectedId,
  onSelect,
  src,
  style,
}: {
  sizes: FrameSize[];
  orientation: Orientation;
  selectedId: string;
  onSelect: (s: FrameSize) => void;
  src?: string | null;
  style: FrameStyle;
}) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const all = sizes.map((s) => ({ s, d: printDims(s, orientation) }));
  const geos = all.map(({ d }) => frameGeometry(d, false, false));
  const totalW = geos.reduce((a, g) => a + g.outerW, 0);
  const maxH = Math.max(...geos.map((g) => g.outerH));
  // Wrap onto ~2 rows on desktop, ~3 on phones
  const rows = width < 640 ? 3 : 2.4;
  const ppi = width ? Math.min((width * rows) / (totalW + sizes.length * 3), (width < 640 ? 170 : 200) / maxH) : 0;
  return (
    <div ref={ref} className="rounded-[2rem] bg-[radial-gradient(ellipse_at_top,#FBF3EA_0%,#F3E6D6_80%)] p-5 sm:p-8">
      {ppi > 0 && (
        <div className="flex flex-wrap items-end justify-center gap-x-5 gap-y-8">
          {all.map(({ s, d }) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={cn("group flex flex-col items-center gap-2 rounded-xl p-1 transition", s.id === selectedId ? "" : "opacity-80 hover:opacity-100")}
              aria-pressed={s.id === selectedId}
              aria-label={`${s.label}, ${d.w} by ${d.h} inches, ${formatINR(s.price)}`}
            >
              <FramedPhoto src={src} dims={d} ppi={ppi} style={style} mat={false} className={cn("transition duration-500 group-hover:-translate-y-1", s.id === selectedId && "ring-2 ring-sage ring-offset-4 ring-offset-cream")} />
              <span className={cn("label text-[13px]", s.id === selectedId ? "text-sage-dark" : "text-brown")}>{s.label}</span>
              <span className="-mt-1.5 text-[13px] text-muted">{formatINR(s.price)}</span>
            </button>
          ))}
        </div>
      )}
      <p className="mt-6 text-center text-[13px] text-muted">All frames are drawn at the same scale. Tap a size to choose it.</p>
    </div>
  );
}
