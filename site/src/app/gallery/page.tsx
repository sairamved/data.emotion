"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { ReplayCanvas } from "@/components/draw/ReplayCanvas";
import { playTap, preloadTaps } from "@/lib/sounds";
import {
  fetchDrawingMetas,
  fetchDrawingById,
  subscribeToNewDrawings,
  drawingFingerprint,
} from "@/lib/drawings/storage";
import type { Drawing, DrawingMeta } from "@/lib/drawings/types";

type View = "cycle" | "grid";
type GridFilter = "both" | "data" | "emotion";

const REPLAY_DURATION_MS = 1400;
/** Total time each drawing is on screen in cycle view: replay + breathing room. */
const CYCLE_INTERVAL_MS = REPLAY_DURATION_MS + 1100;

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s - m * 60;
  return `${m}m ${rs}s`;
}

function formatTimestamp(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function GalleryPage() {
  // Lightweight index — drives the cycle / grid layout, fetched up front.
  const [metas, setMetas] = useState<DrawingMeta[]>([]);

  // In-memory cache of fully-loaded drawings (with stroke arrays).
  const cacheRef = useRef<Map<string, Drawing>>(new Map());
  // Force re-render when the cache fills in.
  const [cacheVersion, setCacheVersion] = useState(0);
  const bumpCache = useCallback(() => setCacheVersion((v) => v + 1), []);

  const [view, setView] = useState<View>("cycle");
  const [gridFilter, setGridFilter] = useState<GridFilter>("both");
  const [cycleIndex, setCycleIndex] = useState(0);

  const metasRef = useRef<DrawingMeta[]>([]);
  const fingerprintsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    preloadTaps();
  }, []);

  // Initial fetch — metadata only.
  useEffect(() => {
    let cancelled = false;
    fetchDrawingMetas().then((m) => {
      if (cancelled) return;
      metasRef.current = m;
      setMetas(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime subscription. New inserts arrive as full Drawing objects;
  // dedupe by Supabase id + content fingerprint, then add to both the
  // meta list (top, newest-first) AND the cache.
  useEffect(() => {
    const unsub = subscribeToNewDrawings((d) => {
      if (!d.id) return;
      const fp = drawingFingerprint(d);
      const idMatch = metasRef.current.some((m) => m.id === d.id);
      if (idMatch || fingerprintsRef.current.has(fp)) return;
      fingerprintsRef.current.add(fp);

      cacheRef.current.set(d.id, d);
      const newMeta: DrawingMeta = {
        id: d.id,
        createdAt: d.createdAt ?? new Date().toISOString(),
        dataStrokeCount: d.data.strokes.length,
        emotionStrokeCount: d.emotion.strokes.length,
        dataDurationMs: Math.round(d.data.durationMs),
        emotionDurationMs: Math.round(d.emotion.durationMs),
      };
      metasRef.current = [newMeta, ...metasRef.current];
      setMetas([...metasRef.current]);
      bumpCache();
    });
    return unsub;
  }, [bumpCache]);

  // Seed the fingerprint set from initial metas (so realtime can dedupe
  // by id even before we've loaded the full Drawing).
  useEffect(() => {
    // Fingerprint requires full strokes; we don't have those for metas.
    // But dedupe-by-id still catches the common "realtime replays an
    // already-fetched row" case. We rely on fingerprint as a backstop
    // when a full Drawing later lands.
  }, [metas]);

  /**
   * Load a drawing into the cache. Idempotent — if it's already there,
   * resolves immediately.
   */
  const loadDrawing = useCallback(
    async (id: string) => {
      if (cacheRef.current.has(id)) return;
      const d = await fetchDrawingById(id);
      if (d && d.id) {
        cacheRef.current.set(d.id, d);
        bumpCache();
      }
    },
    [bumpCache],
  );

  // Cycle view: maintain a sliding prefetch window of the current
  // drawing plus the next few, so cycling is seamless even on slow wifi.
  useEffect(() => {
    if (view !== "cycle" || metas.length === 0) return;
    const PREFETCH_AHEAD = 3;
    const ids = new Set<string>();
    for (let i = 0; i <= PREFETCH_AHEAD; i++) {
      const m = metas[(cycleIndex + i) % metas.length];
      if (m) ids.add(m.id);
    }
    for (const id of ids) loadDrawing(id);
  }, [view, cycleIndex, metas, loadDrawing]);

  // Cold start: as soon as metas land, kick off loads for the first few
  // so the cycle has something ready immediately on first paint.
  useEffect(() => {
    if (metas.length === 0) return;
    const PREFETCH_INITIAL = 3;
    for (let i = 0; i < Math.min(PREFETCH_INITIAL, metas.length); i++) {
      loadDrawing(metas[i].id);
    }
  }, [metas, loadDrawing]);

  // Auto-advance cycle. If the next-up drawing's strokes haven't loaded
  // yet, hold on the current one for an extra cycle rather than showing
  // an empty placeholder.
  useEffect(() => {
    if (view !== "cycle" || metas.length === 0) return;
    const id = window.setInterval(() => {
      setCycleIndex((i) => {
        const next = (i + 1) % metas.length;
        const nextMeta = metas[next];
        if (nextMeta && !cacheRef.current.has(nextMeta.id)) {
          // Not ready — stay on the current drawing for now.
          return i;
        }
        return next;
      });
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [view, metas]);

  // Keep cycleIndex in range.
  useEffect(() => {
    if (cycleIndex >= metas.length && metas.length > 0) {
      setCycleIndex(0);
    }
  }, [cycleIndex, metas.length]);

  const currentMeta = metas[cycleIndex];
  const currentDrawing = currentMeta
    ? cacheRef.current.get(currentMeta.id)
    : undefined;

  return (
    <div style={{ background: "#000000", minHeight: "100vh" }}>
      <Nav showLogo />

      <article className="conversation gallery-article">
        <header className="conversation-header gallery-header">
          <h1 className="conversation-title">Drawing Archive</h1>

          <div className="gallery-toggle">
            <button
              className="gallery-toggle-btn"
              data-active={view === "cycle"}
              onClick={() => {
                playTap();
                setView("cycle");
              }}
            >
              <span className="serif-em">Cycle</span>{" "}
              <span className="sans-tag">one at a time</span>
            </button>
            <button
              className="gallery-toggle-btn"
              data-active={view === "grid"}
              onClick={() => {
                playTap();
                setView("grid");
              }}
            >
              <span className="serif-em">Grid</span>{" "}
              <span className="sans-tag">side by side</span>
            </button>
            <Link
              href="/draw"
              className="gallery-toggle-btn gallery-toggle-cta"
              onClick={() => playTap()}
            >
              <span className="sans-tag">Add yours</span>
            </Link>
          </div>

          {view === "grid" && metas.length > 0 && (
            <div className="gallery-subfilter-row">
              <div className="gallery-subfilter">
                <button
                  className="gallery-subfilter-btn"
                  data-active={gridFilter === "both"}
                  onClick={() => {
                    playTap();
                    setGridFilter("both");
                  }}
                >
                  <span className="sans-tag">Both</span>
                </button>
                <button
                  className="gallery-subfilter-btn"
                  data-active={gridFilter === "data"}
                  onClick={() => {
                    playTap();
                    setGridFilter("data");
                  }}
                >
                  <em>data</em> <span className="sans-tag">only</span>
                </button>
                <button
                  className="gallery-subfilter-btn"
                  data-active={gridFilter === "emotion"}
                  onClick={() => {
                    playTap();
                    setGridFilter("emotion");
                  }}
                >
                  <em>emotion</em> <span className="sans-tag">only</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {metas.length === 0 && (
          <div className="gallery-empty">
            <p>No drawings yet.</p>
            <Link href="/draw" className="meta-link" onClick={() => playTap()}>
              Be the first
            </Link>
          </div>
        )}

        {view === "cycle" && currentMeta && (
          <div className="gallery-cycle">
            {currentDrawing ? (
              <DrawingPair
                drawing={currentDrawing}
                replayKey={`${currentDrawing.id}-${cycleIndex}`}
                animate
                loop={false}
                filter="both"
              />
            ) : (
              <DrawingPairPlaceholder meta={currentMeta} />
            )}
          </div>
        )}

        {view === "grid" && metas.length > 0 && (
          <div className="gallery-grid" data-filter={gridFilter}>
            {metas.map((m) => (
              <LazyDrawingCard
                key={m.id}
                meta={m}
                filter={gridFilter}
                drawing={cacheRef.current.get(m.id)}
                onVisible={() => loadDrawing(m.id)}
                cacheVersion={cacheVersion}
              />
            ))}
          </div>
        )}

        <div style={{ paddingBottom: "8rem" }} />
      </article>
    </div>
  );
}

/**
 * Grid card that defers loading the actual stroke data until the card
 * is about to scroll into view. Renders a placeholder until then.
 */
interface LazyDrawingCardProps {
  meta: DrawingMeta;
  filter: GridFilter;
  drawing?: Drawing;
  onVisible: () => void;
  cacheVersion: number;
}

function LazyDrawingCard({
  meta,
  filter,
  drawing,
  onVisible,
}: LazyDrawingCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (drawing) return; // already loaded
    if (triggeredRef.current) return;
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            triggeredRef.current = true;
            onVisible();
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [drawing, onVisible]);

  return (
    <div ref={wrapperRef}>
      {drawing ? (
        <DrawingPair
          drawing={drawing}
          replayKey={drawing.id ?? meta.id}
          animate={false}
          loop={false}
          filter={filter}
        />
      ) : (
        <DrawingPairPlaceholder meta={meta} filter={filter} />
      )}
    </div>
  );
}

interface DrawingPairProps {
  drawing: Drawing;
  replayKey: string | number;
  /** Animate the draw-on. */
  animate: boolean;
  /** Loop the replay (re-draw on every cycle). */
  loop: boolean;
  filter: GridFilter;
}

function DrawingPair({
  drawing,
  replayKey,
  animate,
  loop,
  filter,
}: DrawingPairProps) {
  const totalTime = drawing.data.durationMs + drawing.emotion.durationMs;

  const showData = filter === "both" || filter === "data";
  const showEmotion = filter === "both" || filter === "emotion";

  return (
    <figure className="drawing-pair">
      <div
        className="drawing-pair-canvases"
        data-cols={showData && showEmotion ? "two" : "one"}
      >
        {showData && (
          <div className="drawing-pair-half">
            <ReplayCanvas
              strokes={drawing.data.strokes}
              durationMs={REPLAY_DURATION_MS}
              loop={loop}
              static={!animate}
              replayKey={`data-${replayKey}`}
              className="drawing-pair-canvas"
            />
            <span className="drawing-pair-label">data</span>
          </div>
        )}
        {showEmotion && (
          <div className="drawing-pair-half">
            <ReplayCanvas
              strokes={drawing.emotion.strokes}
              durationMs={REPLAY_DURATION_MS}
              loop={loop}
              static={!animate}
              replayKey={`emotion-${replayKey}`}
              className="drawing-pair-canvas"
            />
            <span className="drawing-pair-label">emotion</span>
          </div>
        )}
      </div>
      <figcaption className="drawing-pair-caption">
        <span>{formatTimestamp(drawing.createdAt)}</span>
        <span className="meta-sep">·</span>
        <span>{formatDuration(totalTime)}</span>
      </figcaption>
    </figure>
  );
}

/** Empty-shaped placeholder used while a drawing's strokes are loading. */
function DrawingPairPlaceholder({
  meta,
  filter = "both",
}: {
  meta: DrawingMeta;
  filter?: GridFilter;
}) {
  const showData = filter === "both" || filter === "data";
  const showEmotion = filter === "both" || filter === "emotion";
  const totalTime = meta.dataDurationMs + meta.emotionDurationMs;

  return (
    <figure className="drawing-pair">
      <div
        className="drawing-pair-canvases"
        data-cols={showData && showEmotion ? "two" : "one"}
      >
        {showData && (
          <div className="drawing-pair-half drawing-pair-placeholder">
            <span className="drawing-pair-label">data</span>
          </div>
        )}
        {showEmotion && (
          <div className="drawing-pair-half drawing-pair-placeholder">
            <span className="drawing-pair-label">emotion</span>
          </div>
        )}
      </div>
      <figcaption className="drawing-pair-caption">
        <span>{formatTimestamp(meta.createdAt)}</span>
        <span className="meta-sep">·</span>
        <span>{formatDuration(totalTime)}</span>
      </figcaption>
    </figure>
  );
}
