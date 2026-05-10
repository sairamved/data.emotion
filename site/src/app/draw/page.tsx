"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { DrawCanvas, type DrawCanvasHandle } from "@/components/draw/DrawCanvas";
import { playTap, preloadTaps } from "@/lib/sounds";
import {
  saveDrawing,
  flushQueue,
  pendingCount,
} from "@/lib/drawings/storage";
import type { Drawing, Stroke } from "@/lib/drawings/types";

type Phase = "data" | "emotion" | "saving" | "thanks";

export default function DrawPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("data");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [pending, setPending] = useState(0);
  const [hasDataStroke, setHasDataStroke] = useState(false);
  const [hasEmotionStroke, setHasEmotionStroke] = useState(false);

  const dataCanvasRef = useRef<DrawCanvasHandle>(null);
  const emotionCanvasRef = useRef<DrawCanvasHandle>(null);

  // Captured stroke data for each prompt.
  const dataResultRef = useRef<{
    strokes: Stroke[];
    durationMs: number;
  } | null>(null);

  // Wall-clock timing per prompt (set on first stroke, finalized on Done).
  const dataStartRef = useRef<number | null>(null);
  const emotionStartRef = useRef<number | null>(null);

  useEffect(() => {
    preloadTaps();
    flushQueue().then((r) => setPending(r.pending));
  }, []);

  /** Timer-based polling; updates the "syncing X" indicator. */
  useEffect(() => {
    const id = window.setInterval(async () => {
      const n = await pendingCount();
      setPending(n);
      if (n > 0) flushQueue();
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const handleDataDone = useCallback(() => {
    const handle = dataCanvasRef.current;
    if (!handle || handle.isEmpty()) return;
    playTap();
    const strokes = handle.getStrokes();
    const startedAt = dataStartRef.current ?? performance.now();
    dataResultRef.current = {
      strokes,
      durationMs: performance.now() - startedAt,
    };
    setPhase("emotion");
  }, []);

  const handleClearData = useCallback(() => {
    playTap();
    dataCanvasRef.current?.clear();
    dataStartRef.current = null;
    setHasDataStroke(false);
  }, []);

  const handleClearEmotion = useCallback(() => {
    playTap();
    emotionCanvasRef.current?.clear();
    emotionStartRef.current = null;
    setHasEmotionStroke(false);
  }, []);

  const handleEmotionDone = useCallback(async () => {
    const handle = emotionCanvasRef.current;
    if (!handle || handle.isEmpty()) return;
    if (!dataResultRef.current) return;
    playTap();

    const startedAt = emotionStartRef.current ?? performance.now();
    const drawing: Drawing = {
      data: dataResultRef.current,
      emotion: {
        strokes: handle.getStrokes(),
        durationMs: performance.now() - startedAt,
      },
    };

    setPhase("saving");
    const result = await saveDrawing(drawing);
    setSavedId(result.id);
    setPhase("thanks");
  }, []);

  const goToGallery = useCallback(() => {
    playTap();
    router.push("/gallery");
  }, [router]);

  return (
    <div style={{ background: "#000000", minHeight: "100vh" }}>
      <Nav showLogo />

      <main className="draw-page">
        {phase !== "thanks" && (
          <header className="draw-prompt">
            <p className="draw-prompt-eyebrow">
              {phase === "data" || phase === "emotion"
                ? phase === "data"
                  ? "Step 1 of 2"
                  : "Step 2 of 2"
                : ""}
            </p>
            <h1 className="draw-prompt-title">
              {phase === "data" && (
                <>
                  Draw what <em>data</em> feels like to you
                </>
              )}
              {phase === "emotion" && (
                <>
                  Draw what <em>emotion</em> feels like to you
                </>
              )}
              {phase === "saving" && <>Saving your marks…</>}
            </h1>
          </header>
        )}

        {phase === "data" && (
          <div className="draw-canvas-frame">
            <DrawCanvas
              ref={dataCanvasRef}
              onFirstStrokeStart={() => {
                if (dataStartRef.current === null) {
                  dataStartRef.current = performance.now();
                }
                setHasDataStroke(true);
              }}
            />
            <button
              className="draw-icon-btn draw-icon-btn-tl"
              onClick={handleClearData}
              aria-label="Clear"
              disabled={!hasDataStroke}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7V2H17V4ZM9 9V17H11V9H9ZM13 9V17H15V9H13Z" />
              </svg>
            </button>
            {hasDataStroke && (
              <button
                className="draw-icon-btn draw-icon-btn-primary draw-icon-btn-tr"
                onClick={handleDataDone}
                aria-label="Done"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z" />
                </svg>
              </button>
            )}
          </div>
        )}

        {phase === "emotion" && (
          <div className="draw-canvas-frame">
            <DrawCanvas
              ref={emotionCanvasRef}
              onFirstStrokeStart={() => {
                if (emotionStartRef.current === null) {
                  emotionStartRef.current = performance.now();
                }
                setHasEmotionStroke(true);
              }}
            />
            <button
              className="draw-icon-btn draw-icon-btn-tl"
              onClick={handleClearEmotion}
              aria-label="Clear"
              disabled={!hasEmotionStroke}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7V2H17V4ZM9 9V17H11V9H9ZM13 9V17H15V9H13Z" />
              </svg>
            </button>
            {hasEmotionStroke && (
              <button
                className="draw-icon-btn draw-icon-btn-primary draw-icon-btn-tr"
                onClick={handleEmotionDone}
                aria-label="Done"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z" />
                </svg>
              </button>
            )}
          </div>
        )}

        {phase === "saving" && (
          <div className="draw-saving">
            <p>Saving…</p>
          </div>
        )}

        {phase === "thanks" && (
          <div className="draw-thanks">
            <p className="draw-thanks-eyebrow">Saved</p>
            <h2 className="draw-thanks-title">
              The marks you made are entering an archive of how people feel about{" "}
              <em>data</em> and <em>emotion</em>.
            </h2>
            <p className="draw-thanks-body">
              See the full archive.
            </p>
            <button className="draw-btn draw-btn-primary" onClick={goToGallery}>
              Enter the gallery
            </button>
            {pending > 0 && (
              <p className="draw-thanks-syncing">
                Syncing {pending} drawing{pending === 1 ? "" : "s"}…
              </p>
            )}
            <p className="draw-thanks-foot">
              <Link href="/draw" className="meta-link" onClick={() => playTap()}>
                Draw again
              </Link>
            </p>
            {savedId && (
              <p style={{ display: "none" }} aria-hidden>
                {savedId}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
