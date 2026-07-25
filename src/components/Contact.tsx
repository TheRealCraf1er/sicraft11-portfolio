import { useState } from "react";
import { Check, Copy, ArrowUpRight, ArrowUp } from "lucide-react";
import { useSite } from "../lib/store";
import { EditableText } from "./ui/Editable";
import { Reveal } from "./ui/Reveal";
import { DiscordCard } from "./landing/DiscordCard";

export function Contact() {
  const { state, updateContent } = useSite();
  const { content } = state;
  const [copied, setCopied] = useState(false);

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
    <footer
      id="contact"
      className="grain relative overflow-hidden border-t border-bone/8 bg-ink-2"
    >
      <div className="absolute inset-0 bg-[radial-gradient(75%_65%_at_50%_115%,rgba(255,106,43,0.2),transparent_65%)]" />
      <div className="blueprint-grid absolute inset-0 opacity-60" />

      <div className="relative mx-auto max-w-[88rem] px-5 pt-24 pb-10 sm:px-8 md:pt-32">
        <Reveal variant="wipe">
          <div className="flex items-baseline gap-4">
            <span className="label label-ember shrink-0">[ 05 ] — Contact</span>
            <div className="hairline flex-1 translate-y-[-4px]" />
          </div>
        </Reveal>

        <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* ---------------- left ---------------- */}
          <div className="lg:col-span-7">
            <Reveal variant="up">
              {/* availability pill */}
              <div className="mb-8 inline-flex items-center gap-2.5 border border-moss/35 bg-moss/8 px-3 py-1.5">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-moss" />
                <EditableText
                  as="span"
                  label="availability"
                  value={content.availabilityNote}
                  onChange={(v) => updateContent({ availabilityNote: v })}
                  className="font-mono text-[10px] tracking-[0.18em] text-moss uppercase"
                />
              </div>
            </Reveal>

            <Reveal variant="up" delay={0.06}>
              <EditableText
                as="h2"
                label="headline"
                multiline
                value={content.contactHeadline}
                onChange={(v) => updateContent({ contactHeadline: v })}
                className="display-tight text-[clamp(2.75rem,8vw,6rem)] text-bone"
              />
            </Reveal>

            <Reveal variant="up" delay={0.12}>
              <EditableText
                as="p"
                label="closing"
                multiline
                value={content.contactBody}
                onChange={(v) => updateContent({ contactBody: v })}
                className="text-pretty mt-7 max-w-xl text-lg leading-relaxed text-bone-2"
              />
            </Reveal>

            {/* the tag, front and centre */}
            <Reveal variant="up" delay={0.18}>
              <div className="mt-10">
                <p className="label mb-3">Discord</p>

                <span className="glow-host-block max-w-lg">
                  <span className="glow-orb" aria-hidden />
                  <button
                    onClick={copyTag}
                    className="group flex w-full items-center justify-between gap-4
                               border border-bone/12 bg-ink/60 px-5 py-5 text-left
                               transition-all duration-500 hover:border-ember/60 hover:bg-ember/6"
                  >
                  <span className="display-tight truncate text-[clamp(1.75rem,5vw,3rem)] text-bone">
                    {content.discordTag}
                  </span>

                  <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase">
                    {copied ? (
                      <>
                        <Check size={14} className="text-moss" />
                        <span className="text-moss">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy
                          size={14}
                          className="text-ash transition-colors group-hover:text-ember"
                        />
                        <span className="text-ash transition-colors group-hover:text-bone">
                          Copy
                        </span>
                      </>
                    )}
                    </span>
                  </button>
                </span>

                {content.discordInvite && (
                  <span className="glow-host mt-4">
                    <span className="glow-orb" aria-hidden />
                    <a
                      href={content.discordInvite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ember"
                    >
                      Open my profile
                      <ArrowUpRight size={13} />
                    </a>
                  </span>
                )}
              </div>
            </Reveal>
          </div>

          {/* ---------------- right ---------------- */}
          <div className="lg:col-span-5">
            <Reveal variant="scale" delay={0.2}>
              <DiscordCard content={content} />
            </Reveal>

            <Reveal variant="up" delay={0.28}>
              <dl className="mt-5 divide-y divide-bone/8 border border-bone/10">
                <Row label="IGN" value={content.ign} />
                <Row label="Discord" value={content.discordTag} />
                <Row
                  label="Servers staffed"
                  value={String(state.servers.length)}
                />
                <Row
                  label="Currently active"
                  value={String(
                    state.servers.filter((s) => s.status === "Active").length,
                  )}
                />
              </dl>
            </Reveal>
          </div>
        </div>

        {/* ---------------- footer bar ---------------- */}
        <div className="mt-24 flex flex-col items-start justify-between gap-4 border-t border-bone/8 pt-6 sm:flex-row sm:items-center">
          <EditableText
            as="p"
            label="footer"
            value={content.footerNote}
            onChange={(v) => updateContent({ footerNote: v })}
            className="font-mono text-[10px] tracking-[0.14em] text-ash-2 uppercase"
          />

          <a
            href="#top"
            className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em]
                       text-ash uppercase transition-colors hover:text-ember"
          >
            Back to top
            <ArrowUp size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="label">{label}</dt>
      <dd className="truncate font-mono text-xs text-bone">{value}</dd>
    </div>
  );
}
