import type { Category, ServerEntry, SiteContent, SiteState } from "./types";

/* =========================================================================
   CATEGORIES
   Descriptions are editable in owner mode — these are starting drafts.
   ========================================================================= */

export const SEED_CATEGORIES: Category[] = [
  {
    id: "general",
    kicker: "Network 01",
    title: "General Minecraft & Community Servers",
    description:
      "This is where I am now. Standalone SMPs, community hubs and giveaway servers outside the DonutSMP orbit — and the roles where I took what DonutSMP taught me and went further. More time in-game than in tickets: moderating chat, running events, managing teams and helping communities actually grow rather than just keeping them in order. Several of these are my current, active positions.",
    order: 0,
  },
  {
    id: "donut",
    kicker: "Network 02",
    title: "DonutSMP Network",
    description:
      "DonutSMP was my first real experience of staffing, and it's where I learned the job properly. Through 2025 I worked across the network's market, giveaway and hangout communities — often several at once — handling tickets, trade disputes and scam reports at volume. I've since resigned from all of them, but that stretch taught me more about moderation, pressure and fair judgement than anything since. It's the foundation everything after it is built on.",
    order: 1,
  },
];

/* =========================================================================
   SERVERS
   Statuses are first-pass assignments based on period + context.
   The owner corrects these in edit mode.
   ========================================================================= */

