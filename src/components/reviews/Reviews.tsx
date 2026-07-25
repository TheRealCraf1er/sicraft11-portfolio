import { useCallback, useEffect, useMemo, useState } from "react";
import { Star, LogOut, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { useSite } from "../../lib/store";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal, RevealGroup, RevealItem } from "../ui/Reveal";
import { EditableText } from "../ui/Editable";
import { ReviewCard } from "./ReviewCard";
import {
  fetchReviews,
  signIn,
  signOut,
  signUp,
  submitReview,
  setReviewApproval,
  deleteReview,
  getLocalCurrentUser,
  NO_SUCH_ACCOUNT,
  type CurrentUser,
} from "../../lib/reviews";
import { isValidUsername } from "../../lib/supabase";
import type { Review } from "../../lib/types";
import { cn } from "../../lib/utils";

export function Reviews() {
  const { state, updateContent, session, backend, isAdmin, editing } = useSite();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [localUser, setLocalUser] = useState<CurrentUser | null>(() =>
    typeof window === "undefined" ? null : getLocalCurrentUser(),
  );

  const currentUser: CurrentUser | null = useMemo(() => {
    if (backend === "supabase") {
      if (!session?.user) return null;
      const meta = session.user.user_metadata as { username?: string } | undefined;
      return {
        id: session.user.id,
        username:
          meta?.username ?? session.user.email?.split("@")[0] ?? "member",
      };
    }
    return localUser;
  }, [backend, session, localUser]);

  const load = useCallback(async () => {
    setLoading(true);
    const { reviews: list } = await fetchReviews();
    setReviews(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, currentUser?.id]);

  const visible = useMemo(
    () =>
      reviews.filter(
        (r) => r.approved || isAdmin || r.user_id === currentUser?.id,
      ),
    [reviews, isAdmin, currentUser],
  );

  const averageRating = useMemo(() => {
    const rated = reviews.filter((r) => r.approved && r.rating);
    if (rated.length === 0) return null;
    return (
      rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length
    ).toFixed(1);
  }, [reviews]);

  const handleToggleApproval = async (r: Review) => {
    await setReviewApproval(r.id, !r.approved);
    load();
  };

  const handleDelete = async (r: Review) => {
    await deleteReview(r.id);
    load();
  };

  return (
    <section
      id="reviews"
      className="relative mx-auto max-w-[88rem] px-5 py-24 sm:px-8 md:py-32"
    >
      <SectionHeader
        index="04"
        title={
          <>
            What people
            <br />
            <span className="text-ember">say</span>
          </>
        }
        meta={
          averageRating
            ? `${averageRating} / 5 average · ${visible.length} reviews`
            : `${visible.length} reviews`
        }
      />

      <Reveal variant="up">
        <EditableText
          as="p"
          label="intro"
          multiline
          value={state.content.reviewsIntro}
          onChange={(v) => updateContent({ reviewsIntro: v })}
          className="text-pretty -mt-4 mb-12 max-w-2xl text-lg text-bone-2"
        />
      </Reveal>

      {/* owner-only moderation toggle */}
      {editing && (
        <div className="panel mb-10 flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={15} className="text-ember" />
            <span className="font-mono text-xs text-bone">
              Hold new reviews for approval before they go public
            </span>
          </div>
          <button
            onClick={() =>
              updateContent({
                reviewsRequireApproval: !state.content.reviewsRequireApproval,
              })
            }
            className={cn(
              "relative h-6 w-11 border transition-colors",
              state.content.reviewsRequireApproval
                ? "border-ember bg-ember/25"
                : "border-bone/15 bg-ink-2",
            )}
            role="switch"
            aria-checked={state.content.reviewsRequireApproval}
          >
            <span
              className={cn(
                "absolute top-1/2 block h-4 w-4 -translate-y-1/2 transition-all duration-300",
                state.content.reviewsRequireApproval
                  ? "left-[calc(100%-1.25rem)] bg-ember"
                  : "left-1 bg-ash",
              )}
            />
          </button>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* ---------------- compose / auth ---------------- */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-8">
            <ComposePanel
              currentUser={currentUser}
              backend={backend}
              requiresApproval={state.content.reviewsRequireApproval}
              onAuthed={(u) => setLocalUser(u)}
              onSignedOut={() => setLocalUser(null)}
              onPosted={load}
            />
          </div>
        </div>

        {/* ---------------- feed ---------------- */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="flex items-center gap-2 py-16 font-mono text-xs text-ash">
              <Loader2 size={14} className="animate-spin" />
              Loading reviews…
            </div>
          ) : visible.length === 0 ? (
            <div className="panel flex flex-col items-center gap-2 px-6 py-20 text-center">
              <p className="font-display text-2xl text-bone">No reviews yet</p>
              <p className="max-w-sm text-sm text-ash">
                Be the first — make an account on the left and leave a word.
              </p>
            </div>
          ) : (
            <RevealGroup className="columns-1 gap-5 sm:columns-2" stagger={0.06}>
              {visible.map((r) => (
                <RevealItem key={r.id} className="mb-5 break-inside-avoid">
                  <ReviewCard
                    review={r}
                    isOwnerView={isAdmin}
                    onToggleApproval={handleToggleApproval}
                    onDelete={handleDelete}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */

interface ComposePanelProps {
  currentUser: CurrentUser | null;
  backend: "supabase" | "local";
  requiresApproval: boolean;
  onAuthed: (u: CurrentUser) => void;
  onSignedOut: () => void;
  onPosted: () => void;
}

function ComposePanel({
  currentUser,
  backend,
  requiresApproval,
  onAuthed,
  onSignedOut,
  onPosted,
}: ComposePanelProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noAccount, setNoAccount] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    if (currentUser) setDisplayName((d) => d || currentUser.username);
  }, [currentUser]);

  const doAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNoAccount(false);

    if (!isValidUsername(username)) {
      setError("Username: 3–24 characters, letters/numbers/._- only.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    const fn = mode === "signup" ? signUp : signIn;
    const { user, error: err } = await fn(username, password);
    setBusy(false);

    if (err === NO_SUCH_ACCOUNT) {
      setNoAccount(true);
      return;
    }
    if (err) {
      setError(err);
      return;
    }
    if (user) {
      onAuthed(user);
      setUsername("");
      setPassword("");
    }
  };

  /** Same credentials, but create the account instead of signing in. */
  const createInstead = async () => {
    setNoAccount(false);
    setError(null);
    setBusy(true);
    const { user, error: err } = await signUp(username, password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    if (user) {
      onAuthed(user);
      setUsername("");
      setPassword("");
    }
  };

  const doPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);

    if (body.trim().length < 4) {
      setError("Write a little more than that.");
      return;
    }

    setBusy(true);
    const { error: err } = await submitReview({
      userId: currentUser.id,
      displayName: displayName.trim() || currentUser.username,
      body: body.trim(),
      rating: rating || null,
      requiresApproval,
    });
    setBusy(false);

    if (err) {
      setError(err);
      return;
    }

    setBody("");
    setRating(0);
    setPosted(true);
    setTimeout(() => setPosted(false), 5000);
    onPosted();
  };

  const doSignOut = async () => {
    await signOut();
    onSignedOut();
  };

  return (
    <div className="panel ticks p-6">
      {backend === "local" && (
        <div className="mb-5 flex items-start gap-2 border border-sand/35 bg-sand/8 p-3">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-sand" />
          <p className="font-mono text-[10px] leading-relaxed text-sand">
            Demo mode — accounts and reviews are stored in this browser only.
            Connect Supabase to make them real and shared.
          </p>
        </div>
      )}

      {!currentUser ? (
        <>
          <p className="label label-ember mb-4">Leave a review</p>

          <div className="mb-5 flex border border-bone/10">
            {(["signup", "signin"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setNoAccount(false);
                }}
                className={cn(
                  "flex-1 py-2 font-mono text-[10px] tracking-[0.16em] uppercase transition-colors",
                  mode === m
                    ? "bg-ember text-ink"
                    : "text-ash hover:bg-bone/4 hover:text-bone",
                )}
              >
                {m === "signup" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>

          <form onSubmit={doAuth} className="space-y-3">
            <label className="block">
              <span className="label mb-1.5 block">Username</span>
              <input
                className="field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="your_name"
              />
            </label>

            <label className="block">
              <span className="label mb-1.5 block">Password</span>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                placeholder="at least 6 characters"
              />
            </label>

            {error && (
              <p className="font-mono text-[11px] leading-relaxed text-clay">
                {error}
              </p>
            )}

            {noAccount && (
              <div className="border border-sand/40 bg-sand/8 p-3">
                <p className="font-mono text-[11px] leading-relaxed text-sand">
                  No account found for{" "}
                  <span className="text-bone">{username.trim()}</span>
                  {mode === "signin"
                    ? " — or the password doesn't match."
                    : "."}
                </p>
                <button
                  type="button"
                  onClick={createInstead}
                  disabled={busy}
                  className="btn-ember mt-3 w-full justify-center !py-2 disabled:opacity-60"
                >
                  {busy && <Loader2 size={12} className="animate-spin" />}
                  Create this account instead
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-ember w-full justify-center disabled:opacity-60"
            >
              {busy && <Loader2 size={12} className="animate-spin" />}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-4 font-mono text-[10px] leading-relaxed text-ash-2">
            No email needed. Your username is only used to sign in and to label
            your review.
          </p>
        </>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="label label-ember mb-1">Signed in</p>
              <p className="truncate font-mono text-xs text-bone">
                {currentUser.username}
              </p>
            </div>
            <button
              type="button"
              onClick={doSignOut}
              title="Sign out"
              className="flex shrink-0 items-center gap-1.5 font-mono text-[10px]
                         tracking-[0.14em] text-ash uppercase transition-colors hover:text-bone"
            >
              <LogOut size={12} />
              Out
            </button>
          </div>

          <form onSubmit={doPost} className="space-y-4">
            <label className="block">
              <span className="label mb-1.5 block">Display name</span>
              <input
                className="field"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={32}
              />
            </label>

            <div>
              <span className="label mb-1.5 block">Rating — optional</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const n = i + 1;
                  const filled = (hoverRating || rating) >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(rating === n ? 0 : n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        size={18}
                        strokeWidth={1.5}
                        className={
                          filled ? "fill-ember text-ember" : "text-ash-2"
                        }
                      />
                    </button>
                  );
                })}
                {rating > 0 && (
                  <span className="ml-2 font-mono text-[10px] text-ash">
                    {rating}/5
                  </span>
                )}
              </div>
            </div>

            <label className="block">
              <span className="label mb-1.5 block">Your review</span>
              <textarea
                className="field min-h-[7rem] resize-y leading-relaxed"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={1200}
                placeholder="What was it like working with me?"
              />
              <span className="mt-1 block text-right font-mono text-[10px] text-ash-2">
                {body.length}/1200
              </span>
            </label>

            {error && (
              <p className="font-mono text-[11px] leading-relaxed text-clay">
                {error}
              </p>
            )}

            {posted && (
              <p className="font-mono text-[11px] leading-relaxed text-moss">
                {requiresApproval
                  ? "Thanks — your review is waiting for approval."
                  : "Posted. Thanks for taking the time."}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-ember w-full justify-center disabled:opacity-60"
            >
              {busy && <Loader2 size={12} className="animate-spin" />}
              Post review
            </button>

            <p className="font-mono text-[10px] leading-relaxed text-ash-2">
              One review per 10 minutes, 5 per account.
            </p>
          </form>
        </>
      )}
    </div>
  );
}
