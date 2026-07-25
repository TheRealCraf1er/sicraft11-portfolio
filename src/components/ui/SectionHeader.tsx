import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { cn } from "../../lib/utils";

interface SectionHeaderProps {
  /** Two-digit dossier index, e.g. "03". */
  index: string;
  title: ReactNode;
  /** Small mono text aligned to the far right of the rule. */
  meta?: ReactNode;
  className?: string;
}

/**
 * The dossier section header: bracketed index, oversized display title,
 * and a hairline that runs out to the right margin carrying a meta value.
 */
export function SectionHeader({
  index,
  title,
  meta,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn("mb-12 md:mb-16", className)}>
      <Reveal variant="wipe">
        <div className="flex items-baseline gap-4">
          <span className="label label-ember shrink-0">[ {index} ]</span>
          <div className="hairline flex-1 translate-y-[-4px]" />
          {meta && (
            <span className="label hidden shrink-0 sm:block">{meta}</span>
          )}
        </div>
      </Reveal>

      <Reveal variant="up" delay={0.08}>
        <h2 className="display-tight mt-5 text-[clamp(2.5rem,7vw,5.25rem)] text-bone">
          {title}
        </h2>
      </Reveal>
    </header>
  );
}
