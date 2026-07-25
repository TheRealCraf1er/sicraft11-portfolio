import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "up" | "wipe" | "fade" | "scale";

interface RevealProps {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  /** Reveal once and stay revealed. */
  once?: boolean;
}

/**
 * Scroll-triggered reveal. "wipe" is the signature move for section headers —
 * a hard clip-path sweep rather than the usual soft fade-up.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  const variants = {
    up: {
      hidden: { opacity: 0, y: 26 },
      show: { opacity: 1, y: 0 },
    },
    fade: {
      hidden: { opacity: 0 },
      show: { opacity: 1 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.96 },
      show: { opacity: 1, scale: 1 },
    },
    wipe: {
      hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
      show: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
    },
  }[variant];

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      variants={variants}
      transition={{
        duration: variant === "wipe" ? 0.85 : 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/** Staggers direct children of a list. Pair with <RevealItem>. */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 22 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