const RAW: Array<Omit<ServerEntry, "id" | "order">> = [
  // ---------- DonutSMP Network ----------
  {
    name: "8Bit Donut / 8Bit Giveaways",
    roles: ["Jr. Helper", "Staff"],
    periodStart: "May 2025",
    periodEnd: "",
    members: "640",
    scale: 640,
    status: "Resigned",
    note: "",
    categoryId: "donut",
  },
  {
    name: "Donut SMP Night Market",
    roles: ["Jr. Helper", "Helper", "Admin"],
    periodStart: "May 2025",
    periodEnd: "Aug 2025",
    members: "442 – 2,000+",
    scale: 2000,
    status: "Resigned",
    note: "Promoted twice over the run — joined as Jr. Helper and finished as Admin while the server grew from ~440 to 2,000+ members.",
    categoryId: "donut",
  },
  {
    name: "Donut SMP Community Trail",
    roles: ["Helper"],
    periodStart: "May 2025",
    periodEnd: "",
    members: "684",
    scale: 684,
    status: "Resigned",
    note: "",
    categoryId: "donut",
  },
  {
    name: "Donut SMP Spawner Market",
    roles: ["Helper", "Staff"],
    periodStart: "May 2025",
    periodEnd: "",
    members: "763",
    scale: 763,
    status: "Resigned",
    note: "",
    categoryId: "donut",
  },
  {
    name: "Donut SMP Fire Giveaways",
    roles: ["Staff"],
    periodStart: "May 8, 2025",
    periodEnd: "Present",
    members: "2,400",
    scale: 2400,
    status: "Resigned",
    note: "One of my longest runs on the network — staffing giveaways and keeping entries clean.",
    categoryId: "donut",
  },
  {
    name: "Donut SMP Community Market",
    roles: ["Jr. Helper"],
    periodStart: "May 2025",
    periodEnd: "",
    members: "3,400",
    scale: 3400,
    status: "Resigned",
    note: "",
    categoryId: "donut",
  },
  {
    name: "DonutSMP Hangout",
    roles: ["Helper"],
    periodStart: "May 11, 2025",
    periodEnd: "",
    members: "700+",
    scale: 700,
    status: "Resigned",
    note: "",
    categoryId: "donut",
  },
  {
    name: "Laza's Giveaways",
    roles: ["Ticket Staff", "Partner Manager"],
    periodStart: "May 27, 2025",
    periodEnd: "Late 2025",
    members: "6,000 – 7,725",
    scale: 7725,
    status: "Resigned",
    note: "Ran ticket support and managed partner relationships as the server climbed past 7.7k members.",
    categoryId: "donut",
  },
  {
    name: "DonutSMP Trusted Market",
    roles: ["Ticket Staff", "Helper"],
    periodStart: "May 2025",
    periodEnd: "Aug 2025",
    members: "10,000",
    scale: 10000,
    status: "Resigned",
    note: "The largest community I've staffed — high-volume trade tickets and scam reports.",
    categoryId: "donut",
  },
  {
    name: "DonutSMP Premium Market",
    roles: ["Moderator"],
    periodStart: "Mid 2025",
    periodEnd: "",
    members: "2,300",
    scale: 2300,
    status: "Resigned",
    note: "",
    categoryId: "donut",
  },
  {
    name: "Capital Donut",
    roles: ["Helper"],
    periodStart: "Mid 2025",
    periodEnd: "",
    members: "3,400",
    scale: 3400,
    status: "Resigned",
    note: "",
    categoryId: "donut",
  },
  {
    name: "DonutSMP Empire",
    roles: ["Helper"],
    periodStart: "Mid 2025",
    periodEnd: "",
    members: "2,300",
    scale: 2300,
    status: "Resigned",
    note: "",
    categoryId: "donut",
  },
  {
    name: "Berry DonutSMP",
    roles: ["Staff Applicant"],
    periodStart: "May 8, 2025",
    periodEnd: "",
    members: "N/A",
    scale: null,
    status: "Resigned",
    note: "Application submitted — listed for completeness, not a held role.",
    categoryId: "donut",
  },

  // ---------- General Minecraft / Community ----------
  {
    name: "Cozy Hangout",
    roles: ["Moderator"],
    periodStart: "May 2025",
    periodEnd: "Late 2025",
    members: "177",
    scale: 177,
    status: "Resigned",
    note: "Small, tight-knit community — chat moderation and day-to-day member support.",
    categoryId: "general",
  },
  {
    name: "Bob's Crew",
    roles: ["Moderator"],
    periodStart: "July 2025",
    periodEnd: "Aug 2025",
    members: "3,400",
    scale: 3400,
    status: "Resigned",
    note: "",
    categoryId: "general",
  },
  {
    name: "Agekka's Den",
    roles: ["Moderator"],
    periodStart: "Sept 10, 2025",
    periodEnd: "Present",
    members: "N/A",
    scale: null,
    status: "Active",
    note: "",
    categoryId: "general",
  },
  {
    name: "EuropeMC / EuropeMC Giveaways",
    roles: ["Staff", "Helper", "High Staff Trial"],
    periodStart: "July 2025",
    periodEnd: "Feb 2026",
    members: "300+ hrs playtime",
    scale: null,
    status: "Resigned",
    note: "My deepest in-game commitment — 300+ hours of playtime, ending on a High Staff trial.",
    categoryId: "general",
  },
  {
    name: "TenneOG's",
    roles: ["Moderator", "Staff"],
    periodStart: "Nov 18, 2025",
    periodEnd: "Present",
    members: "N/A",
    scale: null,
    status: "Active",
    note: "",
    categoryId: "general",
  },
  {
    name: "Sausage SMP",
    roles: ["Staff"],
    periodStart: "Late 2025",
    periodEnd: "",
    members: "N/A",
    scale: null,
    status: "Resigned",
    note: "Staffed across two separate seasons — Season 2 and Season 5.",
    categoryId: "general",
  },
  {
    name: "LiteMC / LiteMC Giveaways",
    roles: ["Giveaway Staff", "Helper"],
    periodStart: "Feb 23, 2026",
    periodEnd: "Present",
    members: "N/A",
    scale: null,
    status: "Active",
    note: "",
    categoryId: "general",
  },
  {
    name: "Shop Survival",
    roles: ["Event Manager", "Management"],
    periodStart: "Feb 27, 2026",
    periodEnd: "Present",
    members: "N/A",
    scale: null,
    status: "Active",
    note: "Planning and running community events on the management team.",
    categoryId: "general",
  },
  {
    name: "RuneMC",
    roles: ["Manager", "Admin"],
    periodStart: "March 4, 2026",
    periodEnd: "Present",
    members: "N/A (Pre-release)",
    scale: null,
    status: "Active",
    note: "Joined pre-release — helping shape staff structure and systems before launch.",
    categoryId: "general",
  },
  {
    name: "ClassicMC",
    roles: ["Staff Applicant"],
    periodStart: "July 16, 2025",
    periodEnd: "",
    members: "N/A",
    scale: null,
    status: "Resigned",
    note: "Application submitted — listed for completeness, not a held role.",
    categoryId: "general",
  },
  {
    name: "Astral's Giveaways",
    roles: ["Staff Applicant"],
    periodStart: "July 22, 2025",
    periodEnd: "",
    members: "N/A",
    scale: null,
    status: "Resigned",
    note: "Application submitted — listed for completeness, not a held role.",
    categoryId: "general",
  },

  // ---------- Featured (rendered in its own section) ----------
  {
    name: "NightVanilla",
    roles: ["Helper", "Admin", "Media Manager Assistant"],
    periodStart: "April 2026",
    periodEnd: "June 2026",
    members: "5,500+ Unique Joins",
    scale: 5500,
    status: "Deleted",
    note: "Grew past 5,500 unique joins before the server was sold on and deleted by its new owner.",
    categoryId: "featured",
  },
];

