import { useMemo, useState } from "react";
import { Plus, FilterX } from "lucide-react";
import { motion } from "framer-motion";
import { useSite } from "../../lib/store";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";
import { EditableText } from "../ui/Editable";
import { Counter } from "../ui/Counter";
import { ServerRow } from "./ServerRow";
import { ServerEditor } from "./ServerEditor";
import { DonutChart, type ChartMode } from "./DonutChart";
import type { ServerEntry } from "../../lib/types";
import {
  cn,
  deriveResponsibility,
  maxScale,
  CATEGORY_COLOR,
  RESPONSIBILITY_COLOR,
} from "../../lib/utils";

type Filter = "all" | "active" | "past";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All entries" },
  { id: "active", label: "Currently active" },
  { id: "past", label: "Past / historical" },
];

export function Experience() {
  const { state, updateCategory, createServer, editing } = useSite();
  const [filter, setFilter] = useState<Filter>("all");
  const [editingServer, setEditingServer] = useState<ServerEntry | null>(null);
  const [chartMode, setChartMode] = useState<ChartMode>("network");
  const [activeSlice, setActiveSlice] = useState<string | null>(null);

  // Featured lives in its own section; it never appears in the ledger.
  const listed = useMemo(
    () => state.servers.filter((s) => s.categoryId !== "featured"),
    [state.servers],
  );

  const stats = useMemo(() => {
    const active = state.servers.filter((s) => s.status === "Active").length;
    const largest = maxScale(state.servers);
    return {
      total: state.servers.length,
      active,
      largest,
      networks: state.categories.length,
    };
  }, [state.servers, state.categories]);

  const max = useMemo(() => maxScale(listed), [listed]);

  const matches = (s: ServerEntry) =>
    filter === "all"
      ? true
      : filter === "active"
        ? s.status === "Active"
        : s.status !== "Active";

  /** Does this row belong to the chart segment currently being hovered? */
  const isHighlighted = (s: ServerEntry) => {
    if (!activeSlice) return false;
    return chartMode === "network"
      ? s.categoryId === activeSlice
      : deriveResponsibility(s) === activeSlice;
  };

  /** Segment colour, so highlighted rows pick up the slice's identity. */
  const activeColor = activeSlice
    ? chartMode === "network"
      ? (CATEGORY_COLOR[activeSlice] ?? "var(--color-ember)")
      : (RESPONSIBILITY_COLOR[
          activeSlice as keyof typeof RESPONSIBILITY_COLOR
        ] ?? "var(--color-ember)")
    : null;

  const categories = [...state.categories].sort((a, b) => a.order - b.order);

  return (
    <section
      id="experience"
      className="relative mx-auto max-w-[88rem] px-5 py-24 sm:px-8 md:py-32"
    >
      <SectionHeader
        index="02"
        title={
          <>
            Server
            <br />
            <span className="text-ember">Experience</span>
          </>
        }
        meta={`${stats.total} entries on record`}
      />

      {/* ---------------- stat strip ---------------- */}
      <Reveal variant="up">
        <dl className="mb-12 grid grid-cols-2 gap-px border border-bone/8 bg-bone/8 md:grid-cols-4">
          <Stat label="Staff positions" value={stats.total} suffix="+" />
          <Stat label="Currently active" value={stats.active} accent />
          <Stat label="Peak community managed" value={stats.largest} />
          <Stat label="Categories" value={stats.networks} />
        </dl>
      </Reveal>

      {/* ---------------- breakdown chart ---------------- */}
      <Reveal variant="up">
        <div className="mb-12">
          <DonutChart
            servers={state.servers}
            categories={categories}
            mode={chartMode}
            onModeChange={setChartMode}
            active={activeSlice}
            onActiveChange={setActiveSlice}
          />
        </div>
      </Reveal>

      {/* ---------------- filter ---------------- */}
      <Reveal variant="up">
        <div className="mb-12 flex flex-wrap items-center gap-2">
          <span className="label mr-2">Filter</span>
          {FILTERS.map((f) => {
            const count =
              f.id === "all"
                ? listed.length
                : listed.filter((s) =>
                    f.id === "active"
                      ? s.status === "Active"
                      : s.status !== "Active",
                  ).length;

            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px]",
                  "tracking-[0.14em] uppercase transition-all duration-300",
                  filter === f.id
                    ? "border-ember bg-ember text-ink"
                    : "border-bone/12 text-ash hover:border-ember/50 hover:text-bone",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "tabular-nums",
                    filter === f.id ? "text-ink/60" : "text-ash-2",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* explains why these counts sit one below the career totals above */}
          <span className="w-full font-mono text-[10px] text-ash-2 sm:w-auto sm:pl-2">
            NightVanilla is featured above and isn&apos;t repeated here.
          </span>
        </div>
      </Reveal>

      {/* ---------------- categories ---------------- */}
      <div className="space-y-20">
        {categories.map((cat) => {
          const rows = listed
            .filter((s) => s.categoryId === cat.id)
            .sort((a, b) => a.order - b.order)
            .filter(matches);

          const totalInCat = listed.filter((s) => s.categoryId === cat.id).length;

          // A category with nothing to show under an active filter collapses to
          // a compact badge — the full header + description would be pure
          // chrome wrapped around empty space.
          const filteredEmpty = rows.length === 0 && filter !== "all";

          if (filteredEmpty) {
            return (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="panel flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4"
              >
                <FilterX size={14} className="shrink-0 text-ash" />
                <span className="font-display text-lg font-semibold text-bone-2">
                  {cat.title}
                </span>
                <span className="font-mono text-[11px] text-ash">
                  {filter === "active"
                    ? "No active positions in this category"
                    : "No past positions in this category"}
                </span>
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="ml-auto font-mono text-[10px] tracking-[0.14em] text-ember
                             uppercase transition-colors hover:text-ember-2"
                >
                  Show all {totalInCat}
                </button>
              </motion.div>
            );
          }

          return (
            <div key={cat.id}>
              {/* category header block */}
              <Reveal variant="up">
                <div className="mb-8 grid gap-6 border-t border-bone/12 pt-7 lg:grid-cols-12 lg:gap-10">
                  <div className="lg:col-span-5">
                    <EditableText
                      as="p"
                      label="kicker"
                      value={cat.kicker}
                      onChange={(v) => updateCategory(cat.id, { kicker: v })}
                      className="label label-ember mb-3"
                    />
                    <EditableText
                      as="h3"
                      label="title"
                      value={cat.title}
                      onChange={(v) => updateCategory(cat.id, { title: v })}
                      className="font-display text-3xl leading-tight font-semibold text-bone sm:text-4xl"
                    />
                    <p className="mt-3 font-mono text-[11px] text-ash">
                      {totalInCat} {totalInCat === 1 ? "entry" : "entries"}
                    </p>
                  </div>

                  <div className="lg:col-span-7">
                    <EditableText
                      as="p"
                      label="description"
                      multiline
                      value={cat.description}
                      onChange={(v) => updateCategory(cat.id, { description: v })}
                      className="text-pretty text-sm leading-relaxed text-bone-2/85 sm:text-base"
                      placeholder="Write a short paragraph of context for this group…"
                    />
                  </div>
                </div>
              </Reveal>

              {/* column labels */}
              <div
                className="hidden gap-x-6 border-b border-bone/12 pb-2 pl-5 lg:grid
                           lg:grid-cols-[minmax(0,3fr)_minmax(0,2.3fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_7.5rem]"
              >
                <span className="label">Server</span>
                <span className="label">Rank / roles</span>
                <span className="label">Period</span>
                <span className="label">Scale</span>
                <span className="label lg:text-right">Standing</span>
              </div>

              {/* rows */}
              <div>
                {rows.map((s, i) => {
                  const match = isHighlighted(s);
                  return (
                    <ServerRow
                      key={s.id}
                      server={s}
                      index={i}
                      max={max}
                      onEdit={setEditingServer}
                      dimmed={activeSlice !== null && !match}
                      highlighted={match}
                      highlightColor={activeColor}
                    />
                  );
                })}

                {rows.length === 0 && (
                  <p className="border-b border-bone/8 py-8 text-center font-mono text-xs text-ash">
                    No servers in this category yet.
                  </p>
                )}
              </div>

              {editing && (
                <button
                  onClick={() => setEditingServer(createServer(cat.id))}
                  className="btn-ghost mt-5"
                >
                  <Plus size={12} />
                  Add server to {cat.title}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <ServerEditor
        server={editingServer}
        onClose={() => setEditingServer(null)}
      />
    </section>
  );
}

function Stat({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="group bg-ink px-5 py-6 transition-colors duration-500 hover:bg-ink-2">
      <dt className="label mb-2">{label}</dt>
      <dd>
        <Counter
          value={value}
          suffix={suffix}
          className={cn(
            "display-tight block text-4xl tabular-nums sm:text-5xl",
            accent ? "text-ember" : "text-bone",
          )}
        />
      </dd>
    </div>
  );
}
