import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Pencil, ArrowUp, ArrowDown, FileText } from "lucide-react";
import type { ServerEntry } from "../../lib/types";
import { STATUS_STYLE } from "../../lib/types";
import {
  cn,
  formatPeriod,
  isApplication,
  isOngoing,
  scaleWidth,
  withAlpha,
} from "../../lib/utils";
import { useSite } from "../../lib/store";

interface ServerRowProps {
  server: ServerEntry;
  index: number;
  max: number;
  onEdit: (s: ServerEntry) => void;
  /** True when a chart segment is hovered and this row isn't part of it. */
  dimmed?: boolean;
  /** True when this row belongs to the hovered chart segment. */
  highlighted?: boolean;
  /** The hovered segment's colour, used to tint the highlight. */
  highlightColor?: string | null;
}

export function ServerRow({
  server,
  index,
  max,
  onEdit,
  dimmed = false,
  highlighted = false,
  highlightColor,
}: ServerRowProps) {
  const { editing, moveServer } = useSite();
  const [open, setOpen] = useState(false);

  const status = STATUS_STYLE[server.status];
  const active = server.status === "Active";
  const application = isApplication(server);
  const expandable = Boolean(server.note);
  const width = scaleWidth(server.scale, max);

  return (
    <div
      className={cn(
        "group relative border-b border-bone/8",
        "transition-[opacity,filter,background-color,box-shadow] duration-500",
        "hover:bg-bone/[0.025]",
        !active && "opacity-70 hover:opacity-100",
        // chart hover takes precedence — push non-matching rows right back
        dimmed && "!opacity-20 blur-[1px] saturate-0",
      )}
      style={
        highlighted && highlightColor
          ? {
              backgroundColor: withAlpha(highlightColor, 0.09),
              boxShadow: `inset 0 0 38px -18px ${withAlpha(highlightColor, 0.85)}`,
            }
          : undefined
      }
    >
      {/* accent bar — hover, still-held, or matching the hovered chart segment */}
      <span
        className={cn(
          "absolute top-0 left-0 h-full w-[2px] origin-top scale-y-0 transition-transform duration-500",
          "bg-ember group-hover:scale-y-100",
          active && "scale-y-100 bg-moss/70",
          highlighted && "!scale-y-100",
        )}
        style={{
          transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
          ...(highlighted && highlightColor
            ? { backgroundColor: highlightColor, width: "3px" }
            : {}),
        }}
      />

      <div
        role={expandable ? "button" : undefined}
        tabIndex={expandable ? 0 : undefined}
        onClick={() => expandable && setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (expandable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className={cn(
          "grid items-center gap-x-6 gap-y-3 py-5 pr-2 pl-5",
          "lg:grid-cols-[minmax(0,3fr)_minmax(0,2.3fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_7.5rem]",
          expandable && "cursor-pointer",
        )}
      >
        {/* ---------- name ---------- */}
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="shrink-0 font-mono text-[10px] text-ash-2 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0">
            <h4
              className={cn(
                "truncate font-display text-lg leading-tight font-semibold",
                active ? "text-bone" : "text-bone-2",
              )}
            >
              {server.name}
            </h4>

            {application && (
              <span className="mt-0.5 inline-block font-mono text-[9px] tracking-[0.18em] text-ash-2 uppercase">
                Application only
              </span>
            )}
          </div>

          {expandable && (
            <ChevronDown
              size={13}
              className={cn(
                "ml-auto shrink-0 text-ash transition-transform duration-300 lg:ml-0",
                open && "rotate-180 text-ember",
              )}
            />
          )}
        </div>

        {/* ---------- roles ---------- */}
        <div className="flex flex-wrap items-center gap-1.5">
          {server.roles.map((r, i) => (
            <span key={r} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-[9px] text-ash-2">→</span>}
              <span
                className={cn(
                  "chip",
                  i === server.roles.length - 1
                    ? "border-bone/18 bg-bone/[0.04] text-bone-2"
                    : "border-bone/8 text-ash",
                )}
              >
                {r}
              </span>
            </span>
          ))}
        </div>

        {/* ---------- period ---------- */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] whitespace-nowrap text-ash">
            {formatPeriod(server)}
          </span>
          {/* only pulse for roles that are genuinely still held */}
          {isOngoing(server) && active && (
            <span className="live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
          )}
        </div>

        {/* ---------- scale ---------- */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate font-mono text-[11px] text-bone-2">
              {server.members}
            </span>
          </div>
          {width > 0 && (
            <div className="mt-1.5 h-[3px] w-full bg-bone/8">
              <motion.div
                className="h-full bg-gradient-to-r from-ember-deep to-ember"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: width / 100 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "left" }}
              />
            </div>
          )}
        </div>

        {/* ---------- status + owner controls ---------- */}
        <div className="flex items-center justify-start gap-1.5 lg:justify-end">
          <span
            className={cn("chip", status.border, status.bg, status.text)}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {server.status}
          </span>

          {editing && (
            <div
              className="flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => moveServer(server.id, -1)}
                className="p-1 text-ash transition-colors hover:text-bone"
                title="Move up"
              >
                <ArrowUp size={12} />
              </button>
              <button
                onClick={() => moveServer(server.id, 1)}
                className="p-1 text-ash transition-colors hover:text-bone"
                title="Move down"
              >
                <ArrowDown size={12} />
              </button>
              <button
                onClick={() => onEdit(server)}
                className="p-1 text-ember transition-colors hover:text-ember-2"
                title="Edit entry"
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------- expandable note ---------- */}
      <AnimatePresence initial={false}>
        {open && expandable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2.5 border-l-2 border-ember/40 py-4 pr-6 pl-5 ml-5 mb-2 bg-bone/[0.02]">
              <FileText size={13} className="mt-0.5 shrink-0 text-ember" />
              <p className="text-pretty text-sm leading-relaxed text-bone-2/90">
                {server.note}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
