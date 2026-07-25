import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * The site is fully usable without Supabase — it falls back to seed data plus
 * localStorage so the owner can build and preview offline. Wiring up the two
 * env vars upgrades it to real auth + shared persistence with no code changes.
 */
export const isSupabaseConfigured = Boolean(
  url && anonKey && url.startsWith("http"),
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Reviewers sign up with a username, not an email. Supabase Auth requires an
 * email, so we deterministically synthesise one. The user never sees it.
 */
export const AUTH_EMAIL_DOMAIN =
  (import.meta.env.VITE_AUTH_EMAIL_DOMAIN as string | undefined) ??
  "users.sicraft11.app";

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_.-]{3,24}$/.test(username.trim());
}

/** Local-only fallback PIN, used when Supabase is not configured. */
export const LOCAL_ADMIN_PIN =
  (import.meta.env.VITE_ADMIN_PIN as string | undefined) ?? "sicraft-owner";

export const STORAGE_BUCKET = "site-assets";
