"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAudioStore, type PlaybackRate } from "./store";
import { useAudio } from "./useAudio";
import { playTap } from "@/lib/sounds";

function formatTime(s: number): string {
  if (!s || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const PLAYBACK_RATES: PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

const ICON_TRANSITION = {
  initial: { opacity: 0, scale: 0.8, filter: "blur(2px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.8, filter: "blur(2px)" },
  transition: { duration: 0.15 },
} as const;

export function Player() {
  const {
    isPlayerVisible,
    isPlaying,
    currentTime,
    duration,
    title,
    author,
    playbackRate,
    audioUrl,
  } = useAudioStore();
  const setPlaybackRate = useAudioStore((s) => s.setPlaybackRate);

  const { toggle, seek, skipForward, skipBackward } = useAudio();

  const progress =
    duration > 0
      ? Math.min(Math.max((currentTime / duration) * 100, 0), 100)
      : 0;

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!audioUrl) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        playTap();
        toggle();
      } else if (e.key === "j" || (e.shiftKey && e.key === "ArrowLeft")) {
        e.preventDefault();
        playTap();
        skipBackward();
      } else if (e.key === "l" || (e.shiftKey && e.key === "ArrowRight")) {
        e.preventDefault();
        playTap();
        skipForward();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [audioUrl, toggle, skipForward, skipBackward]);

  if (!audioUrl || !isPlayerVisible) return null;

  return (
    <motion.div
      className="audio-player"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="audio-player-bg" />
      <div className="audio-player-controls">
        {/* Details */}
        <div className="audio-player-details">
          <div className="audio-player-cover">
            <div className="audio-player-orb" />
          </div>
          <div className="audio-player-info">
            <div className="audio-player-title">{title}</div>
            <div className="audio-player-author">{author}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="audio-player-progress">
          <span className="audio-player-time">{formatTime(currentTime)}</span>
          <div
            className="audio-player-slider"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * duration);
            }}
          >
            <div className="audio-player-track">
              <div
                className="audio-player-indicator"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="audio-player-time">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="audio-player-buttons">
          <button
            className="audio-player-btn"
            onClick={() => {
              playTap();
              skipBackward();
            }}
            aria-label="Rewind 15 seconds"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 17a1 1 0 0 1-1-1v-4l-5 3V9l5 3V8a1 1 0 0 1 1 1v3l5-3v6l-5-3v3a1 1 0 0 1-1 1z" fill="currentColor" stroke="none" />
              <path d="M3 12a9 9 0 1 0 9-9" />
              <polyline points="3 7 3 3 7 3" />
            </svg>
          </button>
          <button
            className="audio-player-btn audio-player-btn-play"
            onClick={() => {
              playTap();
              toggle();
            }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isPlaying ? (
                <motion.div {...ICON_TRANSITION} key="pause">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                </motion.div>
              ) : (
                <motion.div {...ICON_TRANSITION} key="play">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <button
            className="audio-player-btn"
            onClick={() => {
              playTap();
              skipForward();
            }}
            aria-label="Forward 15 seconds"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 17a1 1 0 0 0 1-1v-4l5 3V9l-5 3V8a1 1 0 0 0-1 1v3l-5-3v6l5-3v3a1 1 0 0 0 1 1z" fill="currentColor" stroke="none" />
              <path d="M21 12a9 9 0 1 1-9-9" />
              <polyline points="21 7 21 3 17 3" />
            </svg>
          </button>
          {/* Speed selector */}
          <div className="audio-player-speed">
            <select
              value={playbackRate}
              onChange={(e) => {
                playTap();
                setPlaybackRate(parseFloat(e.target.value) as PlaybackRate);
              }}
              className="audio-player-speed-select"
            >
              {PLAYBACK_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}x
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
