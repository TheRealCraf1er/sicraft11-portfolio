import { useRef, useState } from "react";
import { ImageUp, Link2, Loader2, Trash2, MoveVertical } from "lucide-react";
import { useSite } from "../../lib/store";
import { uploadImage } from "../../lib/upload";

/**
 * Owner-only control for the landing cover image.
 * Uploads go to Supabase Storage when configured; otherwise the file is
 * inlined as a data URL into localStorage for offline previewing.
 */
export function CoverControl() {
  const { state, updateContent, editing } = useSite();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");

  if (!editing) return null;

  const onFile = async (file: File) => {
    setError(null);
    setBusy(true);
    const { url, error: err } = await uploadImage(file, "cover");
    setBusy(false);
    if (err) setError(err);
    else if (url) updateContent({ coverImage: url });
  };

  return (
    <div className="panel absolute top-4 left-4 z-40 w-[min(22rem,calc(100vw-2rem))] p-3">
      <p className="label label-ember mb-2.5">Cover Image</p>

      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="btn-ghost flex-1 justify-center !px-3 !py-2"
        >
          {busy ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <ImageUp size={12} />
          )}
          Upload
        </button>

        {state.content.coverImage && (
          <button
            onClick={() => updateContent({ coverImage: "" })}
            className="btn-ghost !px-3 !py-2"
            title="Remove cover image"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />

      <div className="mt-2 flex gap-2">
        <input
          className="field"
          placeholder="…or paste an image URL"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && urlDraft.trim()) {
              updateContent({ coverImage: urlDraft.trim() });
              setUrlDraft("");
            }
          }}
        />
        <button
          onClick={() => {
            if (urlDraft.trim()) {
              updateContent({ coverImage: urlDraft.trim() });
              setUrlDraft("");
            }
          }}
          className="btn-ghost !px-3 !py-2"
          title="Use this URL"
        >
          <Link2 size={12} />
        </button>
      </div>

      {state.content.coverImage && (
        <label className="mt-3 block">
          <span className="label mb-1.5 flex items-center gap-1.5">
            <MoveVertical size={10} />
            Vertical framing · {state.content.coverPositionY}%
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={state.content.coverPositionY}
            onChange={(e) =>
              updateContent({ coverPositionY: Number(e.target.value) })
            }
            className="w-full accent-[var(--color-ember)]"
          />
        </label>
      )}

      {error && <p className="mt-2 font-mono text-[11px] text-clay">{error}</p>}
    </div>
  );
}
