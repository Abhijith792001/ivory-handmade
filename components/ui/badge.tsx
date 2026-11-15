import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full bg-ivory/90 px-3 py-1 font-sans text-[13px] uppercase tracking-[0.18em] text-brown", className)}
      {...props}
    />
  );
}
