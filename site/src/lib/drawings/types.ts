/**
 * A single point captured from the Pointer Events API.
 * Stored verbatim so playback can reconstruct the drawing at any speed.
 */
export interface StrokePoint {
  /** x in canvas pixels (already DPR-divided so it's logical pixels) */
  x: number;
  /** y in canvas pixels */
  y: number;
  /** 0..1 from PointerEvent.pressure. Mouse fallback writes 0.5. */
  p: number;
  /** time in ms relative to the *first point of the first stroke* in this prompt */
  t: number;
}

export type Stroke = StrokePoint[];

export interface PromptResult {
  strokes: Stroke[];
  /** wall-clock duration spent in this prompt, ms */
  durationMs: number;
}

export interface Drawing {
  id?: string;
  data: PromptResult;
  emotion: PromptResult;
  createdAt?: string;
}

/** Serialized row shape for the Supabase `drawings` table. */
export interface DrawingRow {
  id: string;
  data_strokes: Stroke[];
  emotion_strokes: Stroke[];
  data_duration_ms: number;
  emotion_duration_ms: number;
  data_stroke_count: number;
  emotion_stroke_count: number;
  created_at: string;
}

/**
 * Lightweight metadata for a drawing — used for the gallery index so
 * we don't have to pull every stroke array up front (huge payloads).
 */
export interface DrawingMeta {
  id: string;
  createdAt: string;
  dataStrokeCount: number;
  emotionStrokeCount: number;
  dataDurationMs: number;
  emotionDurationMs: number;
}

export interface DrawingMetaRow {
  id: string;
  created_at: string;
  data_stroke_count: number;
  emotion_stroke_count: number;
  data_duration_ms: number;
  emotion_duration_ms: number;
}

export function rowToMeta(r: DrawingMetaRow): DrawingMeta {
  return {
    id: r.id,
    createdAt: r.created_at,
    dataStrokeCount: r.data_stroke_count,
    emotionStrokeCount: r.emotion_stroke_count,
    dataDurationMs: r.data_duration_ms,
    emotionDurationMs: r.emotion_duration_ms,
  };
}

export function rowToDrawing(r: DrawingRow): Drawing {
  return {
    id: r.id,
    data: { strokes: r.data_strokes, durationMs: r.data_duration_ms },
    emotion: {
      strokes: r.emotion_strokes,
      durationMs: r.emotion_duration_ms,
    },
    createdAt: r.created_at,
  };
}

export function drawingToRow(
  d: Drawing,
): Omit<DrawingRow, "id" | "created_at"> {
  return {
    data_strokes: d.data.strokes,
    emotion_strokes: d.emotion.strokes,
    // Postgres int4 columns reject fractional ms; round before sending.
    data_duration_ms: Math.round(d.data.durationMs),
    emotion_duration_ms: Math.round(d.emotion.durationMs),
    data_stroke_count: d.data.strokes.length,
    emotion_stroke_count: d.emotion.strokes.length,
  };
}