export const SEED_SERVERS: ServerEntry[] = RAW.map((s, i) => ({
  ...s,
  id: `srv-${String(i + 1).padStart(2, "0")}`,
  order: i,
}));

/* =========================================================================
   SITE COPY — all editable in owner mode.
   ========================================================================= */

export const SEED_CONTENT: SiteContent = {
  coverImage: "",
  coverPositionY: 50,
  heroStats: [
    { id: "hs-1", value: "106", label: "Servers managed" },
    { id: "hs-2", value: "200K+", label: "Players managed" },
    { id: "hs-3", value: "1+", label: "Years staffing" },
  ],
  ign: "SiCraft11",
  tagline: "Minecraft & Discord staff — moderation, community, and the small bots that keep both running.",
  roleLine: "Moderator · Admin · Media Manager Assistant",
  aboutTitle: "About Me",
  aboutBody:
    "I've spent the last year staffing Minecraft and Discord communities, from 170-member hangouts to 10,000-member trade hubs. Most of that time has gone into tickets, chat moderation and keeping markets honest — and when a job started repeating itself, I built a small Discord bot to take it off the team's plate. I like the unglamorous side of staffing: consistent rules, fast ticket turnaround, and a server that still feels calm at 2am.",

  discordTag: "thecraft04",
  discordUserId: "1322504518990037032",
  discordInvite: "",
  discordAvatarFallback: "",
  discordBannerColor: "#5865F2",

  featuredKicker: "Career Highlight",
  featuredServer: "NightVanilla",
  featuredLogo: "",
  featuredStatus: "Deleted",
  featuredRole: "Media Manager Assistant",
  featuredAlsoHeld: "Also held: Helper · Admin",
  featuredStat: "5,500+",
  featuredStatLabel: "Unique Joins",
  featuredPeriod: "April 2026 & June 2026",
  featuredBody:
    "NightVanilla is the role I point to first — and the one that still hurts. Me and the rest of the staff team put months into that server. We were on it every day, watching it grow from nothing into something people actually wanted to log into. I came in as Helper, worked up to Admin, and ended up assisting the Media Manager on the content that pulled players through the door. Together we took it past 5,500 unique joins. Then it died right in front of us. The activity drained away, the server got sold, and the new owner deleted it. Months of work from the whole team, gone overnight. I'd still take that job again tomorrow.",
  featuredBullets: [
    "Assisted media planning and content scheduling across the server's public channels",
    "Coordinated announcements, event promos and release posts with the staff team",
    "Kept branding and messaging consistent as the player base scaled",
    "Handled Helper and Admin responsibilities in parallel with the media role",
  ],

  skillsIntro:
    "Four things I'm consistently good at, and the reason servers keep me around.",
  skills: [
    {
      id: "sk-1",
      icon: "bot",
      title: "Custom Discord Bots",
      body: "I build small, focused bots that take the repetitive work off a staff team — ticket tooling, giveaway handling, logging and automated checks. Nothing bloated; just the specific job that was eating everyone's time.",
    },
    {
      id: "sk-2",
      icon: "shield",
      title: "In-Game Moderation",
      body: "Chat and gameplay moderation with a consistent hand. Clear warnings, proportionate punishments, and proper evidence logging so decisions hold up when someone appeals them.",
    },
    {
      id: "sk-3",
      icon: "users",
      title: "Community Management",
      body: "Keeping a server's tone steady as it grows. Running events, settling disputes before they escalate, and making new members feel like there's a reason to stay past day one.",
    },
    {
      id: "sk-4",
      icon: "ticket",
      title: "Ticket Handling",
      body: "High-volume ticket support across trade markets and giveaway servers — scam reports, trade disputes, appeals and general help, answered fast and documented properly.",
    },
  ],

  reviewsIntro:
    "Worked with me on a server? Make an account and leave an honest word — good or bad.",
  reviewsRequireApproval: false,

  contactHeadline: "Let's talk staff positions.",
  contactBody:
    "I'm open to staff and management roles on Minecraft servers and Discord communities. Add me on Discord and tell me what you're building — I'll get back to you quickly.",
  availabilityNote: "Currently available for hire",

  footerNote: "Built and maintained by SiCraft11.",
};

export const SEED_STATE: SiteState = {
  content: SEED_CONTENT,
  categories: SEED_CATEGORIES,
  servers: SEED_SERVERS,
};
