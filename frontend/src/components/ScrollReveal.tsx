"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  /** "view" (default) speelt af zodra het element scrollt in beeld komt; "mount" speelt direct af bij laden (bv. hero-content boven de vouw). */
  trigger?: "view" | "mount";
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  y = 24,
  duration = 0.6,
  trigger = "view",
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();
  const triggerProps =
    trigger === "mount"
      ? { animate: reduceMotion ? undefined : { opacity: 1, y: 0 } }
      : {
          whileInView: reduceMotion ? undefined : { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2, margin: "-80px" },
        };

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...triggerProps}
    >
      {children}
    </motion.div>
  );
}
