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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C17.5228 2 22 6.47715 22 12 22 17.5228 17.5228 22 12 22 6.47715 22 2 17.5228 2 12H4C4 16.4183 7.58172 20 12 20 16.4183 20 20 16.4183 20 12 20 7.58172 16.4183 4 12 4 9.25022 4 6.82447 5.38734 5.38451 7.50024L8 7.5V9.5H2V3.5H4L3.99989 5.99918C5.82434 3.57075 8.72873 2 12 2ZM8.5 15.5V8.5H10V15.5H8.5ZM12 8.5H16.75V10H13.5V11.25H14.875C16.0486 11.25 17 12.2014 17 13.375 17 14.5486 16.0486 15.5 14.875 15.5H12V14H14.875C15.2202 14 15.5 13.7202 15.5 13.375 15.5 13.0298 15.2202 12.75 14.875 12.75H12V8.5Z" />
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.47715 2 2 6.47715 2 12 2 17.5228 6.47715 22 12 22 17.5228 22 22 17.5228 22 12H20C20 16.4183 16.4183 20 12 20 7.58172 20 4 16.4183 4 12 4 7.58172 7.58172 4 12 4 14.7498 4 17.1755 5.38734 18.6155 7.50024L16 7.5V8.5H12V12.75H14.875C15.2202 12.75 15.5 13.0298 15.5 13.375 15.5 13.7202 15.2202 14 14.875 14H12V15.5H14.875C16.0486 15.5 17 14.5486 17 13.375 17 12.2014 16.0486 11.25 14.875 11.25H13.5V10H16.75V9.5H22V3.5H20L20.0001 5.99918C18.1757 3.57075 15.2713 2 12 2ZM8.5 8.5H10V15.5H8.5V8.5Z" />
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
