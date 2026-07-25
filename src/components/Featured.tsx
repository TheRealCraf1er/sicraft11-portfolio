import { Plus, Trash2, ImageOff } from "lucide-react";
import { motion } from "framer-motion";
import { useSite } from "../lib/store";
import { EditableText, OwnerOnly } from "./ui/Editable";
import { Reveal, RevealGroup, RevealItem } from "./ui/Reveal";
import { Counter } from "./ui/Counter";
import { ImagePicker } from "./ui/ImagePicker";
import { STATUS_STYLE, STATUSES, type Status } from "../lib/types";
import { cn, parseStat } from "../lib/utils";

/**
 * The one role that gets its own stage. Deliberately breaks the page rhythm:
 * full-bleed ember wash, oversized stat, and a ghosted repeat of the server
 * name behind everything.
 */
export function Featured() {
  const { state, updateContent, editing } = useSite();
  const { content } = state;

  const setBullet = (i: number, value: string) => {
    const next = [...content.featuredBullets];
    next[i] = value;
    updateContent({ featuredBullets: next });
  };

  const addBullet = () =>
    updateContent({
      featuredBullets: [...content.featuredBullets, "New responsibility"],
    });

  const removeBullet = (i: number) =>
    updateContent({
      featuredBullets: content.featuredBullets.filter((_, j) => j !== i),
    });

  return (
    <section id="featured" className="grain relative overflow-hidden bg-ink-2">
      {/* ember wash + texture */}
      <div className="absolute inset-0 bg-[radial-gradient(85%_70%_at_15%_0%,rgba(255,106,43,0.16),transparent_62%)]" />
      <div className="dot-grid absolute inset-0 opacity-40" />

      {/* ghosted server name */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-4 left-0 w-full overflow-hidden select-none"
      >
        <p className="display-tight wordmark-outline text-[22vw] leading-none whitespace-nowrap opacity-[0.055]">
          {content.featuredServer} {content.featuredServer}
        </p>
      </div>

      <div className="relative mx-auto max-w-[88rem] px-5 py-24 sm:px-8 md:py-32">
        {/* header rule */}
        <Reveal variant="wipe">
          <div className="flex items-baseline gap-4">
            <EditableText
              as="span"
              label="kicker"
              value={content.featuredKicker}
              onChange={(v) => updateContent({ featuredKicker: v })}
              className="label label-ember shrink-0"
            />
            <div className="hairline flex-1 translate-y-[-4px]" />
            <span className="label hidden shrink-0 sm:block">[ 01 ]</span>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ---------------- left: the story ---------------- */}
          <div className="lg:col-span-7">
            <Reveal variant="up">
              <div className="flex items-center gap-5">
                <ServerLogo
                  src={content.featuredLogo}
                  name={content.featuredServer}
                />
                <EditableText
                  as="h2"
                  label="server"
                  value={content.featuredServer}
                  onChange={(v) => updateContent({ featuredServer: v })}
                  className="display-tight text-[clamp(2.5rem,8vw,6rem)] text-bone"
                />
              </div>

              <ImagePicker
                value={content.featuredLogo}
                onChange={(url) => updateContent({ featuredLogo: url })}
                label="Server logo"
                prefix="nightvanilla-logo"
              />
            </Reveal>

            <Reveal variant="up" delay={0.08}>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                <StatusChip
                  status={content.featuredStatus}
                  editing={editing}
                  onChange={(s) => updateContent({ featuredStatus: s })}
                />
                <EditableText
                  as="span"
                  label="role"
                  value={content.featuredRole}
                  onChange={(v) => updateContent({ featuredRole: v })}
                  className="chip border-ember/50 bg-ember/10 !text-xs text-ember"
                />
                <EditableText
                  as="span"
                  label="also held"
                  value={content.featuredAlsoHeld}
                  onChange={(v) => updateContent({ featuredAlsoHeld: v })}
                  className="font-mono text-[11px] tracking-[0.14em] text-ash uppercase"
                />
                <EditableText
                  as="span"
                  label="period"
                  value={content.featuredPeriod}
                  onChange={(v) => updateContent({ featuredPeriod: v })}
                  className="font-mono text-[11px] tracking-[0.14em] text-ash uppercase"
                />
              </div>
            </Reveal>

            <Reveal variant="up" delay={0.14}>
              <EditableText
                as="p"
                label="summary"
                multiline
                value={content.featuredBody}
                onChange={(v) => updateContent({ featuredBody: v })}
                className="text-pretty mt-8 max-w-2xl text-lg leading-relaxed text-bone-2"
              />
            </Reveal>

            {/* responsibilities */}
            <div className="mt-10">
              <p className="label mb-4">Responsibilities</p>
              <RevealGroup className="space-y-3">
                {content.featuredBullets.map((b, i) => (
                  <RevealItem key={i}>
                    <div className="group flex items-start gap-3">
                      <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rotate-45 bg-ember" />
                      <EditableText
                        as="p"
                        label={`item ${i + 1}`}
                        multiline
                        value={b}
                        onChange={(v) => setBullet(i, v)}
                        className="flex-1 text-sm leading-relaxed text-bone-2/90"
                      />
                      <OwnerOnly>
                        <button
                          onClick={() => removeBullet(i)}
                          className="mt-1 shrink-0 text-ash opacity-0 transition-opacity group-hover:opacity-100 hover:text-clay"
                          title="Remove"
                        >
                          <Trash2 size={13} />
                        </button>
                      </OwnerOnly>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>

              {editing && (
                <button onClick={addBullet} className="btn-ghost mt-4 !py-2">
                  <Plus size={12} />
                  Add responsibility
                </button>
              )}
            </div>
          </div>

          {/* ---------------- right: the number ---------------- */}
          <div className="lg:col-span-5">
            <Reveal variant="scale" delay={0.2}>
              <div className="panel ticks relative p-8 sm:p-10">
                <div className="ember-bloom pointer-events-none absolute inset-8 opacity-60" />

                <div className="relative">
                  <p className="label label-ember mb-6">Reach</p>

                  {editing ? (
                    <EditableText
                      as="p"
                      label="stat"
                      value={content.featuredStat}
                      onChange={(v) => updateContent({ featuredStat: v })}
                      className="display-tight text-[clamp(3.5rem,11vw,6.5rem)] leading-none text-ember"
                    />
                  ) : (
                    <AnimatedStat
                      raw={content.featuredStat}
                      className="display-tight block text-[clamp(3.5rem,11vw,6.5rem)] leading-none text-ember tabular-nums"
                    />
                  )}

                  <EditableText
                    as="p"
                    label="stat label"
                    value={content.featuredStatLabel}
                    onChange={(v) => updateContent({ featuredStatLabel: v })}
                    className="mt-2 font-mono text-sm tracking-[0.2em] text-bone uppercase"
                  />

                  <div className="hairline my-7" />

                  <dl className="space-y-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="label">Server</dt>
                      <dd className="font-mono text-xs text-bone">
                        {content.featuredServer}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="label">Position</dt>
                      <dd className="text-right font-mono text-xs text-bone">
                        {content.featuredRole}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="label">Period</dt>
                      <dd className="font-mono text-xs text-bone">
                        {content.featuredPeriod}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="label">Standing</dt>
                      <dd>
                        <StatusChip status={content.featuredStatus} />
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/** Server logo with a monogram fallback, so an empty logo still looks designed. */
function ServerLogo({ src, name }: { src: string; name: string }) {
  const monogram = name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative shrink-0"
    >
      <div className="ember-bloom absolute -inset-3 opacity-70" />
      <div
        className="panel ticks relative grid h-20 w-20 place-items-center overflow-hidden
                   sm:h-24 sm:w-24"
      >
        {src ? (
          <img
            src={src}
            alt={`${name} logo`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-ash">
            <ImageOff size={14} />
            <span className="font-display text-lg font-bold text-bone-2">
              {monogram || "?"}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Status chip; clickable in edit mode to cycle through the four standings. */
function StatusChip({
  status,
  editing,
  onChange,
}: {
  status: Status;
  editing?: boolean;
  onChange?: (s: Status) => void;
}) {
  const style = STATUS_STYLE[status];

  const cycle = () => {
    if (!onChange) return;
    const i = STATUSES.indexOf(status);
    onChange(STATUSES[(i + 1) % STATUSES.length]);
  };

  return (
    <button
      type="button"
      onClick={editing ? cycle : undefined}
      disabled={!editing}
      title={editing ? "Click to change standing" : undefined}
      className={cn(
        "chip !text-xs",
        style.border,
        style.bg,
        style.text,
        editing && "cursor-pointer ring-1 ring-ember/40",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {status}
    </button>
  );
}

/** Renders "5,500+" as a counter that ticks up, keeping any prefix/suffix. */
function AnimatedStat({ raw, className }: { raw: string; className?: string }) {
  const { prefix, value, suffix } = parseStat(raw);

  if (value == null) return <span className={className}>{raw}</span>;

  return (
    <Counter
      value={value}
      prefix={prefix}
      suffix={suffix}
      className={className}
    />
  );
}
