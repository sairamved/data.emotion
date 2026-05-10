"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { getStroke } from "perfect-freehand";
import type { Stroke, StrokePoint } from "@/lib/drawings/types";

export interface DrawCanvasHandle {
  /** Returns the captured strokes for this canvas. */
  getStrokes: () => Stroke[];
  /** Wipe the canvas and stroke buffer. */
  clear: () => void;
  /** Whether the user has drawn anything yet. */
  isEmpty: () => boolean;
}

interface DrawCanvasProps {
  /** Called once on first stroke start, used to mark the prompt's start time. */
  onFirstStrokeStart?: () => void;
  /** Color for the strokes. Defaults to off-white. */
  color?: string;
  /** Background fill. Defaults to pure black. */
  background?: string;
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

export const DrawCanvas = forwardRef<DrawCanvasHandle, DrawCanvasProps>(
  function DrawCanvas(
    { onFirstStrokeStart, color = "#fffff8", background = "#000000" },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const strokesRef = useRef<Stroke[]>([]);
    const currentStrokeRef = useRef<Stroke | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const dprRef = useRef<number>(1);
    const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
    const [, setVersion] = useState(0);

    /** Re-render the entire canvas from `strokesRef`. */
    const redraw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w, h } = sizeRef.current;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = color;

      // Render finished strokes.
      for (const stroke of strokesRef.current) {
        if (stroke.length === 0) continue;
        const inputPoints = stroke.map((p) => [p.x, p.y, p.p] as [number, number, number]);
        const outline = getStroke(inputPoints, STROKE_OPTS);
        const path = strokeToPath(outline);
        if (path) ctx.fill(new Path2D(path));
      }

      // Render the in-flight stroke.
      const cur = currentStrokeRef.current;
      if (cur && cur.length > 0) {
        const inputPoints = cur.map((p) => [p.x, p.y, p.p] as [number, number, number]);
        const outline = getStroke(inputPoints, STROKE_OPTS);
        const path = strokeToPath(outline);
        if (path) ctx.fill(new Path2D(path));
      }
    }, [color, background]);

    /** Resize canvas to the container's actual size, accounting for DPR. */
    const resizeToContainer = useCallback(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      sizeRef.current = { w: rect.width, h: rect.height };

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      redraw();
    }, [redraw]);

    useEffect(() => {
      resizeToContainer();
      const ro = new ResizeObserver(resizeToContainer);
      if (containerRef.current) ro.observe(containerRef.current);
      window.addEventListener("orientationchange", resizeToContainer);
      return () => {
        ro.disconnect();
        window.removeEventListener("orientationchange", resizeToContainer);
      };
    }, [resizeToContainer]);

    useImperativeHandle(
      ref,
      () => ({
        getStrokes: () => strokesRef.current,
        clear: () => {
          strokesRef.current = [];
          currentStrokeRef.current = null;
          startTimeRef.current = null;
          redraw();
          setVersion((v) => v + 1);
        },
        isEmpty: () => strokesRef.current.length === 0,
      }),
      [redraw],
    );

    /** Convert a PointerEvent into a StrokePoint relative to the canvas. */
    const pointFromEvent = useCallback(
      (e: PointerEvent | React.PointerEvent): StrokePoint | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // pressure: pen reports 0..1; mouse reports 0 on press by default,
        // so substitute a steady mid-pressure for non-pen pointers.
        const isPen = (e as PointerEvent).pointerType === "pen";
        const pressure = isPen
          ? Math.max(0.08, (e as PointerEvent).pressure || 0.5)
          : 0.5;

        const now = performance.now();
        if (startTimeRef.current === null) startTimeRef.current = now;
        const t = now - startTimeRef.current;

        return { x, y, p: pressure, t };
      },
      [],
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        // Only capture primary pointer; ignore secondary fingers (palm rejection).
        if (!e.isPrimary) return;
        e.preventDefault();
        (e.target as Element).setPointerCapture(e.pointerId);

        const pt = pointFromEvent(e);
        if (!pt) return;

        if (strokesRef.current.length === 0 && currentStrokeRef.current === null) {
          onFirstStrokeStart?.();
        }

        currentStrokeRef.current = [pt];
        redraw();
      },
      [pointFromEvent, redraw, onFirstStrokeStart],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!e.isPrimary) return;
        const cur = currentStrokeRef.current;
        if (!cur) return;
        e.preventDefault();

        // Use coalesced events on iPadOS/Safari for high-frequency pen samples
        const native = e.nativeEvent as PointerEvent;
        const events: PointerEvent[] =
          typeof (native as unknown as { getCoalescedEvents?: () => PointerEvent[] })
            .getCoalescedEvents === "function"
            ? (native as unknown as { getCoalescedEvents: () => PointerEvent[] }).getCoalescedEvents() || [native]
            : [native];

        for (const ev of events) {
          const pt = pointFromEvent(ev);
          if (pt) cur.push(pt);
        }
        redraw();
      },
      [pointFromEvent, redraw],
    );

    const finishStroke = useCallback(() => {
      const cur = currentStrokeRef.current;
      if (cur && cur.length > 0) {
        strokesRef.current.push(cur);
      }
      currentStrokeRef.current = null;
      redraw();
      setVersion((v) => v + 1);
    }, [redraw]);

    const handlePointerUp = useCallback(
      (e: React.PointerEvent) => {
        if (!e.isPrimary) return;
        e.preventDefault();
        finishStroke();
      },
      [finishStroke],
    );

    return (
      <div
        ref={containerRef}
        className="draw-canvas-container"
        style={{
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          background,
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={(e) => {
            // If the pen leaves the canvas with a stroke in progress, end it cleanly.
            if (currentStrokeRef.current && e.isPrimary) finishStroke();
          }}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            touchAction: "none",
          }}
        />
      </div>
    );
  },
);
