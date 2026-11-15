import { cn } from "@/lib/utils";
import { HeartDivider } from "./botanical";
import { FadeUp } from "./motion";

export function SectionHeading({
  eyebrow,
  title,
  script,
  description,
  className,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  script?: string;
  description?: string;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <FadeUp className={cn("mb-10 sm:mb-14", align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow && <p className="label mb-3">{eyebrow}</p>}
      <h2 className="heading-lg text-balance">
        {title} {script && <span className="font-script text-[1.25em] font-normal text-sage-dark">{script}</span>}
      </h2>
      <HeartDivider className={cn("mt-4", align === "left" && "justify-start")} />
      {description && <p className={cn("mt-5 max-w-xl text-[17px] leading-[1.7] text-ink", align === "center" && "mx-auto")}>{description}</p>}
    </FadeUp>
  );
}
