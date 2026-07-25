import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured, LOCAL_ADMIN_PIN } from "./supabase";
import { SEED_STATE, SEED_CONTENT, SEED_CATEGORIES } from "./seed";
import type {
  Category,
  ServerEntry,
  SiteContent,
  SiteState,
} from "./types";

const LS_SITE = "sicraft11:site";
const SS_ADMIN = "sicraft11:admin-unlocked";

type Backend = "supabase" | "local";

interface SiteContextValue {
  state: SiteState;
  loading: boolean;
  backend: Backend;

  /** Owner edit mode is on. */
  isAdmin: boolean;
  /** Owner edit mode is on AND the toggle is switched to "editing". */
  editing: boolean;
  setEditing: (v: boolean) => void;

  session: Session | null;
  /** There are local changes not yet published to the shared backend. */
  dirty: boolean;
  publishing: boolean;
  lastError: string | null;

  updateContent: (patch: Partial<SiteContent>) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  upsertServer: (server: ServerEntry) => void;
  deleteServer: (id: string) => void;
  moveServer: (id: string, direction: -1 | 1) => void;
  createServer: (categoryId: string) => ServerEntry;

  publish: () => Promise<boolean>;
  resetToSeed: () => void;

  unlockAdmin: (a: string, b?: string) => Promise<string | null>;
  lockAdmin: () => Promise<void>;
}

const SiteContext = createContext<SiteContextValue | null>(null);

/* ---------------------------------------------------------------- helpers */

/**
 * Copy that shipped as a default in an earlier version. If a saved site still
 * holds one of these verbatim, the owner never edited it — so it is safe (and
 * desirable) to replace with the current default. Anything the owner actually
 * rewrote won't match, and is left untouched.
 */
const SUPERSEDED_DEFAULTS: Record<string, string[]> = {
  featuredBody: [
    "NightVanilla is the role I point to first. Alongside Helper and Admin duties, I assisted the Media Manager — coordinating the content that brought players through the door and keeping the server's public presence consistent while it passed 5,500 unique joins.",
    "NightVanilla is the role I point to first — and the one that still stings. I came in as Helper, worked up to Admin, and ended up assisting the Media Manager on the content that pulled players through the door. We pushed it past 5,500 unique joins. Then I watched it die in front of me: the activity drained away, the server got sold, and the new owner deleted it outright. Everything the team built is just gone. I'd still take that job again tomorrow.",
  ],
};

function migrateContent(stored: Partial<SiteContent>): Partial<SiteContent> {
  const next = { ...stored };
  for (const [key, oldValues] of Object.entries(SUPERSEDED_DEFAULTS)) {
    const current = next[key as keyof SiteContent];
    if (typeof current === "string" && oldValues.includes(current)) {
      delete next[key as keyof SiteContent];
    }
  }
  return next;
}

/** Merge a stored blob over the seed so new fields survive old saves. */
function reconcile(stored: Partial<SiteState> | null | undefined): SiteState {
  if (!stored) return structuredClone(SEED_STATE);

  const categories = (
    stored.categories?.length
      ? stored.categories
      : structuredClone(SEED_STATE.categories)
  ).map((c) => {
    // Category order has no editor in the UI, so it is structural, not content.
    // Always take it from the seed — otherwise a site saved before a reorder
    // would pin the old arrangement forever.
    const seed = SEED_CATEGORIES.find((s) => s.id === c.id);
    return seed ? { ...c, order: seed.order } : c;
  });

  return {
    content: { ...SEED_CONTENT, ...migrateContent(stored.content ?? {}) },
    categories,
    servers: stored.servers ?? structuredClone(SEED_STATE.servers),
  };
}

function readLocal(): SiteState | null {
  try {
    const raw = localStorage.getItem(LS_SITE);
    return raw ? (JSON.parse(raw) as SiteState) : null;
  } catch {
    return null;
  }
}

function writeLocal(state: SiteState) {
  try {
    localStorage.setItem(LS_SITE, JSON.stringify(state));
  } catch {
    /* quota exceeded — usually a large base64 cover image */
  }
}

/* --------------------------------------------------------------- provider */

