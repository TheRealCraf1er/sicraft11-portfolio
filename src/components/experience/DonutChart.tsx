import { useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { Category, ServerEntry } from "../../lib/types";
import { RESPONSIBILITIES } from "../../lib/types";
import {
  cn,
  deriveResponsibility,
  CATEGORY_COLOR,
  RESPONSIBILITY_COLOR,
} from "../../lib/utils";
import { Counter } from "../ui/Counter";

export type ChartMode = "network" | "responsibility";

export interface Slice {
  key: string;
  label: string;
  count: number;
  color: string;
}

interface DonutChartProps {
  servers: ServerEntry[];
  categories: Category[];
  mode: ChartMode;
  onModeChange: (m: ChartMode) => void;
  /** Currently hovered slice key, lifted so the server list can react. */
  active: string | null;
  onActiveChange: (key: string | null) => void;
}

const RADIUS = 62;
const STROKE = 26;

export function DonutChart({
  servers,
  categories,
  mode,
  onModeChange,
  active,
  onActiveChange,
}: DonutChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  const reduce = useReducedMotion();

  const slices = useMemo<Slice[]>(() => {
    if (mode === "network") {
      const byCat = categories.map((c) => ({
        key: c.id,
        label: c.title,
        count: servers.filter((s) => s.categoryId === c.id).length,
        color: CATEGORY_COLOR[c.id] ?? "var(--color-ash)",
      }));

      const featured = servers.filter((s) => s.categoryId === "featured").length;
      if (featured > 0) {
        byCat.push({
          key: "featured",
          label: "Featured Project",
          count: featured,
          color: CATEGORY_COLOR.featured,
        });
      }
      return byCat.filter((s) => s.count > 0);
    }

    return RESPONSIBILITIES.map((r) => ({
      key: r,
      label: r,
      count: servers.filter((s) => deriveResponsibility(s) === r).length,
      color: RESPONSIBILITY_COLOR[r],
    })).filter((s) => s.count > 0);
  }, [servers, categories, mode]);

  const total = slices.reduce((sum, s) => sum + s.count, 0);

  // Pre-compute each arc's start offset as a fraction of the circle.
  const arcs = useMemo(() => {
    let cursor = 0;
    return slices.map((s) => {
      const fraction = total > 0 ? s.count / total : 0;
      const arc = { ...s, fraction, offset: cursor };
      cursor += fraction;
      return arc;
    });
  }, [slices, total]);

  const activeSlice = arcs.find((a) => a.key === active) ?? null;

  return (
    <div ref={ref} className="panel p-6 sm:p-8">
      {/* ---- mode toggle ---- */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <span className="label mr-1">Breakdown</span>
        <div className="flex border border-bone/12">
          {(
            [
              { id: "network", label: "By network" },
              { id: "responsibility", label: "By responsibility" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onModeChange(m.id);
                onActiveChange(null);
              }}
              className={cn(
                "px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors",
                mode === m.id
                  ? "bg-ember text-ink"
                  : "text-ash hover:bg-bone/5 hover:text-bone",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-center gap-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10">
        {/* ---- the donut ---- */}
        <div className="relative mx-auto h-[190px] w-[190px] shrink-0">
          <svg
            viewBox="0 0 160 160"
            className="h-full w-full -rotate-90"
            role="img"
            aria-label={`Experience split ${mode === "network" ? "by network" : "by responsibility"}`}
          >
            {/* track */}
            <circle
              cx="80"
              cy="80"
              r={RADIUS}
              fill="none"
              stroke="color-mix(in oklab, var(--color-bone) 7%, transparent)"
              strokeWidth={STROKE}
            />

            {arcs.map((arc, i) => {
              const dimmed = active !== null && active !== arc.key;
              return (
                <motion.circle
                  key={`${mode}-${arc.key}`}
                  cx="80"
                  cy="80"
                  r={RADIUS}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={dimmed ? STROKE - 8 : STROKE}
                  strokeLinecap="butt"
                  pathLength={1}
                  strokeDashoffset={-arc.offset}
                  initial={{ strokeDasharray: `0 1`, opacity: 0 }}
                  animate={
                    inView || reduce
                      ? {
                          strokeDasharray: `${arc.fraction} 1`,
                          opacity: dimmed ? 0.25 : 1,
                        }
                      : {}
                  }
                  transition={{
                    strokeDasharray: {
                      duration: reduce ? 0 : 1.1,
                      delay: reduce ? 0 : 0.12 * i,
                      ease: [0.16, 1, 0.3, 1],
                    },
                    opacity: { duration: 0.3 },
                    strokeWidth: { duration: 0.3 },
                  }}
                  className="cursor-pointer"
                  style={{ transition: "stroke-width 0.3s ease" }}
                  onMouseEnter={() => onActiveChange(arc.key)}
                  onMouseLeave={() => onActiveChange(null)}
                />
              );
            })}
          </svg>

          {/* centre readout */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {activeSlice ? (
              <>
                <span
                  className="display-tight text-4xl tabular-nums"
                  style={{ color: activeSlice.color }}
                >
                  {activeSlice.count}
                </span>
                <span className="mt-1 max-w-[7.5rem] font-mono text-[9px] leading-tight tracking-[0.12em] text-bone-2 uppercase">
                  {activeSlice.label}
                </span>
              </>
            ) : (
              <>
                <Counter
                  value={total}
                  className="display-tight text-4xl text-bone tabular-nums"
                />
                <span className="mt-1 font-mono text-[9px] tracking-[0.16em] text-ash uppercase">
                  Positions
                </span>
              </>
            )}
          </div>
        </div>

        {/* ---- legend ---- */}
        <ul className="space-y-1">
          {arcs.map((arc, i) => {
            const dimmed = active !== null && active !== arc.key;
            const pct = Math.round(arc.fraction * 100);

            return (
              <motion.li
                key={`${mode}-${arc.key}`}
                initial={{ opacity: 0, x: 12 }}
                animate={inView || reduce ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: reduce ? 0 : 0.3 + i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <button
                  type="button"
                  onMouseEnter={() => onActiveChange(arc.key)}
                  onMouseLeave={() => onActiveChange(null)}
                  onFocus={() => onActiveChange(arc.key)}
                  onBlur={() => onActiveChange(null)}
                  className={cn(
                    "flex w-full items-center gap-3 px-2 py-2 text-left transition-all duration-300",
                    "hover:bg-bone/5",
                    dimmed && "opacity-40",
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rotate-45 transition-transform duration-300"
                    style={{
                      backgroundColor: arc.color,
                      transform: active === arc.key ? "rotate(45deg) scale(1.35)" : undefined,
                    }}
                  />

                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-bone-2">
                    {arc.label}
                  </span>

                  <span className="shrink-0 font-mono text-[11px] text-bone tabular-nums">
                    {arc.count}
                  </span>
                  <span className="w-9 shrink-0 text-right font-mono text-[10px] text-ash-2 tabular-nums">
                    {pct}%
                  </span>
                </button>

                {/* proportional underline */}
                <div className="ml-2 h-px bg-bone/8">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: arc.color, transformOrigin: "left" }}
                    initial={{ scaleX: 0 }}
                    animate={inView || reduce ? { scaleX: arc.fraction } : {}}
                    transition={{
                      duration: reduce ? 0 : 0.9,
                      delay: reduce ? 0 : 0.4 + i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <p className="mt-6 border-t border-bone/8 pt-4 font-mono text-[10px] text-ash-2">
        Hover a segment to highlight those servers in the list below.
      </p>
    </div>
  );
}
