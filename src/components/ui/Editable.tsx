import { useEffect, useLayoutEffect, useRef, useState, type ElementType } from "react";
import { Pencil } from "lucide-react";
import { useSite } from "../../lib/store";
import { cn } from "../../lib/utils";

interface EditableTextProps {
  value: string;
  onChange: (next: string) => void;
  /** Rendered element when not editing. */
  as?: ElementType;
  className?: string;
  /** Field name shown on the edit affordance. */
  label?: string;
  multiline?: boolean;
  placeholder?: string;
  maxLength?: number;
}

/**
 * Text that becomes an input when the owner is in edit mode. Public visitors
 * see plain markup with zero extra DOM noise.
 */
export function EditableText({
  value,
  onChange,
  as: Tag = "p",
  className,
  label = "text",
  multiline = false,
  placeholder = "Empty — click to write",
  maxLength,
}: EditableTextProps) {
  const { editing } = useSite();
  const [active, setActive] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (!active) setDraft(value);
  }, [value, active]);

  // Leaving edit mode while an editor is open shouldn't strand it.
  useEffect(() => {
    if (!editing) setActive(false);
  }, [editing]);

  useLayoutEffect(() => {
    if (!active || !ref.current) return;
    ref.current.focus();
    if (multiline) autoGrow(ref.current as HTMLTextAreaElement);
  }, [active, multiline]);

  if (!editing) {
    if (!value) return null;
    return <Tag className={className}>{value}</Tag>;
  }

  const commit = () => {
    setActive(false);
    if (draft !== value) onChange(draft);
  };

  const cancel = () => {
    setDraft(value);
    setActive(false);
  };

  if (active) {
    const shared = {
      value: draft,
      maxLength,
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        }
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          commit();
        }
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          commit();
        }
      },
      className: cn(
        className,
        "w-full resize-none bg-ember/5 outline-none",
        "ring-1 ring-ember/70 px-1 -mx-1 rounded-[2px]",
      ),
    };

    return multiline ? (
      <textarea
        {...shared}
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        rows={1}
        onChange={(e) => {
          setDraft(e.target.value);
          autoGrow(e.target);
        }}
      />
    ) : (
      <input
        {...shared}
        ref={ref as React.RefObject<HTMLInputElement>}
        onChange={(e) => setDraft(e.target.value)}
      />
    );
  }

  return (
    <Tag
      role="button"
      tabIndex={0}
      onClick={() => setActive(true)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setActive(true);
        }
      }}
      title={`Edit ${label}`}
      className={cn(
        className,
        "group/edit relative cursor-text rounded-[2px]",
        "outline-1 outline-dashed outline-offset-4 outline-ember/35",
        "transition-colors hover:outline-ember hover:bg-ember/5",
        !value && "min-h-[1.2em] text-ash italic",
      )}
    >
      {value || placeholder}
      <span
        className="pointer-events-none absolute -top-2 -right-2 flex items-center gap-1
                   bg-ember px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.14em]
                   text-ink opacity-0 transition-opacity group-hover/edit:opacity-100"
      >
        <Pencil size={9} strokeWidth={3} />
        {label.toUpperCase()}
      </span>
    </Tag>
  );
}

function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

/**
 * A generic wrapper that reveals owner-only controls (buttons, toggles)
 * without touching the public DOM.
 */
export function OwnerOnly({ children }: { children: React.ReactNode }) {
  const { editing } = useSite();
  if (!editing) return null;
  return <>{children}</>;
}
