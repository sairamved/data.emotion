"use client";

/**
 * Local-first storage layer.
 *
 * On submit:
 *   1. Always write to IndexedDB first (so the drawing survives offline)
 *   2. Try to push to Supabase
 *   3. If Supabase succeeds, mark the local copy synced
 *   4. If Supabase fails, leave it queued; a background retry loop drains the queue
 */

import type { Drawing, DrawingRow } from "./types";
import { drawingToRow, rowToDrawing } from "./types";
import { getSupabase } from "./supabase";

const DB_NAME = "data-emotion-drawings";
const DB_VERSION = 1;
const STORE = "queue";

interface QueueRow {
  /** local-only id; replaced once synced */
  localId: string;
  drawing: Drawing;
  syncedRemoteId: string | null;
  createdAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "localId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T> | T,
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    Promise.resolve(fn(store))
      .then((result) => {
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
      })
      .catch(reject);
  });
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function newLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Save a freshly-completed drawing. Returns the row that was saved
 * (with remote id if Supabase write succeeded).
 *
 * Always succeeds — if everything fails, the drawing is at least in IndexedDB.
 */
export async function saveDrawing(
  drawing: Drawing,
): Promise<{ id: string; synced: boolean }> {
  const localId = newLocalId();
  const row: QueueRow = {
    localId,
    drawing,
    syncedRemoteId: null,
    createdAt: new Date().toISOString(),
  };

  // 1. Always write locally first.
  await withStore("readwrite", (s) =>
    reqToPromise(s.put(row)),
  );

  // 2. Try remote.
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("drawings")
        .insert(drawingToRow(drawing))
        .select("id")
        .single();
      if (error) {
        console.error("[drawings] supabase insert failed:", error);
      } else if (data?.id) {
        row.syncedRemoteId = data.id;
        await withStore("readwrite", (s) =>
          reqToPromise(s.put(row)),
        );
        return { id: data.id, synced: true };
      }
    } catch (e) {
      console.error("[drawings] supabase insert threw:", e);
    }
  }

  return { id: localId, synced: false };
}

/**
 * Drain the queue: retry every locally-stored, unsynced drawing.
 * Safe to call repeatedly.
 */
export async function flushQueue(): Promise<{ synced: number; pending: number }> {
  const supabase = getSupabase();
  if (!supabase) return { synced: 0, pending: 0 };

  const all = await withStore<QueueRow[]>("readonly", (s) =>
    reqToPromise(s.getAll() as IDBRequest<QueueRow[]>),
  );
  const pending = all.filter((r) => !r.syncedRemoteId);

  let synced = 0;
  for (const row of pending) {
    try {
      const { data, error } = await supabase
        .from("drawings")
        .insert(drawingToRow(row.drawing))
        .select("id")
        .single();
      if (error) {
        console.warn("[drawings] flush retry failed:", error);
      } else if (data?.id) {
        row.syncedRemoteId = data.id;
        await withStore("readwrite", (s) =>
          reqToPromise(s.put(row)),
        );
        synced++;
      }
    } catch (e) {
      console.warn("[drawings] flush retry threw:", e);
    }
  }

  return { synced, pending: pending.length - synced };
}

export async function pendingCount(): Promise<number> {
  try {
    const all = await withStore<QueueRow[]>("readonly", (s) =>
      reqToPromise(s.getAll() as IDBRequest<QueueRow[]>),
    );
    return all.filter((r) => !r.syncedRemoteId).length;
  } catch {
    return 0;
  }
}

/**
 * Compute a stable content fingerprint from a drawing's stroke data + durations.
 * Two drawings with the same strokes & durations are considered duplicates
 * (this happens when the offline queue retries a payload that actually went through).
 */
export function drawingFingerprint(d: Drawing): string {
  return [
    d.data.strokes.length,
    d.emotion.strokes.length,
    Math.round(d.data.durationMs),
    Math.round(d.emotion.durationMs),
    // First & last point of each stroke is enough entropy to distinguish drawings
    // without paying the cost of hashing every point.
    ...d.data.strokes.map((s) =>
      s.length === 0
        ? "_"
        : `${s[0].x.toFixed(1)},${s[0].y.toFixed(1)}-${s[s.length - 1].x.toFixed(1)},${s[s.length - 1].y.toFixed(1)}`,
    ),
    ...d.emotion.strokes.map((s) =>
      s.length === 0
        ? "_"
        : `${s[0].x.toFixed(1)},${s[0].y.toFixed(1)}-${s[s.length - 1].x.toFixed(1)},${s[s.length - 1].y.toFixed(1)}`,
    ),
  ].join("|");
}

/** Filter out duplicate drawings, keeping the first occurrence (newest, given input is sorted). */
export function dedupeDrawings(drawings: Drawing[]): Drawing[] {
  const seen = new Set<string>();
  const out: Drawing[] = [];
  for (const d of drawings) {
    const fp = drawingFingerprint(d);
    if (seen.has(fp)) continue;
    seen.add(fp);
    out.push(d);
  }
  return out;
}

/** Fetch all drawings, newest first. Falls back to local-only if Supabase is missing. */
export async function fetchAllDrawings(): Promise<Drawing[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("drawings")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return dedupeDrawings((data as DrawingRow[]).map(rowToDrawing));
      }
    } catch {
      // fall through to local
    }
  }

  // Local fallback.
  try {
    const all = await withStore<QueueRow[]>("readonly", (s) =>
      reqToPromise(s.getAll() as IDBRequest<QueueRow[]>),
    );
    return dedupeDrawings(
      all
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .map((r) => r.drawing),
    );
  } catch {
    return [];
  }
}

/**
 * Subscribe to new drawings inserted into Supabase. Returns an unsubscribe fn.
 * No-op if Supabase isn't configured.
 */
export function subscribeToNewDrawings(
  onInsert: (drawing: Drawing) => void,
): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel("drawings-inserts")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "drawings" },
      (payload) => {
        const row = payload.new as DrawingRow;
        onInsert(rowToDrawing(row));
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
