import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

const SECTIONS = [
  { id: "top", index: "00", label: "Identity" },
  { id: "featured", index: "01", label: "Highlight" },
  { id: "experience", index: "02", label: "Experience" },
  { id: "skills", index: "03", label: "Skills" },
  { id: "reviews", index: "04", label: "Reviews" },
  { id: "contact", index: "05", label: "Contact" },
];

/**
 * Fixed dossier index down the left edge. Desktop only — on smaller screens
 * the page reads perfectly well as a straight scroll.
 */
export function Rail() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that is visible.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section index"
      className="rail fixed top-1/2 z-40 -translate-y-1/2"
    >
      <ul className="relative flex flex-col gap-5">
        {/* connecting line */}
        <span className="absolute top-1 bottom-1 left-[3px] w-px bg-bone/10" />

        {SECTIONS.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id} className="relative">
              <a
                href={`#${s.id}`}
                className="group relative flex h-5 w-5 items-center"
                aria-current={on ? "true" : undefined}
              >
                <span
                  className={cn(
                    "relative z-10 block h-[7px] w-[7px] shrink-0 rotate-45 transition-all duration-500",
                    on
                      ? "scale-125 bg-ember"
                      : "bg-ash-3 group-hover:bg-bone-2",
                  )}
                />

                {/*
                 * Absolutely positioned so the hidden labels never reserve
                 * layout width — otherwise the rail is ~118px wide and
                 * collides with the body text at 1700–1920px.
                 */}
                <span
                  className={cn(
                    "pointer-events-none absolute top-1/2 left-5 flex -translate-y-1/2",
                    "items-baseline gap-2 font-mono text-[10px] tracking-[0.16em] whitespace-nowrap uppercase",
                    "transition-all duration-500",
                    on
                      ? "translate-x-0 text-bone opacity-100"
                      : "-translate-x-1 text-ash opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                  )}
                >
                  <span className={on ? "text-ember" : "text-ash-2"}>
                    {s.index}
                  </span>
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
