export const STATUSES = ["Active", "Resigned", "Demoted", "Deleted"] as const;
export type Status = (typeof STATUSES)[number];

/**
 * Preset rank names offered in the editor. The role field is free-text on top
 * of these, because plenty of servers invent their own titles.
 */
export const RANK_PRESETS = [
  "Owner",
  "Co-Owner",
  "Manager",
  "Management",
  "Admin",
  "Sr. Mod",
  "Moderator",
  "Jr. Mod",
  "Helper",
  "Jr. Helper",
  "Trial Helper",
  "Staff",
  "Ticket Staff",
  "Giveaway Staff",
  "Event Manager",
  "Media Manager",
  "Media Manager Assistant",
  "Partner Manager",
  "Builder",
  "Developer",
  "Staff Applicant",
] as const;

/** Chart grouping for "what did you actually do here". */
export const RESPONSIBILITIES = [
  "In-Game Moderation",
  "Ticket & Support",
  "Community Management",
  "Event Management",
] as const;
export type Responsibility = (typeof RESPONSIBILITIES)[number];

export interface ServerEntry {
  id: string;
  name: string;
  /** Ordered — earliest role first, so progressions read left→right. */
  roles: string[];
  /** Explicit override; when absent it is derived from the roles. */
  responsibility?: Responsibility;
  periodStart: string;
  /** "Present", a date, or "" when it was a single point in time. */
  periodEnd: string;
  /** Human-readable scale, e.g. "2,400" or "442 – 2,000+" or "300+ hrs playtime". */
  members: string;
  /** Numeric value used for the relative scale bar. null = not a member count. */
  scale: number | null;
  status: Status;
  note: string;
  categoryId: string;
  order: number;
}

export interface Category {
  id: string;
  /** Mono kicker above the title, e.g. "NETWORK 01". */
  kicker: string;
  title: string;
  /** Editable context paragraph written by the owner. */
  description: string;
  order: number;
}

export interface Skill {
  id: string;
  /** lucide-react icon name, resolved via the ICONS map. */
  icon: string;
  title: string;
  body: string;
}

/** Headline figure in the landing stat strip. */
export interface HeroStat {
  id: string;
  /** Display string — the numeric part animates, e.g. "200K+" ticks to 200. */
  value: string;
  label: string;
}

export interface SiteContent {
  // --- landing ---
  coverImage: string;
  heroStats: HeroStat[];
  coverPositionY: number;
  ign: string;
  tagline: string;
  roleLine: string;
  aboutTitle: string;
  aboutBody: string;

  // --- discord identity ---
  discordTag: string;
  discordUserId: string;
  discordInvite: string;
  discordAvatarFallback: string;
  discordBannerColor: string;

  // --- featured highlight ---
  featuredKicker: string;
  featuredServer: string;
  /** Server logo URL — uploaded or pasted in owner mode. */
  featuredLogo: string;
  featuredStatus: Status;
  featuredRole: string;
  featuredAlsoHeld: string;
  featuredStat: string;
  featuredStatLabel: string;
  featuredPeriod: string;
  featuredBody: string;
  featuredBullets: string[];

  // --- skills ---
  skillsIntro: string;
  skills: Skill[];

  // --- reviews ---
  reviewsIntro: string;
  reviewsRequireApproval: boolean;

  // --- contact ---
  contactHeadline: string;
  contactBody: string;
  availabilityNote: string;

  // --- misc ---
  footerNote: string;
}

export interface SiteState {
  content: SiteContent;
  categories: Category[];
  servers: ServerEntry[];
}

export interface Review {
  id: string;
  user_id: string | null;
  display_name: string;
  body: string;
  rating: number | null;
  approved: boolean;
  created_at: string;
}

export const STATUS_STYLE: Record<
  Status,
  { text: string; border: string; bg: string; dot: string }
> = {
  Active: {
    text: "text-moss",
    border: "border-moss/40",
    bg: "bg-moss/10",
    dot: "bg-moss",
  },
  Resigned: {
    text: "text-ash",
    border: "border-ash/30",
    bg: "bg-ash/5",
    dot: "bg-ash",
  },
  Demoted: {
    text: "text-sand",
    border: "border-sand/40",
    bg: "bg-sand/10",
    dot: "bg-sand",
  },
  Deleted: {
    text: "text-clay",
    border: "border-clay/40",
    bg: "bg-clay/10",
    dot: "bg-clay",
  },
};
