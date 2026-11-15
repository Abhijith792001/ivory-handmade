// Line icons in the style of the moodboard's circular category badges.
import { cn } from "@/lib/utils";

const paths: Record<string, React.ReactNode> = {
  leaf: (
    <>
      <path d="M14 50 C 22 34, 34 20, 50 12" />
      <path d="M50 12 C 50 30, 40 44, 22 46 C 24 30, 34 18, 50 12 Z" />
      <path d="M24 36 C 18 34, 14 28, 14 22 C 20 24, 24 30, 24 36 Z" />
      <path d="M30 40 L 44 22" strokeOpacity={0.6} />
    </>
  ),
  sprig: (
    <>
      <path d="M32 54 V 26" />
      <path d="M32 40 C 26 36, 22 30, 22 22" />
      <path d="M32 34 C 38 30, 42 24, 42 16" />
      <circle cx={22} cy={18} r={4} />
      <circle cx={42} cy={13} r={4} />
      <circle cx={32} cy={22} r={4} />
      <path d="M32 48 C 26 46, 22 42, 20 38 C 26 38, 30 42, 32 48 Z" />
      <path d="M32 46 C 38 44, 42 40, 44 36 C 38 36, 34 40, 32 46 Z" />
    </>
  ),
  flowers: (
    <>
      <path d="M32 56 V 30 M32 44 C 24 40, 20 34, 18 26 M32 40 C 40 36, 44 30, 46 22" />
      {[[18, 20], [46, 16], [32, 24]].map(([x, y]) => (
        <g key={`${x}`}>
          <circle cx={x} cy={y - 4} r={3} />
          <circle cx={x - 4} cy={y} r={3} />
          <circle cx={x + 4} cy={y} r={3} />
          <circle cx={x} cy={y + 3} r={3} />
        </g>
      ))}
    </>
  ),
  bow: (
    <>
      <path d="M32 30 C 24 20, 10 16, 10 26 C 10 36, 24 34, 32 30 Z" />
      <path d="M32 30 C 40 20, 54 16, 54 26 C 54 36, 40 34, 32 30 Z" />
      <circle cx={32} cy={30} r={3} />
      <path d="M30 33 L 20 50 M34 33 L 44 50" />
    </>
  ),
  frame: (
    <>
      <rect x={14} y={12} width={36} height={42} rx={2} />
      <rect x={20} y={18} width={24} height={30} rx={1} />
      <path d="M20 42 L 28 34 L 34 40 L 38 36 L 44 42" strokeOpacity={0.7} />
      <circle cx={38} cy={25} r={2.5} />
    </>
  ),
  house: (
    <>
      <path d="M12 30 L 32 14 L 52 30" />
      <path d="M18 26 V 52 H 46 V 26" />
      <rect x={27} y={36} width={10} height={16} />
    </>
  ),
  arch: (
    <>
      <path d="M14 52 V 32 a 18 18 0 0 1 36 0 V 52" />
      <path d="M20 52 V 32 a 12 12 0 0 1 24 0 V 52" />
      <path d="M26 52 V 32 a 6 6 0 0 1 12 0 V 52" />
    </>
  ),
  heart: <path d="M32 52s-18-11-18-25a10 10 0 0 1 18-6 10 10 0 0 1 18 6c0 14-18 25-18 25Z" />,
  gift: (
    <>
      <rect x={12} y={24} width={40} height={28} rx={2} />
      <path d="M12 32 H 52 M32 24 V 52" />
      <path d="M32 24 C 26 14, 16 16, 20 22 C 22 24, 28 24, 32 24 C 36 24, 42 24, 44 22 C 48 16, 38 14, 32 24" />
    </>
  ),
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("h-8 w-8", className)}>
      {paths[name] ?? paths.sprig}
    </svg>
  );
}

export const iconNames = Object.keys(paths);
