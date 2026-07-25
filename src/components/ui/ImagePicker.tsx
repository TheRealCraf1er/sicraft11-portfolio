import { useRef, useState } from "react";
import { ImageUp, Link2, Loader2, Trash2 } from "lucide-react";
import { useSite } from "../../lib/store";
import { uploadImage } from "../../lib/upload";

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  /** Filename prefix used for the stored asset. */
  prefix?: string;
}

/** Compact owner-only image control: upload a file or paste a URL. */
export function ImagePicker({
  value,
  onChange,
  label,
  prefix = "asset",
}: ImagePickerProps) {
  const { editing } = useSite();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");

  if (!editing) return null;

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    const { url, error: err } = await uploadImage(file, prefix);
    setBusy(false);
    if (err) setError(err);
    else if (url) onChange(url);
  };

  const applyUrl = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setUrlDraft("");
    }
  };

  return (
    <div className="mt-3 border border-ember/30 bg-ember/5 p-3">
      <p className="label label-ember mb-2">{label}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="btn-ghost flex-1 justify-center !px-3 !py-1.5"
        >
          {busy ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <ImageUp size={11} />
          )}
          Upload
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="btn-ghost !px-3 !py-1.5"
            title="Remove image"
          >
            <Trash2 size={11} />
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
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <div className="mt-2 flex gap-2">
        <input
          className="field !py-1.5 !text-[11px]"
          placeholder="…or paste an image URL"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applyUrl();
            }
          }}
        />
        <button
          type="button"
          onClick={applyUrl}
          className="btn-ghost !px-3 !py-1.5"
          title="Use this URL"
        >
          <Link2 size={11} />
        </button>
      </div>

      {error && <p className="mt-2 font-mono text-[10px] text-clay">{error}</p>}
    </div>
  );
}
