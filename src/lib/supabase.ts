import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, KEY_PLACEHOLDER } from "./config";

const url = SUPABASE_URL;
const anonKey = SUPABASE_ANON_KEY;

/**
 * The site is fully usable without Supabase — it falls back to seed data plus
 * localStorage so the owner can build and preview offline. Supplying the config
 * in `config.ts` (or via env vars) upgrades it to real auth + shared persistence.
 */
export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    url.startsWith("http") &&
    anonKey !== KEY_PLACEHOLDER,
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
