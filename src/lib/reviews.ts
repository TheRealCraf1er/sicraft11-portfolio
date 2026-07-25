import { supabase, usernameToEmail } from "./supabase";
import type { Review } from "./types";

/* =============================================================================
   Reviews API.

   With Supabase configured this is real auth + a real table with RLS.
   Without it, everything falls back to localStorage so the section stays
   demo-able offline. Local mode is clearly labelled in the UI — passwords are
   NOT securely stored there and it is not meant for production.
   ============================================================================= */

const LS_REVIEWS = "sicraft11:reviews";
const LS_USERS = "sicraft11:demo-users";
const LS_CURRENT = "sicraft11:demo-current";

export interface LocalUser {
  id: string;
  username: string;
  /** Demo-mode only. Never a real credential store. */
  password: string;
}

export interface CurrentUser {
  id: string;
  username: string;
}

/* ------------------------------------------------------------------ local */

function lsRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------- auth */

export async function signUp(
  username: string,
  password: string,
): Promise<{ user: CurrentUser | null; error: string | null }> {
  const clean = username.trim();

  if (!supabase) {
    const users = lsRead<LocalUser[]>(LS_USERS, []);
    if (users.some((u) => u.username.toLowerCase() === clean.toLowerCase())) {
      return { user: null, error: "That username is already taken." };
    }
    const user: LocalUser = {
      id: `local-${Date.now().toString(36)}`,
      username: clean,
      password,
    };
    lsWrite(LS_USERS, [...users, user]);
    const current = { id: user.id, username: user.username };
    lsWrite(LS_CURRENT, current);
    return { user: current, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(clean),
    password,
    options: { data: { username: clean } },
  });

  if (error) return { user: null, error: friendlyAuthError(error.message) };
  if (!data.user) {
    return {
      user: null,
      error: "Account created but sign-in failed. Try signing in.",
    };
  }
  return { user: { id: data.user.id, username: clean }, error: null };
}

/** Sentinel the UI checks so it can offer "create it instead". */
export const NO_SUCH_ACCOUNT = "NO_SUCH_ACCOUNT";

export async function signIn(
  username: string,
  password: string,
): Promise<{ user: CurrentUser | null; error: string | null }> {
  const clean = username.trim();

  if (!supabase) {
    const users = lsRead<LocalUser[]>(LS_USERS, []);
    const found = users.find(
      (u) => u.username.toLowerCase() === clean.toLowerCase(),
    );
    // Distinguish the two failures — "wrong password" on an account that was
    // never created is the single most confusing thing this form can say.
    if (!found) return { user: null, error: NO_SUCH_ACCOUNT };
    if (found.password !== password) {
      return { user: null, error: "Wrong password for that username." };
    }
    const current = { id: found.id, username: found.username };
    lsWrite(LS_CURRENT, current);
    return { user: current, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(clean),
    password,
  });
  if (error) {
    // Supabase deliberately returns one generic message for both cases, so we
    // surface the ambiguity honestly rather than guessing.
    if (/invalid login/i.test(error.message)) {
      return { user: null, error: NO_SUCH_ACCOUNT };
    }
    return { user: null, error: friendlyAuthError(error.message) };
  }
  return {
    user: data.user ? { id: data.user.id, username: clean } : null,
    error: null,
  };
}

export async function signOut(): Promise<void> {
  if (!supabase) {
    localStorage.removeItem(LS_CURRENT);
    return;
  }
  await supabase.auth.signOut();
}

export function getLocalCurrentUser(): CurrentUser | null {
  return lsRead<CurrentUser | null>(LS_CURRENT, null);
}

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Wrong username or password.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "That username is already taken.";
  if (m.includes("password")) return "Password must be at least 6 characters.";
  if (m.includes("email"))
    return "That username isn't usable — try letters, numbers, dots or underscores.";
  return message;
}

/* ---------------------------------------------------------------- reviews */

export async function fetchReviews(): Promise<{
  reviews: Review[];
  error: string | null;
}> {
  if (!supabase) {
    const list = lsRead<Review[]>(LS_REVIEWS, []);
    return {
      reviews: [...list].sort((a, b) => b.created_at.localeCompare(a.created_at)),
      error: null,
    };
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { reviews: [], error: error.message };
  return { reviews: (data ?? []) as Review[], error: null };
}

export async function submitReview(input: {
  userId: string;
  displayName: string;
  body: string;
  rating: number | null;
  requiresApproval: boolean;
}): Promise<{ error: string | null }> {
  if (!supabase) {
    const list = lsRead<Review[]>(LS_REVIEWS, []);

    // Mirror the server-side rate limit so demo mode behaves the same.
    const recent = list.find(
      (r) =>
        r.user_id === input.userId &&
        Date.now() - new Date(r.created_at).getTime() < 10 * 60 * 1000,
    );
    if (recent) {
      return { error: "Please wait a few minutes before posting again." };
    }

    const review: Review = {
      id: `rev-${Date.now().toString(36)}`,
      user_id: input.userId,
      display_name: input.displayName,
      body: input.body,
      rating: input.rating,
      approved: !input.requiresApproval,
      created_at: new Date().toISOString(),
    };
    lsWrite(LS_REVIEWS, [review, ...list]);
    return { error: null };
  }

  const { error } = await supabase.from("reviews").insert({
    user_id: input.userId,
    display_name: input.displayName,
    body: input.body,
    rating: input.rating,
  });

  if (error) {
    if (error.message.includes("RATE_LIMIT")) {
      return { error: error.message.replace(/^.*RATE_LIMIT:\s*/, "") };
    }
    return { error: error.message };
  }
  return { error: null };
}

export async function setReviewApproval(
  id: string,
  approved: boolean,
): Promise<{ error: string | null }> {
  if (!supabase) {
    const list = lsRead<Review[]>(LS_REVIEWS, []);
    lsWrite(
      LS_REVIEWS,
      list.map((r) => (r.id === id ? { ...r, approved } : r)),
    );
    return { error: null };
  }
  const { error } = await supabase
    .from("reviews")
    .update({ approved })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteReview(id: string): Promise<{ error: string | null }> {
  if (!supabase) {
    const list = lsRead<Review[]>(LS_REVIEWS, []);
    lsWrite(LS_REVIEWS, list.filter((r) => r.id !== id));
    return { error: null };
  }
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  return { error: error?.message ?? null };
}
