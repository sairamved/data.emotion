"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { ReplayCanvas } from "@/components/draw/ReplayCanvas";
import { playTap, preloadTaps } from "@/lib/sounds";
import {
  fetchAllDrawings,
  subscribeToNewDrawings,
  drawingFingerprint,
} from "@/lib/drawings/storage";
import type { Drawing } from "@/lib/drawings/types";

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
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [view, setView] = useState<View>("cycle");
  const [gridFilter, setGridFilter] = useState<GridFilter>("both");
  const [cycleIndex, setCycleIndex] = useState(0);
  const drawingsRef = useRef<Drawing[]>([]);
  const fingerprintsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    preloadTaps();
  }, []);

  // Initial fetch.
  useEffect(() => {
    let cancelled = false;
    fetchAllDrawings().then((d) => {
      if (cancelled) return;
      drawingsRef.current = d;
      fingerprintsRef.current = new Set(d.map(drawingFingerprint));
      setDrawings(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Realtime subscription. Dedupe by both Supabase id (authoritative) AND
  // content fingerprint (catches retried-but-already-synced drawings).
  useEffect(() => {
    const unsub = subscribeToNewDrawings((d) => {
      const fp = drawingFingerprint(d);
      const idMatch =
        d.id &&
        drawingsRef.current.some((existing) => existing.id === d.id);
      if (idMatch || fingerprintsRef.current.has(fp)) return;
      fingerprintsRef.current.add(fp);
      drawingsRef.current = [d, ...drawingsRef.current];
      setDrawings([...drawingsRef.current]);
    });
    return unsub;
  }, []);

  // Auto-advance cycle.
  useEffect(() => {
    if (view !== "cycle" || drawings.length === 0) return;
    const id = window.setInterval(() => {
      setCycleIndex((i) => (i + 1) % Math.max(drawings.length, 1));
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [view, drawings.length]);

  // Keep cycleIndex in range when drawings list shrinks.
  useEffect(() => {
    if (cycleIndex >= drawings.length && drawings.length > 0) {
      setCycleIndex(0);
    }
  }, [cycleIndex, drawings.length]);

  const current = drawings[cycleIndex];

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

          {view === "grid" && drawings.length > 0 && (
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

        {drawings.length === 0 && (
          <div className="gallery-empty">
            <p>No drawings yet.</p>
            <Link href="/draw" className="meta-link" onClick={() => playTap()}>
              Be the first
            </Link>
          </div>
        )}

        {view === "cycle" && current && (
          <div className="gallery-cycle">
            <DrawingPair
              drawing={current}
              replayKey={`${current.id ?? cycleIndex}-${cycleIndex}`}
              animate
              loop={false}
              filter="both"
            />
          </div>
        )}

        {view === "grid" && drawings.length > 0 && (
          <div className="gallery-grid" data-filter={gridFilter}>
            {drawings.map((d, i) => (
              <DrawingPair
                key={d.id ?? `${i}-${d.createdAt ?? i}`}
                drawing={d}
                replayKey={d.id ?? i}
                animate={false}
                loop={false}
                filter={gridFilter}
              />
            ))}
          </div>
        )}

        <div style={{ paddingBottom: "8rem" }} />
      </article>
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

