import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Check, Copy, ArrowDown, ImageOff, Loader2 } from "lucide-react";
import { useSite } from "../../lib/store";
import { EditableText } from "../ui/Editable";
import { StatCounter } from "../ui/Counter";
import { DiscordCard } from "./DiscordCard";
import { CoverControl } from "./CoverControl";
import type { HeroStat } from "../../lib/types";

// three.js is heavy — keep it out of the initial bundle so the landing paints fast.
const SkinViewer = lazy(() =>
  import("./SkinViewer").then((m) => ({ default: m.SkinViewer })),
);

/** Frame placeholder that matches the viewer's footprint, avoiding layout shift. */
function SkinViewerFallback() {
  return (
    <figure className="m-0">
      <div className="panel ticks">
        <div className="flex items-center justify-between border-b border-bone/8 px-3 py-2">
          <span className="label label-ember">Specimen · Skin</span>
        </div>
        <div className="dot-grid grid h-[300px] w-full place-items-center sm:h-[380px] lg:h-[min(480px,46vh)]">
          <Loader2 className="animate-spin text-ember" size={20} />
        </div>
        <div className="h-[33px] border-t border-bone/8" />
      </div>
      <figcaption className="mt-3 h-5" />
    </figure>
  );
}

/** Splits a trailing number off an IGN so it can be accented. */
function splitIgn(ign: string): [string, string] {
  const m = ign.match(/^(.*?)(\d+)$/);
  return m ? [m[1], m[2]] : [ign, ""];
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function Landing() {
  const { state, updateContent, editing } = useSite();
  const { content } = state;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const now = useClock();
  const [copied, setCopied] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.16]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const [namePart, numPart] = splitIgn(content.ign);

  const setHeroStat = (id: string, patch: Partial<HeroStat>) =>
    updateContent({
      heroStats: content.heroStats.map((s) =>
        s.id === id ? { ...s, ...patch } : s,
      ),
    });

  const copyTag = async () => {
    try {
      await navigator.clipboard.writeText(content.discordTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <section
      ref={ref}
      id="top"
      className="grain relative flex min-h-svh flex-col overflow-hidden"
    >
      {/* ================= background ================= */}
      <motion.div
        className="absolute inset-0 -z-20"
        style={reduce ? undefined : { y: bgY, scale: bgScale }}
      >
        {content.coverImage ? (
          <img
            src={content.coverImage}
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: `50% ${content.coverPositionY}%` }}
          />
        ) : (
          <div className="blueprint-grid h-full w-full bg-ink">
            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_78%_12%,rgba(255,106,43,0.22),transparent_58%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_12%_92%,rgba(88,101,242,0.16),transparent_60%)]" />
          </div>
        )}
      </motion.div>

      {/* grading: darken for legibility, warm the highlights, vignette */}
      <div className="absolute inset-0 -z-10 bg-ink/38" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/28 to-ink/52" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(100%_75%_at_50%_50%,transparent_30%,rgba(7,8,12,0.7)_100%)]" />
      <div className="absolute inset-0 -z-10 mix-blend-soft-light bg-[radial-gradient(60%_50%_at_80%_20%,rgba(255,106,43,0.5),transparent_70%)]" />

      <CoverControl />

      {editing && !content.coverImage && (
        <div className="pointer-events-none absolute inset-x-0 top-28 z-30 flex justify-center">
          <span className="flex items-center gap-2 border border-ember/40 bg-ink/80 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-ember uppercase backdrop-blur">
            <ImageOff size={11} />
            No cover set — upload one top-left
          </span>
        </div>
      )}

      {/* ================= top meta bar ================= */}
      <div className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <span className="label">
          Staff Dossier
          <span className="mx-2 text-ember">/</span>
          Ref SC-11
        </span>
        <span className="label tabular-nums">
          {now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })}
        </span>
      </div>

      {/* ================= main ================= */}
      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-[88rem] flex-1 items-center px-5 pb-[clamp(3.75rem,9vh,7rem)] sm:px-8"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-20 xl:gap-28">
          {/* ---------- identity ---------- */}
          <div className="lg:col-span-7">
            <motion.p
              className="label label-ember mb-6"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              [ 00 ] — Identity
            </motion.p>

            <motion.h1
              className="wordmark-hero text-[clamp(3rem,min(12vw,17vh),9.5rem)] text-bone"
              initial={{ opacity: 0, y: 30, clipPath: "inset(0 0 100% 0)" }}
              animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {namePart}
              {numPart && <span className="text-ember flicker">{numPart}</span>}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="hero-gap-sm flex items-center gap-3">
                <span className="h-px w-10 bg-ember" />
                <EditableText
                  as="p"
                  label="roles"
                  value={content.roleLine}
                  onChange={(v) => updateContent({ roleLine: v })}
                  className="font-mono text-[11px] tracking-[0.2em] text-bone-2 uppercase"
                />
              </div>

              <EditableText
                as="p"
                label="tagline"
                multiline
                value={content.tagline}
                onChange={(v) => updateContent({ tagline: v })}
                className="text-pretty hero-gap-md max-w-xl text-lg leading-relaxed text-bone-2 sm:text-xl"
              />

              {/* about me */}
              <div className="hero-gap-md max-w-xl border-l-2 border-ember/50 pl-6">
                <EditableText
                  as="p"
                  label="about title"
                  value={content.aboutTitle}
                  onChange={(v) => updateContent({ aboutTitle: v })}
                  className="label label-ember mb-2"
                />
                <EditableText
                  as="p"
                  label="about"
                  multiline
                  value={content.aboutBody}
                  onChange={(v) => updateContent({ aboutBody: v })}
                  className="text-pretty text-sm leading-relaxed text-bone-2/90"
                />
              </div>

              {/* CTAs */}
              <div className="hero-gap-lg flex flex-wrap items-center gap-4">
                <span className="glow-host">
                  <span className="glow-orb" aria-hidden />
                  <button onClick={copyTag} className="btn-ember">
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Tag copied" : `Add me — ${content.discordTag}`}
                  </button>
                </span>

                <span className="glow-host">
                  <span className="glow-orb glow-orb-cool" aria-hidden />
                  <a href="#experience" className="btn-ghost">
                    See the record
                    <ArrowDown size={13} />
                  </a>
                </span>
              </div>

              {/* headline figures */}
              <dl className="panel hero-gap-md grid max-w-xl grid-cols-3 divide-x divide-bone/10">
                {content.heroStats.map((stat, i) => (
                  <div key={stat.id} className="px-3 py-3.5 sm:px-4">
                    {editing ? (
                      <EditableText
                        as="dd"
                        label="figure"
                        value={stat.value}
                        onChange={(v) => setHeroStat(stat.id, { value: v })}
                        className="display-tight text-[clamp(1.35rem,4vw,2.15rem)] text-ember"
                      />
                    ) : (
                      <dd>
                        <StatCounter
                          raw={stat.value}
                          duration={1.6 + i * 0.2}
                          className="display-tight block text-[clamp(1.35rem,4vw,2.15rem)] text-ember tabular-nums"
                        />
                      </dd>
                    )}

                    <EditableText
                      as="dt"
                      label="caption"
                      value={stat.label}
                      onChange={(v) => setHeroStat(stat.id, { label: v })}
                      className="mt-1 font-mono text-[9px] leading-tight tracking-[0.14em] text-ash uppercase sm:text-[10px]"
                    />
                  </div>
                ))}
              </dl>
            </motion.div>
          </div>

          {/* ---------- specimen + discord ---------- */}
          <motion.div
            className="space-y-5 lg:col-span-5"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Suspense fallback={<SkinViewerFallback />}>
              <SkinViewer ign={content.ign} />
            </Suspense>
            <DiscordCard content={content} />
          </motion.div>
        </div>
      </motion.div>

      {/* ================= scroll cue ================= */}
      <motion.a
        href="#featured"
        className="absolute inset-x-0 bottom-6 z-10 mx-auto flex w-fit flex-col items-center gap-2"
        style={reduce ? undefined : { opacity: contentOpacity }}
        aria-label="Scroll to content"
      >
        <span className="label">Scroll</span>
        <span className="relative block h-10 w-px overflow-hidden bg-bone/15">
          <span className="cue-bead absolute inset-x-0 top-0 block h-4 bg-ember" />
        </span>
      </motion.a>
    </section>
  );
}
