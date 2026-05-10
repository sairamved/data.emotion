"use client";

import { useEffect, useRef } from "react";
import { getStroke } from "perfect-freehand";
import type { Stroke, StrokePoint } from "@/lib/drawings/types";

interface ReplayCanvasProps {
  strokes: Stroke[];
  /** Total ms allotted to replay regardless of original duration. */
  durationMs?: number;
  /** Whether replay should auto-loop. */
  loop?: boolean;
  /** When true, render the entire drawing instantly (no animation). */
  static?: boolean;
  /** Re-trigger replay when this value changes. */
  replayKey?: string | number;
  className?: string;
  /** Background color. Pass "transparent" when stacking onion-skin layers. */
  background?: string;
  color?: string;
  style?: React.CSSProperties;
}

const STROKE_OPTS = {
  size: 6,
  thinning: 0.55,
  smoothing: 0.55,
  streamline: 0.45,
  easing: (t: number) => t,
  start: { taper: 0, cap: true },
  end: { taper: 0, cap: true },
  simulatePressure: false,
};

const LOOP_PAUSE_MS = 600;

function strokeToPath(stroke: number[][]): string {
  if (stroke.length === 0) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", stroke[0][0], stroke[0][1], "Q"] as (string | number)[],
  );
  d.push("Z");
  return d.join(" ");
}

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function computeBounds(strokes: Stroke[]): Bounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let any = false;
  for (const s of strokes) {
    for (const p of s) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
      any = true;
    }
  }
  if (!any) return null;
  return { minX, minY, maxX, maxY };
}

/**
 * Replay a recorded drawing onto a canvas. Strokes are rendered up to
 * the current animation time; uses captured per-point timings, scaled so
 * the whole replay finishes in `durationMs`.
 */
export function ReplayCanvas({
  strokes,
  durationMs = 2200,
  loop = true,
  static: isStatic = false,
  replayKey,
  className,
  background = "#000000",
  color = "#fffff8",
  style,
}: ReplayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    let rafId: number | null = null;
    let pauseTimer: number | null = null;

    const bounds = computeBounds(strokes);

    // Total recorded length in ms.
    let lastT = 1;
    for (const s of strokes) {
      if (s.length > 0) {
        const t = s[s.length - 1].t;
        if (t > lastT) lastT = t;
      }
    }

    function fit() {
      if (!canvas || !ctx || !container) return false;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }

    function render(progress: number) {
      if (!canvas || !ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.fillStyle = background;
      ctx.fillRect(0, 0, w, h);

      if (!bounds) return;

      const pad = Math.min(w, h) * 0.06;
      const bw = bounds.maxX - bounds.minX;
      const bh = bounds.maxY - bounds.minY;
      const scale = Math.min(
        (w - 2 * pad) / Math.max(bw, 1),
        (h - 2 * pad) / Math.max(bh, 1),
      );
      const tx = (w - bw * scale) / 2 - bounds.minX * scale;
      const ty = (h - bh * scale) / 2 - bounds.minY * scale;

      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);
      ctx.fillStyle = color;

      const animatedT = progress * lastT;

      for (const stroke of strokes) {
        if (stroke.length === 0) continue;
        const visible: StrokePoint[] = [];
        for (const p of stroke) {
          if (p.t <= animatedT) visible.push(p);
          else break;
        }
        if (visible.length === 0) continue;
        const inputPoints = visible.map(
          (p) => [p.x, p.y, p.p] as [number, number, number],
        );
        const outline = getStroke(inputPoints, STROKE_OPTS);
        const path = strokeToPath(outline);
        if (path) ctx.fill(new Path2D(path));
      }
      ctx.restore();
    }

    // First fit + render (may no-op if container width is 0 at mount).
    fit();
    render(isStatic || strokes.length === 0 ? 1 : 0);

    // ResizeObserver: re-fit and re-render whenever the container size changes
    // (including the first time it gets laid out, when initial fit() was a no-op).
    const ro = new ResizeObserver(() => {
      const ok = fit();
      if (ok && (isStatic || strokes.length === 0)) {
        render(1);
      }
      // For animated mode, the running rAF loop already calls render() each frame.
    });
    ro.observe(container);

    if (isStatic || strokes.length === 0) {
      return () => {
        cancelled = true;
        ro.disconnect();
      };
    }

    function startCycle() {
      if (cancelled) return;
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const elapsed = now - start;
        const progress = Math.min(elapsed / durationMs, 1);
        render(progress);
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else if (loop) {
          pauseTimer = window.setTimeout(startCycle, LOOP_PAUSE_MS);
        }
      };
      rafId = requestAnimationFrame(tick);
    }

    startCycle();

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (pauseTimer !== null) clearTimeout(pauseTimer);
      ro.disconnect();
    };
  }, [strokes, durationMs, loop, isStatic, replayKey, background, color]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ background, ...style }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
