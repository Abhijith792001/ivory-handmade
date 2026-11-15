// Thin botanical line-art used as section decoration. Pure SVG, no assets.
import { cn } from "@/lib/utils";

type SvgProps = React.SVGProps<SVGSVGElement>;

export const SPRIG_STEM = "M60 196 C 61 160, 57 128, 61 92 S 68 36, 64 8";
export const SPRIG_LEAVES = [
  "M60 160 C 44 154, 30 142, 24 124 C 42 128, 55 140, 60 160 Z",
  "M60 138 C 74 130, 88 116, 92 98 C 76 104, 64 118, 60 138 Z",
  "M60 112 C 46 106, 36 94, 32 78 C 47 82, 57 94, 60 112 Z",
  "M62 86 C 74 78, 84 66, 86 52 C 73 58, 64 70, 62 86 Z",
  "M63 60 C 53 54, 47 44, 46 32 C 56 37, 62 47, 63 60 Z",
];
const VEINS = ["M60 160 L 32 130", "M60 138 L 86 104", "M60 112 L 38 84", "M62 86 L 81 58", "M63 60 L 50 38"];

/** A single leafy sprig with a little bud on top. */
export function Sprig({ className, ...props }: SvgProps) {
  return (
    <svg viewBox="0 0 120 200" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("text-sage-dark", className)} {...props}>
      <path d={SPRIG_STEM} />
      {SPRIG_LEAVES.map((d, i) => (
        <path key={i} d={d} fill="currentColor" fillOpacity={0.12} />
      ))}
      {VEINS.map((d, i) => (
        <path key={i} d={d} strokeOpacity={0.55} strokeWidth={0.8} />
      ))}
      <circle cx={64} cy={8} r={3.2} fill="currentColor" fillOpacity={0.2} />
    </svg>
  );
}

/** A small flowering stem (five-petal blossoms), echoing the logo artwork. */
export function FlowerSprig({ className, ...props }: SvgProps) {
  const flower = (cx: number, cy: number, r = 6) => (
    <g key={`${cx}-${cy}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return <ellipse key={i} cx={cx + Math.cos(a) * r * 0.8} cy={cy + Math.sin(a) * r * 0.8} rx={r * 0.55} ry={r * 0.38} transform={`rotate(${(a * 180) / Math.PI + 90} ${cx + Math.cos(a) * r * 0.8} ${cy + Math.sin(a) * r * 0.8})`} fill="#FBF3EA" />;
      })}
      <circle cx={cx} cy={cy} r={1.6} fill="currentColor" />
    </g>
  );
  return (
    <svg viewBox="0 0 120 200" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" aria-hidden className={cn("text-brown", className)} {...props}>
      <path d="M60 196 C 60 150, 58 120, 60 80" />
      <path d="M60 120 C 48 104, 40 88, 36 64" />
      <path d="M60 104 C 72 90, 80 72, 84 52" />
      <path d="M60 80 C 60 62, 62 44, 60 24" />
      <path d="M60 170 C 44 164, 34 152, 30 138 C 44 142, 56 152, 60 170 Z" className="text-sage-dark" stroke="#6E7F52" fill="#6E7F52" fillOpacity={0.15} />
      <path d="M60 150 C 76 142, 86 130, 90 116 C 76 120, 64 132, 60 150 Z" stroke="#6E7F52" fill="#6E7F52" fillOpacity={0.15} />
      {[flower(36, 60), flower(84, 48), flower(60, 22, 7)]}
    </svg>
  );
}

/** —— ♡ —— divider used under headings. */
export function HeartDivider({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", light ? "text-ivory" : "text-muted", className)} aria-hidden>
      <span className="h-px w-10 bg-current opacity-60" />
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      </svg>
      <span className="h-px w-10 bg-current opacity-60" />
    </div>
  );
}

/** Corner flourish of two crossing sprigs, for card/section corners. */
export function CornerSprigs({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none flex", className)} aria-hidden>
      <Sprig className="h-40 w-24 -rotate-[24deg] opacity-70" />
      <Sprig className="-ml-12 h-32 w-20 rotate-[18deg] opacity-50" />
    </div>
  );
}
