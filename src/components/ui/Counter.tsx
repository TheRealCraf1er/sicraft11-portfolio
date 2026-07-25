import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, animate } from "framer-motion";

interface CounterProps {
  value: number;
  /** Text rendered before / after the number, e.g. "" and "+". */
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  /** Thousands separators. */
  group?: boolean;
}

/**
 * Ticks a number up once it scrolls into view. Respects reduced-motion by
 * rendering the final value immediately.
 */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.9,
  className,
  group = true,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {group ? display.toLocaleString("en-US") : display}
      {suffix}
    </span>
  );
}
