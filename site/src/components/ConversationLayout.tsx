"use client";

import { useEffect, useRef } from "react";
import { Nav } from "./Nav";
import { Player } from "./audio/Player";
import { useAudioStore } from "./audio/store";
import { preloadTaps } from "@/lib/sounds";

interface ConversationLayoutProps {
  children: React.ReactNode;
  name: string;
  role?: React.ReactNode;
  date?: string;
  location?: string;
  audioUrl?: string;
}

export function ConversationLayout({
  children,
  name,
  role,
  date,
  location,
  audioUrl,
}: ConversationLayoutProps) {
  const setAudioData = useAudioStore((s) => s.setAudioData);
  const isPlayerVisible = useAudioStore((s) => s.isPlayerVisible);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const currentTime = useAudioStore((s) => s.currentTime);
  const reset = useAudioStore((s) => s.reset);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => { preloadTaps(); }, []);

  // Open player automatically when an audioUrl is provided
  useEffect(() => {
    if (audioUrl) {
      setAudioData(audioUrl, name, "Data + Emotion");
    }
    return () => { reset(); };
  }, [audioUrl, name, setAudioData, reset]);

  // Mark only the first paragraph of each new speaker (so avatars don't repeat)
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const allParagraphs = body.querySelectorAll<HTMLElement>("p[data-speaker]");
    let prevSpeaker: string | null = null;
    allParagraphs.forEach((p) => {
      const s = p.dataset.speaker || null;
      if (s && s !== prevSpeaker) {
        p.setAttribute("data-speaker-first", "true");
      } else {
        p.removeAttribute("data-speaker-first");
      }
      prevSpeaker = s;
    });
  }, [children]);

  // Sync paragraph highlight with audio time
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const paragraphs = body.querySelectorAll<HTMLElement>("p[data-time]");
    if (paragraphs.length === 0) return;

    // If not playing, clear all states (everything reads normally)
    if (!isPlaying) {
      paragraphs.forEach((p) => {
        p.removeAttribute("data-active");
        p.removeAttribute("data-passed");
      });
      return;
    }

    // Find the active paragraph: the latest whose data-time <= currentTime + lookahead.
    // Lookahead lets the highlight switch slightly before the speaker hits the next paragraph.
    const LOOKAHEAD = 0.0;
    let activeIndex = -1;
    paragraphs.forEach((p, i) => {
      const t = parseFloat(p.dataset.time || "0");
      if (t <= currentTime + LOOKAHEAD) activeIndex = i;
    });

    paragraphs.forEach((p, i) => {
      if (i === activeIndex) {
        p.setAttribute("data-active", "true");
        p.removeAttribute("data-passed");
      } else if (i < activeIndex) {
        p.removeAttribute("data-active");
        p.setAttribute("data-passed", "true");
      } else {
        p.removeAttribute("data-active");
        p.removeAttribute("data-passed");
      }
    });
  }, [isPlaying, currentTime]);

  return (
    <div style={{ background: "#000000", minHeight: "100vh" }}>
      <Nav showLogo />

      <article className="conversation">
        <header className="conversation-header">
          <h1 className="conversation-title">{name}</h1>
          <div className="conversation-meta">
            {role && <span>{role}</span>}
            {role && (location || date) && <span className="meta-sep">·</span>}
            {location && <span>{location}</span>}
            {location && date && <span className="meta-sep">·</span>}
            {date && <span>{date}</span>}
          </div>
        </header>

        <div className="conversation-body" ref={bodyRef}>{children}</div>

        <div style={{ paddingBottom: isPlayerVisible ? "14rem" : "8rem" }} />
      </article>

      <Player />
    </div>
  );
}
