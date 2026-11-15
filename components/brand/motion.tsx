// Scroll reveals as pure CSS scroll-driven animations (see `.reveal` in
// app/globals.css). Content is ALWAYS visible (no opacity hiding); supporting
// browsers just give it a soft rise as it scrolls into view. Nothing depends on
// JavaScript or the page being scrolled, so a section can never render as an
// empty block (full-page screenshots, in-app browsers, fast jumps, reduced motion).
import { cn } from "@/lib/utils";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

/** Soft rise as the element enters the viewport. `delay` (0–0.3) staggers it slightly. */
export function FadeUp({ delay = 0, className, style, children, ...props }: DivProps & { delay?: number; y?: number }) {
  const offset = Math.round(Math.min(delay, 0.3) * 400); // scroll distance (px) before this one starts
  return (
    <div className={cn("reveal", className)} style={offset ? ({ ...style, "--reveal-offset": `${offset}px` } as React.CSSProperties) : style} {...props}>
      {children}
    </div>
  );
}

/** Children reveal one after another (each starts a little later in the scroll). */
export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("reveal-stagger", className)}>{children}</div>;
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
