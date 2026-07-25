import {
  Bot,
  Shield,
  Users,
  Ticket,
  Wrench,
  MessageSquare,
  Gavel,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useSite } from "../lib/store";
import { SectionHeader } from "./ui/SectionHeader";
import { EditableText } from "./ui/Editable";
import { RevealGroup, RevealItem, Reveal } from "./ui/Reveal";
import { cn } from "../lib/utils";

const ICONS: Record<string, LucideIcon> = {
  bot: Bot,
  shield: Shield,
  users: Users,
  ticket: Ticket,
  wrench: Wrench,
  message: MessageSquare,
  gavel: Gavel,
  sparkles: Sparkles,
};

const ICON_KEYS = Object.keys(ICONS);

export function Skills() {
  const { state, updateContent, editing } = useSite();
  const { skills } = state.content;

  const setSkill = (id: string, patch: Partial<(typeof skills)[number]>) =>
    updateContent({
      skills: skills.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });

  const cycleIcon = (id: string, current: string) => {
    const i = ICON_KEYS.indexOf(current);
    setSkill(id, { icon: ICON_KEYS[(i + 1) % ICON_KEYS.length] });
  };

  return (
    <section
      id="skills"
      className="relative overflow-hidden border-t border-bone/8 bg-ink-2"
    >
      <div className="dot-grid absolute inset-0 opacity-30" />

      <div className="relative mx-auto max-w-[88rem] px-5 py-24 sm:px-8 md:py-32">
        <SectionHeader
          index="03"
          title={
            <>
              What I&apos;m
              <br />
              <span className="text-ember">good at</span>
            </>
          }
          meta="Core strengths"
        />

        <Reveal variant="up">
          <EditableText
            as="p"
            label="intro"
            multiline
            value={state.content.skillsIntro}
            onChange={(v) => updateContent({ skillsIntro: v })}
            className="text-pretty -mt-4 mb-14 max-w-2xl text-lg text-bone-2"
          />
        </Reveal>

        <RevealGroup
          className="grid gap-px border border-bone/8 bg-bone/8 md:grid-cols-2"
          stagger={0.09}
        >
          {skills.map((skill, i) => {
            const Icon = ICONS[skill.icon] ?? Sparkles;

            return (
              <RevealItem key={skill.id}>
                <article
                  className={cn(
                    "group relative h-full bg-ink-2 p-8 transition-colors duration-500 sm:p-10",
                    "hover:bg-ink-3",
                  )}
                >
                  {/* corner index */}
                  <span
                    className="absolute top-6 right-7 font-mono text-[11px] tabular-nums text-ash-2
                               transition-colors duration-500 group-hover:text-ember"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* icon */}
                  <button
                    onClick={() => editing && cycleIcon(skill.id, skill.icon)}
                    disabled={!editing}
                    title={editing ? "Click to change icon" : undefined}
                    className={cn(
                      "mb-7 grid h-12 w-12 place-items-center border border-bone/12",
                      "text-ember transition-all duration-500",
                      "group-hover:border-ember/50 group-hover:bg-ember/10",
                      editing && "cursor-pointer hover:!border-ember",
                    )}
                  >
                    <Icon size={20} strokeWidth={1.6} />
                  </button>

                  <EditableText
                    as="h3"
                    label="title"
                    value={skill.title}
                    onChange={(v) => setSkill(skill.id, { title: v })}
                    className="font-display text-2xl leading-tight font-semibold text-bone sm:text-[1.75rem]"
                  />

                  <EditableText
                    as="p"
                    label="description"
                    multiline
                    value={skill.body}
                    onChange={(v) => setSkill(skill.id, { body: v })}
                    className="text-pretty mt-4 text-sm leading-relaxed text-bone-2/85"
                  />

                  {/* bottom sweep */}
                  <span
                    className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0
                               bg-gradient-to-r from-ember to-transparent transition-transform
                               duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                  />
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
