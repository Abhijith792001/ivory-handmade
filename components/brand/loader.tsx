"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SPRIG_LEAVES, SPRIG_STEM } from "./botanical";
import { BrandLogo } from "./logo";
import { cn } from "@/lib/utils";

/** A leaf sprig draws itself in (SVG stroke animation), then the Ivory logo fades up beneath it. */
export function IvoryLoader({ className, label = "Loading", compact = false }: { className?: string; label?: string; compact?: boolean }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center justify-center", className)}>
      <svg viewBox="0 0 120 200" className={compact ? "h-16 w-10" : "h-24 w-14"} fill="none" stroke="#5A6943" strokeWidth={1.4} strokeLinecap="round" aria-hidden>
        <motion.path d={SPRIG_STEM} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeInOut" }} />
        {SPRIG_LEAVES.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            initial={{ pathLength: 0, fillOpacity: 0 }}
            animate={{ pathLength: 1, fillOpacity: 0.14 }}
            fill="#5A6943"
            transition={{ duration: 0.7, delay: 0.5 + i * 0.16, ease: "easeInOut" }}
          />
        ))}
      </svg>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className={cn("mt-3", compact ? "w-28" : "w-48")}>
        <BrandLogo priority className="h-auto w-full" sizes={compact ? "112px" : "192px"} alt="" />
      </motion.div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Splash screen shown once per browser session. */
export function SplashScreen() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ivory-splash") === "1";
      sessionStorage.setItem("ivory-splash", "1");
    } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          className="paper fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <IvoryLoader label="Welcome to Ivory" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