export function SiteProvider({ children }: { children: ReactNode }) {
  const backend: Backend = isSupabaseConfigured ? "supabase" : "local";

  const [state, setState] = useState<SiteState>(() =>
    reconcile(typeof window === "undefined" ? null : readLocal()),
  );
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const remoteLoaded = useRef(false);

  /* ---- initial load: remote wins over local when available ---- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!supabase) {
        setLoading(false);
        // Local-only mode: an unlock survives a reload within the tab session.
        setIsAdmin(sessionStorage.getItem(SS_ADMIN) === "1");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("site_state")
          .select("data")
          .eq("id", 1)
          .maybeSingle();

        if (!cancelled) {
          if (error) {
            setLastError(`Could not load site data: ${error.message}`);
          } else if (data?.data) {
            remoteLoaded.current = true;
            const next = reconcile(data.data as Partial<SiteState>);
            setState(next);
            writeLocal(next);
            setDirty(false);
          }
        }
      } catch (e) {
        if (!cancelled) setLastError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- auth session tracking ---- */
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  /* ---- resolve admin status from the session ---- */
  useEffect(() => {
    if (!supabase) return;
    const uid = session?.user?.id;
    if (!uid) {
      setIsAdmin(false);
      setEditing(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", uid)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          const admin = Boolean(data);
          setIsAdmin(admin);
          if (!admin) setEditing(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  /* ---- every mutation persists locally straight away ---- */
  const mutate = useCallback((updater: (prev: SiteState) => SiteState) => {
    setState((prev) => {
      const next = updater(prev);
      writeLocal(next);
      return next;
    });
    setDirty(true);
  }, []);

  const updateContent = useCallback(
    (patch: Partial<SiteContent>) =>
      mutate((prev) => ({ ...prev, content: { ...prev.content, ...patch } })),
    [mutate],
  );

  const updateCategory = useCallback(
    (id: string, patch: Partial<Category>) =>
      mutate((prev) => ({
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        ),
      })),
    [mutate],
  );

  const upsertServer = useCallback(
    (server: ServerEntry) =>
      mutate((prev) => {
        const exists = prev.servers.some((s) => s.id === server.id);
        return {
          ...prev,
          servers: exists
            ? prev.servers.map((s) => (s.id === server.id ? server : s))
            : [...prev.servers, server],
        };
      }),
    [mutate],
  );

  const deleteServer = useCallback(
    (id: string) =>
      mutate((prev) => ({
        ...prev,
        servers: prev.servers.filter((s) => s.id !== id),
      })),
    [mutate],
  );

  /** Swap order with the neighbour inside the same category. */
  const moveServer = useCallback(
    (id: string, direction: -1 | 1) =>
      mutate((prev) => {
        const target = prev.servers.find((s) => s.id === id);
        if (!target) return prev;

        const siblings = prev.servers
          .filter((s) => s.categoryId === target.categoryId)
          .sort((a, b) => a.order - b.order);

        const idx = siblings.findIndex((s) => s.id === id);
        const swapIdx = idx + direction;
        if (swapIdx < 0 || swapIdx >= siblings.length) return prev;

        const a = siblings[idx];
        const b = siblings[swapIdx];
        return {
          ...prev,
          servers: prev.servers.map((s) => {
            if (s.id === a.id) return { ...s, order: b.order };
            if (s.id === b.id) return { ...s, order: a.order };
            return s;
          }),
        };
      }),
    [mutate],
  );

  const createServer = useCallback(
    (categoryId: string): ServerEntry => {
      const fresh: ServerEntry = {
        id: `srv-${Date.now().toString(36)}`,
        name: "New Server",
        roles: ["Helper"],
        periodStart: "",
        periodEnd: "",
        members: "N/A",
        scale: null,
        status: "Active",
        note: "",
        categoryId,
        order: Date.now(),
      };
      upsertServer(fresh);
      return fresh;
    },
    [upsertServer],
  );

  /* ---- publish to the shared backend ---- */
  const publish = useCallback(async (): Promise<boolean> => {
    if (!supabase) {
      // Local mode: writing to localStorage already happened.
      setDirty(false);
      return true;
    }
    setPublishing(true);
    setLastError(null);
    try {
      const { error } = await supabase
        .from("site_state")
        .upsert({ id: 1, data: state, updated_at: new Date().toISOString() });
      if (error) {
        setLastError(error.message);
        return false;
      }
      setDirty(false);
      return true;
    } catch (e) {
      setLastError((e as Error).message);
      return false;
    } finally {
      setPublishing(false);
    }
  }, [state]);

  const resetToSeed = useCallback(() => {
    const fresh = structuredClone(SEED_STATE);
    setState(fresh);
    writeLocal(fresh);
    setDirty(true);
  }, []);

  /* ---- admin unlock / lock ---- */
  const unlockAdmin = useCallback(
    async (a: string, b?: string): Promise<string | null> => {
      setLastError(null);

      if (!supabase) {
        if (a.trim() === LOCAL_ADMIN_PIN) {
          sessionStorage.setItem(SS_ADMIN, "1");
          setIsAdmin(true);
          setEditing(true);
          return null;
        }
        return "Incorrect PIN.";
      }

      const email = a.trim();
      const password = b ?? "";
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return error.message;

      const uid = data.user?.id;
      if (!uid) return "Sign-in failed.";

      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", uid)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        return "That account is not an owner account.";
      }

      setIsAdmin(true);
      setEditing(true);
      return null;
    },
    [],
  );

  const lockAdmin = useCallback(async () => {
    setEditing(false);
    setIsAdmin(false);
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      sessionStorage.removeItem(SS_ADMIN);
    }
  }, []);

  const value = useMemo<SiteContextValue>(
    () => ({
      state,
      loading,
      backend,
      isAdmin,
      editing: isAdmin && editing,
      setEditing,
      session,
      dirty,
      publishing,
      lastError,
      updateContent,
      updateCategory,
      upsertServer,
      deleteServer,
      moveServer,
      createServer,
      publish,
      resetToSeed,
      unlockAdmin,
      lockAdmin,
    }),
    [
      state,
      loading,
      backend,
      isAdmin,
      editing,
      session,
      dirty,
      publishing,
      lastError,
      updateContent,
      updateCategory,
      upsertServer,
      deleteServer,
      moveServer,
      createServer,
      publish,
      resetToSeed,
      unlockAdmin,
      lockAdmin,
    ],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}
