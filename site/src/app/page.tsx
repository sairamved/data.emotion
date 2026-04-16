"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { playTap, preloadTaps } from "@/lib/sounds";

interface Person {
  name: string;
  slug: string;
  comingSoon?: boolean;
}

const people: Person[] = [
  { name: "Christian Stolte", slug: "christian-stolte" },
  { name: "Giada Matteini", slug: "giada-matteini" },
  { name: "Jer Thorp", slug: "jer-thorp", comingSoon: true },
  { name: "Rasagy Sharma", slug: "rasagy-sharma", comingSoon: true },
  { name: "Jason Forrest", slug: "jason-forrest", comingSoon: true },
];

export default function Home() {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    preloadTaps();
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 80);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        background: "#111111",
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Fixed small logo at top-left — fades in on scroll (with hover expand/collapse) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          padding: "1.5rem 2rem",
          zIndex: 10,
          opacity: scrolled ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: scrolled ? "auto" : "none",
        }}
      >
        <Link href="/" onClick={() => playTap()}>
          <Logo />
        </Link>
      </div>

      {/* Hero — Logo component scaled up via CSS transform, always expanded */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "0 12vw",
        }}
      >
        <div
          style={{
            transform: "scale(3.2)",
            transformOrigin: "top left",
            marginBottom: "5rem",
          }}
        >
          <Logo alwaysExpanded />
        </div>
        <p
          style={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 400,
            fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
            color: "rgba(255, 255, 248, 0.3)",
            marginTop: "2rem",
            maxWidth: "28em",
            lineHeight: 1.6,
            letterSpacing: "0.01em",
          }}
        >
          How does expressive visualization of data influence its effectiveness,
          and where is this form of communication heading?
        </p>
      </div>

      {/* Conversations list */}
      <div
        style={{
          padding: "4rem 12vw 12rem",
        }}
      >
        <p
          style={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 500,
            fontSize: "0.75rem",
            color: "rgba(255, 255, 248, 0.25)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: "2rem",
          }}
        >
          Conversations
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          {people.map((person) => (
            <Link
              key={person.slug}
              href={person.comingSoon ? "#" : `/conversation/${person.slug}`}
              onClick={(e) => {
                playTap();
                if (person.comingSoon) e.preventDefault();
              }}
              onMouseEnter={() => setHoveredSlug(person.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "1rem",
                padding: "0.7rem 0",
                textDecoration: "none",
                cursor: person.comingSoon ? "default" : "pointer",
                transition: "opacity 0.2s ease",
              }}
            >
              <span
                style={{
                  fontFamily: '"et-book", serif',
                  fontWeight: 700,
                  fontStyle: "italic",
                  fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                  color:
                    hoveredSlug === null
                      ? person.comingSoon
                        ? "rgba(255, 255, 248, 0.12)"
                        : "rgba(255, 255, 248, 0.6)"
                      : hoveredSlug === person.slug
                        ? person.comingSoon
                          ? "rgba(255, 255, 248, 0.12)"
                          : "#fffff8"
                        : "rgba(255, 255, 248, 0.15)",
                  transition: "color 0.25s ease",
                  lineHeight: 1.2,
                }}
              >
                {person.name}
              </span>
              {person.comingSoon && (
                <span
                  style={{
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: "0.7rem",
                    fontWeight: 400,
                    color: "rgba(255, 255, 248, 0.15)",
                    fontStyle: "italic",
                  }}
                >
                  coming soon
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* About link bottom-left */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          padding: "2.5rem 3.5rem",
          zIndex: 10,
        }}
      >
        <Link
          href="/about"
          className="about-link"
          onClick={() => playTap()}
        >
          About
        </Link>
      </div>
    </div>
  );
}
