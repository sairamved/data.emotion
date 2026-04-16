"use client";

import { useEffect } from "react";
import { ContentLayout } from "./ContentLayout";
import { Player } from "./audio/Player";
import { useAudioStore } from "./audio/store";
import { playTap, preloadTaps } from "@/lib/sounds";

interface ConversationLayoutProps {
  children: React.ReactNode;
  name: string;
  date?: string;
  location?: string;
  audioUrl?: string;
}

export function ConversationLayout({
  children,
  name,
  date,
  location,
  audioUrl,
}: ConversationLayoutProps) {
  const setAudioData = useAudioStore((s) => s.setAudioData);
  const isPlayerVisible = useAudioStore((s) => s.isPlayerVisible);
  const reset = useAudioStore((s) => s.reset);

  useEffect(() => {
    preloadTaps();
  }, []);

  useEffect(() => {
    if (audioUrl) {
      setAudioData(audioUrl, name, "data + emotion");
    }
    return () => {
      reset();
    };
  }, [audioUrl, name, setAudioData, reset]);

  return (
    <div style={{ background: "#111111", minHeight: "100vh" }}>
      <ContentLayout backHref="/" backLabel="Back">
        <article>
          <h1>{name}</h1>
          {(location || date) && (
            <p className="subtitle">
              {location}
              {location && date && " — "}
              {date}
            </p>
          )}

          {/* Play button to start audio */}
          {audioUrl && !isPlayerVisible && (
            <button
              className="conversation-play-btn"
              onClick={() => {
                playTap();
                setAudioData(audioUrl, name, "data + emotion");
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6,3 20,12 6,21" />
              </svg>
              <span>Listen to conversation</span>
            </button>
          )}

          {children}

          <section style={{ paddingBottom: isPlayerVisible ? "14rem" : "8rem" }} />
        </article>
      </ContentLayout>
      <Player />
    </div>
  );
}
