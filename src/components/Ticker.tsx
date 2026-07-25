import { useSite } from "../lib/store";

/**
 * A slow marquee of every server on record — a transition band between the
 * landing and the dossier proper. Pauses on hover.
 */
export function Ticker() {
  const { state } = useSite();

  const names = state.servers.map((s) => s.name);
  if (names.length === 0) return null;

  const Row = () => (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {names.map((n, i) => (
        <span key={`${n}-${i}`} className="flex items-center gap-8">
          <span className="font-mono text-[11px] tracking-[0.18em] whitespace-nowrap text-ash uppercase">
            {n}
          </span>
          <span className="h-1 w-1 shrink-0 rotate-45 bg-ember/70" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee-host relative border-y border-bone/8 bg-ink-2/60 py-3">
      <div className="mask-fade-x flex overflow-hidden">
        <div className="marquee-track flex">
          <Row />
          <Row />
        </div>
      </div>
    </div>
  );
}
