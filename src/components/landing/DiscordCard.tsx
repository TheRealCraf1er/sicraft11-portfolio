import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { cn, initials } from "../../lib/utils";
import type { SiteContent } from "../../lib/types";

/* -------------------------------------------------------------- Lanyard --
   Live Discord presence, free, no bot required. The account just needs to be
   in the Lanyard Discord (discord.gg/lanyard). If no user ID is configured,
   or the fetch fails, the card degrades to a static identity card.
   ------------------------------------------------------------------------ */

interface LanyardUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  discriminator: string;
}

interface LanyardActivity {
  name: string;
  type: number;
  state?: string;
  details?: string;
}

interface LanyardData {
  discord_user: LanyardUser;
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify?: { song: string; artist: string; album_art_url: string } | null;
}

const PRESENCE = {
  online: { label: "Online", color: "#23a55a" },
  idle: { label: "Idle", color: "#f0b232" },
  dnd: { label: "Do Not Disturb", color: "#f23f43" },
  offline: { label: "Offline", color: "#80848e" },
} as const;

function useLanyard(userId: string) {
  const [data, setData] = useState<LanyardData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!userId.trim()) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(
          `https://api.lanyard.rest/v1/users/${userId.trim()}`,
        );
        const json = await res.json();
        if (cancelled) return;
        if (json?.success && json.data) {
          setData(json.data as LanyardData);
          setFailed(false);
        } else {
          setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    load();
    const timer = setInterval(load, 20_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [userId]);

  return { data, failed };
}

/* ------------------------------------------------------------------ card */

export function DiscordCard({
  content,
  className,
}: {
  content: SiteContent;
  className?: string;
}) {
  const { data } = useLanyard(content.discordUserId);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content.discordTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the tag is visible anyway */
    }
  };

  const user = data?.discord_user;
  const displayName = user?.global_name || user?.username || content.discordTag;
  const handle = user?.username ?? content.discordTag;

  const avatarUrl =
    user?.avatar && user.id
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${
          user.avatar.startsWith("a_") ? "gif" : "png"
        }?size=128`
      : content.discordAvatarFallback || null;

  const presence = data ? PRESENCE[data.discord_status] : null;

  // "Custom Status" is type 4 — surface it as a line of flavour text.
  const custom = data?.activities.find((a) => a.type === 4);
  const playing = data?.activities.find((a) => a.type === 0);

  return (
    <div
      className={cn(
        "panel relative overflow-hidden",
        "before:absolute before:inset-x-0 before:top-0 before:h-12",
        className,
      )}
      style={
        {
          // banner wash uses the Discord accent, kept local to this card
          backgroundImage: `linear-gradient(to bottom, ${content.discordBannerColor}22, transparent 5rem)`,
        } as React.CSSProperties
      }
    >
      <div className="flex items-start gap-3 p-4">
        {/* avatar */}
        <div className="relative shrink-0">
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-ink-3 bg-ink-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="grid h-full w-full place-items-center font-mono text-sm text-ash">
                {initials(handle)}
              </div>
            )}
          </div>

          {presence && (
            <span
              className="absolute -right-0.5 -bottom-0.5 block h-4 w-4 rounded-full border-[3px] border-ink-3"
              style={{ backgroundColor: presence.color }}
              title={presence.label}
            />
          )}
        </div>

        {/* identity */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-display text-lg leading-tight font-semibold text-bone">
              {displayName}
            </p>
            {presence && (
              <span
                className="label shrink-0"
                style={{ color: presence.color }}
              >
                {presence.label}
              </span>
            )}
          </div>

          <p className="truncate font-mono text-xs text-ash">@{handle}</p>

          {custom?.state && (
            <p className="mt-1.5 truncate text-xs text-bone-2 italic">
              {custom.state}
            </p>
          )}
          {!custom?.state && playing && (
            <p className="mt-1.5 truncate font-mono text-[11px] text-blurple-2">
              Playing {playing.name}
            </p>
          )}
          {!custom?.state && !playing && data?.listening_to_spotify && data.spotify && (
            <p className="mt-1.5 truncate font-mono text-[11px] text-moss">
              ♪ {data.spotify.song} — {data.spotify.artist}
            </p>
          )}
          {!data && (
            <p className="mt-1.5 font-mono text-[11px] text-ash-2">
              Discord · Minecraft staff
            </p>
          )}
        </div>
      </div>

      {/* actions */}
      <div className="flex items-stretch border-t border-bone/8">
        <button
          onClick={copy}
          className="group flex flex-1 items-center justify-center gap-2 py-2.5
                     font-mono text-[10px] tracking-[0.16em] text-bone-2 uppercase
                     transition-colors hover:bg-bone/4 hover:text-bone"
        >
          {copied ? (
            <>
              <Check size={12} className="text-moss" />
              Copied
            </>
          ) : (
            <>
              <Copy size={12} className="text-ash group-hover:text-ember" />
              {content.discordTag}
            </>
          )}
        </button>

        {content.discordInvite && (
          <a
            href={content.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-l border-bone/8 px-4
                       py-2.5 font-mono text-[10px] tracking-[0.16em] uppercase
                       transition-colors hover:bg-blurple/15"
            style={{ color: content.discordBannerColor }}
          >
            Open
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}
