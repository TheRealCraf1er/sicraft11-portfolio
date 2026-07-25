import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  KeyRound,
  Lock,
  Loader2,
  CloudUpload,
  Check,
  Pencil,
  Eye,
  RotateCcw,
  Database,
  HardDrive,
} from "lucide-react";
import { useSite } from "../../lib/store";
import { Modal } from "../ui/Modal";
import { cn } from "../../lib/utils";

/**
 * Owner controls.
 *
 * The unlock gate is intentionally undiscoverable to visitors: press
 * Ctrl/Cmd + Shift + E, or load the page with #owner in the URL.
 */
export function AdminBar() {
  const {
    isAdmin,
    editing,
    setEditing,
    backend,
    dirty,
    publishing,
    publish,
    resetToSeed,
    unlockAdmin,
    lockAdmin,
    lastError,
  } = useSite();

  const [gateOpen, setGateOpen] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  /* ---- hidden entry points ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        if (!isAdmin) setGateOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);

    if (window.location.hash === "#owner" && !isAdmin) setGateOpen(true);

    return () => document.removeEventListener("keydown", onKey);
  }, [isAdmin]);

  const doPublish = async () => {
    const ok = await publish();
    if (ok) {
      setJustPublished(true);
      setTimeout(() => setJustPublished(false), 2500);
    }
  };

  return (
    <>
      <UnlockGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        backend={backend}
        unlock={unlockAdmin}
      />

      <AnimatePresence>
        {isAdmin && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[90] border-t border-ember/25 bg-ink-2/95 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-[88rem] flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
              {/* identity */}
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-ember uppercase">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-ember" />
                Owner mode
              </span>

              {/* backend */}
              <span
                className="hidden items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-ash uppercase sm:flex"
                title={
                  backend === "supabase"
                    ? "Changes publish to Supabase"
                    : "Local browser storage only"
                }
              >
                {backend === "supabase" ? (
                  <Database size={11} />
                ) : (
                  <HardDrive size={11} />
                )}
                {backend === "supabase" ? "Supabase" : "Local only"}
              </span>

              <div className="ml-auto flex flex-wrap items-center gap-2">
                {/* edit / preview toggle */}
                <button
                  onClick={() => setEditing(!editing)}
                  className={cn(
                    "flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px]",
                    "tracking-[0.14em] uppercase transition-colors",
                    editing
                      ? "border-ember bg-ember text-ink"
                      : "border-bone/15 text-bone-2 hover:border-ember/50 hover:text-bone",
                  )}
                >
                  {editing ? <Pencil size={11} /> : <Eye size={11} />}
                  {editing ? "Editing" : "Preview"}
                </button>

                {/* reset */}
                {confirmReset ? (
                  <span className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        resetToSeed();
                        setConfirmReset(false);
                      }}
                      className="border border-clay bg-clay/15 px-2.5 py-1.5 font-mono
                                 text-[10px] tracking-[0.14em] text-clay uppercase
                                 transition-colors hover:bg-clay hover:text-ink"
                    >
                      Confirm reset
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="font-mono text-[10px] tracking-[0.14em] text-ash uppercase hover:text-bone"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmReset(true)}
                    title="Restore the original seed data"
                    className="flex items-center gap-1.5 border border-bone/15 px-3 py-1.5
                               font-mono text-[10px] tracking-[0.14em] text-ash uppercase
                               transition-colors hover:border-clay/50 hover:text-clay"
                  >
                    <RotateCcw size={11} />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}

                {/* publish */}
                <button
                  onClick={doPublish}
                  disabled={publishing || (!dirty && !justPublished)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px]",
                    "tracking-[0.14em] uppercase transition-colors",
                    dirty
                      ? "bg-ember text-ink hover:bg-ember-2"
                      : "border border-bone/15 text-ash",
                  )}
                >
                  {publishing ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : justPublished ? (
                    <Check size={11} />
                  ) : (
                    <CloudUpload size={11} />
                  )}
                  {publishing
                    ? "Publishing"
                    : justPublished
                      ? "Published"
                      : dirty
                        ? "Publish changes"
                        : "Saved"}
                </button>

                {/* lock */}
                <button
                  onClick={lockAdmin}
                  title="Exit owner mode"
                  className="flex items-center gap-1.5 border border-bone/15 px-3 py-1.5
                             font-mono text-[10px] tracking-[0.14em] text-ash uppercase
                             transition-colors hover:border-bone/30 hover:text-bone"
                >
                  <Lock size={11} />
                </button>
              </div>
            </div>

            {lastError && (
              <p className="border-t border-clay/25 bg-clay/10 px-6 py-1.5 font-mono text-[10px] text-clay">
                {lastError}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ========================================================================== */

function UnlockGate({
  open,
  onClose,
  backend,
  unlock,
}: {
  open: boolean;
  onClose: () => void;
  backend: "supabase" | "local";
  unlock: (a: string, b?: string) => Promise<string | null>;
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await unlock(a, b);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setA("");
    setB("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      kicker="Restricted"
      title="Owner access"
      width="max-w-md"
    >
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm leading-relaxed text-ash">
          {backend === "supabase"
            ? "Sign in with your owner account to edit the site."
            : "Supabase isn't connected, so edits stay in this browser. Enter the local PIN to continue."}
        </p>

        {backend === "supabase" ? (
          <>
            <label className="block">
              <span className="label mb-1.5 block">Owner email</span>
              <input
                className="field"
                type="email"
                value={a}
                onChange={(e) => setA(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </label>
            <label className="block">
              <span className="label mb-1.5 block">Password</span>
              <input
                className="field"
                type="password"
                value={b}
                onChange={(e) => setB(e.target.value)}
                autoComplete="current-password"
              />
            </label>
          </>
        ) : (
          <label className="block">
            <span className="label mb-1.5 block">Local PIN</span>
            <input
              className="field"
              type="password"
              value={a}
              onChange={(e) => setA(e.target.value)}
              autoFocus
            />
          </label>
        )}

        {error && (
          <p className="font-mono text-[11px] leading-relaxed text-clay">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-ember w-full justify-center disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <KeyRound size={12} />
          )}
          Unlock
        </button>
      </form>
    </Modal>
  );
}
