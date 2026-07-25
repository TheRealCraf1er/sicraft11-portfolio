import { useEffect, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { useSite } from "../../lib/store";
import {
  RANK_PRESETS,
  RESPONSIBILITIES,
  STATUSES,
  type Responsibility,
  type ServerEntry,
  type Status,
} from "../../lib/types";
import { cn, deriveResponsibility } from "../../lib/utils";

interface ServerEditorProps {
  server: ServerEntry | null;
  onClose: () => void;
}

/** Full-field editor for one server entry. Rank names are free-text on top of presets. */
export function ServerEditor({ server, onClose }: ServerEditorProps) {
  const { state, upsertServer, deleteServer } = useSite();
  const [draft, setDraft] = useState<ServerEntry | null>(server);
  const [roleDraft, setRoleDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft(server);
    setRoleDraft("");
    setConfirmDelete(false);
  }, [server]);

  if (!draft) return null;

  const set = <K extends keyof ServerEntry>(key: K, value: ServerEntry[K]) =>
    setDraft({ ...draft, [key]: value });

  const addRole = (raw?: string) => {
    const value = (raw ?? roleDraft).trim();
    if (!value || draft.roles.includes(value)) {
      setRoleDraft("");
      return;
    }
    set("roles", [...draft.roles, value]);
    setRoleDraft("");
  };

  const save = () => {
    upsertServer({
      ...draft,
      name: draft.name.trim() || "Untitled Server",
      roles: draft.roles.length ? draft.roles : ["Staff"],
    });
    onClose();
  };

  const remove = () => {
    deleteServer(draft.id);
    onClose();
  };

  return (
    <Modal
      open={Boolean(server)}
      onClose={onClose}
      kicker="Owner Edit"
      title="Server entry"
      width="max-w-2xl"
    >
      <div className="space-y-5">
        {/* name */}
        <Field label="Server name">
          <input
            className="field"
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. DonutSMP Trusted Market"
          />
        </Field>

        {/* roles */}
        <Field label="Rank / roles held — earliest first">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {draft.roles.map((r) => (
              <span
                key={r}
                className="chip border-ember/40 bg-ember/10 text-ember"
              >
                {r}
                <button
                  onClick={() => set("roles", draft.roles.filter((x) => x !== r))}
                  className="-mr-0.5 opacity-70 transition-opacity hover:opacity-100"
                  aria-label={`Remove ${r}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            {draft.roles.length === 0 && (
              <span className="font-mono text-[11px] text-ash">
                No roles yet — add one below.
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              className="field"
              list="rank-presets"
              value={roleDraft}
              placeholder="Type any rank name — presets suggested"
              onChange={(e) => setRoleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRole();
                }
              }}
            />
            <datalist id="rank-presets">
              {RANK_PRESETS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
            <button onClick={() => addRole()} className="btn-ghost !px-3 !py-2">
              <Plus size={12} />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {RANK_PRESETS.slice(0, 10)
              .filter((r) => !draft.roles.includes(r))
              .map((r) => (
                <button
                  key={r}
                  onClick={() => addRole(r)}
                  className="border border-bone/10 px-1.5 py-0.5 font-mono text-[10px]
                             text-ash transition-colors hover:border-ember/50 hover:text-ember"
                >
                  + {r}
                </button>
              ))}
          </div>
        </Field>

        {/* period */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Period — start">
            <input
              className="field"
              value={draft.periodStart}
              onChange={(e) => set("periodStart", e.target.value)}
              placeholder="May 2025"
            />
          </Field>
          <Field label='Period — end (or "Present")'>
            <input
              className="field"
              value={draft.periodEnd}
              onChange={(e) => set("periodEnd", e.target.value)}
              placeholder="Present"
            />
          </Field>
        </div>

        {/* scale */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Member count / scale — shown as written">
            <input
              className="field"
              value={draft.members}
              onChange={(e) => set("members", e.target.value)}
              placeholder="2,400  ·  10,000  ·  N/A"
            />
          </Field>
          <Field label="Numeric value — drives the size bar (blank = no bar)">
            <input
              className="field"
              type="number"
              min={0}
              value={draft.scale ?? ""}
              onChange={(e) =>
                set("scale", e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder="2400"
            />
          </Field>
        </div>

        {/* status */}
        <Field label="Current standing">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => set("status", s as Status)}
                className={cn(
                  "border px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors",
                  draft.status === s
                    ? "border-ember bg-ember text-ink"
                    : "border-bone/12 text-ash hover:border-ember/50 hover:text-bone",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        {/* responsibility — drives the donut chart */}
        <Field label="Primary responsibility — used by the breakdown chart">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => set("responsibility", undefined)}
              className={cn(
                "border px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors",
                !draft.responsibility
                  ? "border-ember bg-ember text-ink"
                  : "border-bone/12 text-ash hover:border-ember/50 hover:text-bone",
              )}
            >
              Auto ({deriveResponsibility({ ...draft, responsibility: undefined })})
            </button>

            {RESPONSIBILITIES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => set("responsibility", r as Responsibility)}
                className={cn(
                  "border px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors",
                  draft.responsibility === r
                    ? "border-ember bg-ember text-ink"
                    : "border-bone/12 text-ash hover:border-ember/50 hover:text-bone",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </Field>

        {/* category */}
        <Field label="Category">
          <select
            className="field"
            value={draft.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
          >
            {state.categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-ink-3">
                {c.title}
              </option>
            ))}
            <option value="featured" className="bg-ink-3">
              Featured Highlight (hidden from the list)
            </option>
          </select>
        </Field>

        {/* note */}
        <Field label="Short note — optional">
          <textarea
            className="field min-h-[5rem] resize-y"
            value={draft.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="Anything worth adding — promotions, why it ended, what you handled."
          />
        </Field>

        {/* actions */}
        <div className="flex items-center justify-between gap-3 border-t border-bone/8 pt-5">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-clay">Delete this entry?</span>
              <button
                onClick={remove}
                className="border border-clay bg-clay/15 px-2.5 py-1 font-mono text-[10px]
                           tracking-[0.14em] text-clay uppercase transition-colors hover:bg-clay hover:text-ink"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="font-mono text-[10px] tracking-[0.14em] text-ash uppercase hover:text-bone"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em]
                         text-ash uppercase transition-colors hover:text-clay"
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button onClick={save} className="btn-ember">
              Save entry
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
