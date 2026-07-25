/**
 * Public Supabase configuration.
 *
 * ---------------------------------------------------------------------------
 * WHY THESE VALUES LIVE IN THE REPO
 * ---------------------------------------------------------------------------
 * Both values below are PUBLIC BY DESIGN. Vite inlines them into the JavaScript
 * bundle that every visitor downloads, so they are already readable by anyone
 * who opens devtools on the live site. Committing them here exposes nothing new.
 *
 * What actually protects the database is Row Level Security — see
 * `supabase/schema.sql`, where every write is gated behind the `admins` table.
 *
 * NEVER put the `service_role` / `sb_secret_...` key here. That one bypasses
 * RLS entirely and must never reach the browser.
 * ---------------------------------------------------------------------------
 *
 * Environment variables still win when present, so hosting platforms that do
 * inject them correctly keep working without a code change.
 */

const FALLBACK_SUPABASE_URL = "https://qlyibmniwctbmnoqkvjv.supabase.co";

// 👇 PASTE YOUR PUBLISHABLE KEY BETWEEN THE QUOTES (starts with "sb_publishable_")
const FALLBACK_SUPABASE_ANON_KEY = "sb_publishable__O0_CuJrl1-J8kAXpMet7g_eWJUwFWj";

/** Sentinel so an unfilled placeholder counts as "not configured". */
export const KEY_PLACEHOLDER = "PASTE_YOUR_PUBLISHABLE_KEY_HERE";

const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const envKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
)?.trim();

export const SUPABASE_URL = envUrl || FALLBACK_SUPABASE_URL;
export const SUPABASE_ANON_KEY = envKey || FALLBACK_SUPABASE_ANON_KEY;
