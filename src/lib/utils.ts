import clsx, { type ClassValue } from "clsx";
import type { Responsibility, ServerEntry } from "./types";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

/**
 * Best-guess primary responsibility from the rank names held.
 * Order matters — the most specific signal wins. The owner can override this
 * per entry in the editor, which is why `responsibility` is optional on the model.
 */
export function deriveResponsibility(s: ServerEntry): Responsibility {
  if (s.responsibility) return s.responsibility;

  const roles = s.roles.join(" ").toLowerCase();
  const name = s.name.toLowerCase();

  // 1. An explicit rank name is the strongest signal.
  if (/event/.test(roles)) return "Event Management";
  if (/ticket/.test(roles)) return "Ticket & Support";
  if (/media|partner|manager|management/.test(roles))
    return "Community Management";

  // 2. Otherwise the server's nature decides what a "Helper" actually did.
  //    On a trade market that means disputes and tickets, not chat moderation.
  if (/market|trade|shop/.test(name)) return "Ticket & Support";
  if (/giveaway/.test(name) || /giveaway/.test(roles))
    return "Event Management";

  // 3. Senior ranks on a general server means running the place.
  if (/admin|owner/.test(roles)) return "Community Management";

  return "In-Game Moderation";
}

/**
 * Chart + legend colours. Kept as literal hex (mirroring the `@theme` tokens in
 * index.css) rather than `var(--…)` so they can be suffixed with an alpha pair
 * — `color-mix()` against a var collapses to transparent in inline styles.
 */
export const RESPONSIBILITY_COLOR: Record<Responsibility, string> = {
  "In-Game Moderation": "#ff6a2b", // --color-ember
  "Ticket & Support": "#5865f2", // --color-blurple
  "Community Management": "#7be05a", // --color-moss
  "Event Management": "#e8b33a", // --color-sand
};

export const CATEGORY_COLOR: Record<string, string> = {
  general: "#ff6a2b", // --color-ember
  donut: "#5865f2", // --color-blurple
  featured: "#7be05a", // --color-moss
};

/** Appends an 8-bit alpha pair to a 6-digit hex colour. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}

/**
 * Splits a display stat like "5,500+" into its animatable number and the
 * decorative text around it, so counters can tick up without losing the "+".
 */
export function parseStat(raw: string): {
  prefix: string;
  value: number | null;
  suffix: string;
} {
  const m = raw.match(/^(\D*)([\d,.\s]+)(.*)$/);
  if (!m) return { prefix: raw, value: null, suffix: "" };

  const numeric = Number(m[2].replace(/[,\s]/g, ""));
  if (!Number.isFinite(numeric)) return { prefix: raw, value: null, suffix: "" };

  return { prefix: m[1], value: numeric, suffix: m[3] };
}

/** "May 2025" + "Present" → "May 2025 → Present"; end-less entries stay single. */
export function formatPeriod(s: Pick<ServerEntry, "periodStart" | "periodEnd">) {
  const start = s.periodStart?.trim();
  const end = s.periodEnd?.trim();
  if (start && end) return `${start} → ${end}`;
  return start || end || "—";
}

export function isOngoing(s: Pick<ServerEntry, "periodEnd">) {
  return s.periodEnd?.trim().toLowerCase() === "present";
}

/** Applications aren't held roles — they get a distinct visual treatment. */
export function isApplication(s: Pick<ServerEntry, "roles">) {
  return s.roles.some((r) => r.toLowerCase().includes("applicant"));
}

/**
 * Relative width for the scale bar. Square-rooted so a 177-member server is
 * still visible next to a 10,000-member one.
 */
export function scaleWidth(value: number | null, max: number): number {
  if (!value || value <= 0 || max <= 0) return 0;
  return Math.max(4, Math.round(Math.sqrt(value / max) * 100));
}

export function maxScale(servers: ServerEntry[]): number {
  return servers.reduce((m, s) => Math.max(m, s.scale ?? 0), 0);
}

/** Compact member count for the ledger, e.g. 7725 → "7.7k". */
export function compact(value: number | null): string {
  if (value == null) return "—";
  if (value >= 1000) {
    const k = value / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(value);
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Deterministic accent index so each reviewer gets a stable avatar tint. */
export function hashIndex(seed: string, buckets: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % buckets;
}

export function initials(name: string): string {
  const parts = name.trim().split(/[\s_.-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
