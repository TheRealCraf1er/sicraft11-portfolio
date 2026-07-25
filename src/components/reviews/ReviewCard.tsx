import { Star, Check, EyeOff, Trash2 } from "lucide-react";
import type { Review } from "../../lib/types";
import { cn, hashIndex, initials, relativeTime } from "../../lib/utils";

/** Stable per-author tint so the feed reads as many distinct voices. */
const TINTS = [
  "text-ember border-ember/35 bg-ember/10",
  "text-moss border-moss/35 bg-moss/10",
  "text-blurple-2 border-blurple/40 bg-blurple/10",
  "text-sand border-sand/35 bg-sand/10",
  "text-bone-2 border-bone/20 bg-bone/6",
];

interface ReviewCardProps {
  review: Review;
  isOwnerView: boolean;
  onToggleApproval: (r: Review) => void;
  onDelete: (r: Review) => void;
}

export function ReviewCard({
  review,
  isOwnerView,
  onToggleApproval,
  onDelete,
}: ReviewCardProps) {
  const tint = TINTS[hashIndex(review.display_name, TINTS.length)];

  return (
    <article
      className={cn(
        "panel group relative flex h-full flex-col p-6",
        "transition-colors duration-500 hover:border-bone/16",
        !review.approved && "border-dashed border-sand/40",
      )}
    >
      {!review.approved && (
        <span className="label mb-3 flex items-center gap-1.5 text-sand">
          <EyeOff size={10} />
          Awaiting approval
        </span>
      )}

      {review.rating != null && review.rating > 0 && (
        <div className="mb-4 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={13}
              className={
                i < review.rating!
                  ? "fill-ember text-ember"
                  : "text-ash-2"
              }
              strokeWidth={1.5}
            />
          ))}
        </div>
      )}

      <p className="text-pretty flex-1 text-[0.9375rem] leading-relaxed text-bone-2">
        {review.body}
      </p>

      <footer className="mt-6 flex items-center gap-3 border-t border-bone/8 pt-4">
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center border font-mono text-[10px] font-bold",
            tint,
          )}
        >
          {initials(review.display_name)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs text-bone">
            {review.display_name}
          </p>
          <p className="font-mono text-[10px] text-ash-2">
            {relativeTime(review.created_at)}
          </p>
        </div>

        {isOwnerView && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onToggleApproval(review)}
              title={review.approved ? "Hide from public" : "Approve"}
              className={cn(
                "p-1 transition-colors",
                review.approved
                  ? "text-moss hover:text-sand"
                  : "text-sand hover:text-moss",
              )}
            >
              {review.approved ? <EyeOff size={13} /> : <Check size={13} />}
            </button>
            <button
              onClick={() => onDelete(review)}
              title="Delete review"
              className="p-1 text-ash transition-colors hover:text-clay"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </footer>
    </article>
  );
}
