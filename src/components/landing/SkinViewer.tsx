import { useEffect, useRef, useState } from "react";
import {
  SkinViewer as Skinview3dViewer,
  IdleAnimation,
  WalkingAnimation,
  RunningAnimation,
  WaveAnimation,
  type PlayerAnimation,
} from "skinview3d";
import { RotateCcw, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

/** CORS-enabled skin mirrors, tried in order. */
const SKIN_SOURCES = (ign: string) => [
  `https://mc-heads.net/skin/${encodeURIComponent(ign)}`,
  `https://minotar.net/skin/${encodeURIComponent(ign)}`,
  `https://mc-heads.net/skin/MHF_Steve`,
];

const POSES: Array<{ id: string; label: string; make: () => PlayerAnimation }> = [
  { id: "idle", label: "Idle", make: () => new IdleAnimation() },
  { id: "walk", label: "Walk", make: () => new WalkingAnimation() },
  { id: "run", label: "Run", make: () => new RunningAnimation() },
  { id: "wave", label: "Wave", make: () => new WaveAnimation() },
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export function SkinViewer({ ign }: { ign: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<Skinview3dViewer | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pose, setPose] = useState("idle");

  /* --- create the viewer once, load the skin with fallbacks --- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    let disposed = false;

    const viewer = new Skinview3dViewer({
      canvas,
      width: host.clientWidth,
      height: host.clientHeight,
      fov: 42,
      zoom: 0.82,
    });

    viewer.animation = new IdleAnimation();
    viewer.autoRotate = true;
    viewer.autoRotateSpeed = 0.55;
    viewer.controls.enableZoom = true;
    viewer.controls.enableRotate = true;
    viewer.controls.enablePan = false;
    viewer.controls.enableDamping = true;
    viewer.controls.dampingFactor = 0.08;

    viewerRef.current = viewer;

    (async () => {
      setStatus("loading");
      for (const src of SKIN_SOURCES(ign)) {
        try {
          const img = await loadImage(src);
          if (disposed) return;
          viewer.loadSkin(img);
          setStatus("ready");
          return;
        } catch {
          /* try the next mirror */
        }
      }
      if (!disposed) setStatus("error");
    })();

    // Stop the lazy spin while the visitor is actually dragging it.
    const stop = () => {
      viewer.autoRotate = false;
    };
    const resume = () => {
      viewer.autoRotate = true;
    };
    canvas.addEventListener("pointerdown", stop);
    canvas.addEventListener("pointerup", resume);
    canvas.addEventListener("pointerleave", resume);

    const ro = new ResizeObserver(() => {
      if (!disposed && host.clientWidth > 0) {
        viewer.setSize(host.clientWidth, host.clientHeight);
      }
    });
    ro.observe(host);

    return () => {
      disposed = true;
      ro.disconnect();
      canvas.removeEventListener("pointerdown", stop);
      canvas.removeEventListener("pointerup", resume);
      canvas.removeEventListener("pointerleave", resume);
      viewer.dispose();
      viewerRef.current = null;
    };
  }, [ign]);

  /* --- pose switching --- */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.disposed) return;
    const found = POSES.find((p) => p.id === pose) ?? POSES[0];
    viewer.animation = found.make();
  }, [pose]);

  const resetView = () => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.disposed) return;
    viewer.controls.reset();
    viewer.zoom = 0.82;
    viewer.autoRotate = true;
  };

  return (
    <figure className="relative m-0">
      {/* torch glow behind the model */}
      <div className="ember-bloom pointer-events-none absolute inset-x-6 top-1/4 bottom-6 opacity-45" />

      <div className="panel ticks relative">
        {/* specimen frame header */}
        <div className="flex items-center justify-between border-b border-bone/8 px-3 py-2">
          <span className="label label-ember">Specimen · Skin</span>
          <span className="label hidden sm:block">Drag ↻ · Scroll ⤢</span>
        </div>

        <div
          ref={hostRef}
          className="dot-grid relative h-[340px] w-full sm:h-[420px] lg:h-[480px]"
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

          {status === "loading" && (
            <div className="absolute inset-0 grid place-items-center">
              <Loader2 className="animate-spin text-ember" size={20} />
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 grid place-items-center px-6 text-center">
              <p className="font-mono text-xs text-ash">
                Skin couldn't load.
                <br />
                Check the IGN or try again later.
              </p>
            </div>
          )}

          <button
            onClick={resetView}
            title="Reset view"
            aria-label="Reset view"
            className="absolute right-2 bottom-2 grid h-7 w-7 place-items-center
                       border border-bone/12 bg-ink/70 text-ash backdrop-blur
                       transition-colors hover:border-ember/60 hover:text-ember"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* pose selector */}
        <div className="flex items-stretch border-t border-bone/8">
          {POSES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPose(p.id)}
              className={cn(
                "flex-1 border-r border-bone/8 py-2 font-mono text-[10px] tracking-[0.16em] uppercase transition-colors last:border-r-0",
                pose === p.id
                  ? "bg-ember/12 text-ember"
                  : "text-ash hover:bg-bone/4 hover:text-bone",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <figcaption className="mt-3 flex items-baseline justify-between gap-3">
        <span className="label">IGN</span>
        <span className="font-mono text-sm text-bone">{ign}</span>
      </figcaption>
    </figure>
  );
}
