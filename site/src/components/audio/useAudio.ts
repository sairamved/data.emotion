"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAudioStore } from "./store";

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const audioUrl = useAudioStore((s) => s.audioUrl);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playbackRate = useAudioStore((s) => s.playbackRate);
  const setIsPlaying = useAudioStore((s) => s.setIsPlaying);
  const setCurrentTime = useAudioStore((s) => s.setCurrentTime);
  const setDuration = useAudioStore((s) => s.setDuration);

  const startTicker = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const frame = () => {
      if (!audioRef.current) return;
      setCurrentTime(audioRef.current.currentTime);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
  }, [setCurrentTime]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const handleMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    const handlePause = () => {
      setIsPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    const handlePlay = () => {
      setIsPlaying(true);
    };

    audio.addEventListener("loadedmetadata", handleMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audioRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [setCurrentTime, setDuration, setIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioUrl) {
      audio.src = "";
      audio.load();
      return;
    }
    audio.src = audioUrl;
    audio.currentTime = 0;
    audio.load();
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = playbackRate;
  }, [playbackRate]);

  const play = useCallback(async () => {
    if (!audioRef.current || !audioUrl) return;
    try {
      const p = audioRef.current.play();
      playPromiseRef.current = p;
      await p;
      playPromiseRef.current = null;
      setIsPlaying(true);
      startTicker();
    } catch (error) {
      playPromiseRef.current = null;
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("[audio]", error);
    }
  }, [audioUrl, setIsPlaying, startTicker]);

  const pause = useCallback(async () => {
    if (!audioRef.current) return;
    if (playPromiseRef.current) {
      try { await playPromiseRef.current; } catch {}
      playPromiseRef.current = null;
    }
    audioRef.current.pause();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsPlaying(false);
  }, [setIsPlaying]);

  const toggle = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [isPlaying, pause, play]);

  const seek = useCallback(
    (time: number) => {
      if (!audioRef.current) return;
      const d = useAudioStore.getState().duration;
      const clamped = Math.max(0, Math.min(time, d));
      audioRef.current.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [setCurrentTime]
  );

  const skipForward = useCallback(
    (seconds = 15) => {
      const audio = audioRef.current;
      if (audio) seek(audio.currentTime + seconds);
    },
    [seek]
  );

  const skipBackward = useCallback(
    (seconds = 15) => {
      const audio = audioRef.current;
      if (audio) seek(audio.currentTime - seconds);
    },
    [seek]
  );

  return { play, pause, toggle, seek, skipForward, skipBackward };
}
