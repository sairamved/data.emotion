"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Nav } from "@/components/Nav";
import { playTap, preloadTaps } from "@/lib/sounds";
import { asset } from "@/lib/asset";

interface Person {
  name: string;
  slug: string;
  role?: string;
  comingSoon?: boolean;
}

const people: Person[] = [
  { name: "Christian Stolte", slug: "christian-stolte", role: "Data Visualization Designer" },
  { name: "Giada Matteini", slug: "giada-matteini", role: "Founder and Director of WADE" },
  { name: "Jer Thorp", slug: "jer-thorp", role: "Artist & Author", comingSoon: true },
  { name: "Rasagy Sharma", slug: "rasagy-sharma", role: "Information Designer", comingSoon: true },
  { name: "Jason Forrest", slug: "jason-forrest", role: "Data Visualization Designer", comingSoon: true },
];

export default function Home() {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [docked, setDocked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const heroLogoRef = useRef<HTMLDivElement>(null);

  useEffect(() => { preloadTaps(); }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    function onScroll() {
      if (!heroLogoRef.current) return;
      const rect = heroLogoRef.current.getBoundingClientRect();
      setDocked(rect.bottom < 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#000000", minHeight: "100vh" }}>
      {/* Top nav — logo when docked (always on mobile) */}
      <Nav showLogo={isMobile || docked} />

      {/* Hero */}
      <section className="hero">
        <div className="hero-text">
          <div
            ref={heroLogoRef}
            className="hero-logo"
            style={{
              opacity: docked ? 0 : 1,
              display: isMobile ? "none" : undefined,
            }}
          >
            <Logo alwaysExpanded />
          </div>
          <p className="hero-tagline">
            Welcome, take a seat. This is an archive, a collection of
            conversations with people actively engaging with the idea of
            expressive data-viz.
          </p>
        </div>
        <div className="hero-video">
          <video
            src={asset("/videos/genuary26-29.mp4")}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        </div>
      </section>

      {/* Conversation list — left-aligned, simple */}
      <section className="people-list">
        <p className="people-label">Conversations</p>
        <div className="people-rows">
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
              className="person-row-simple"
              data-coming-soon={person.comingSoon ? "true" : undefined}
            >
              <span
                className="person-name-simple"
                style={{
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
                }}
              >
                {person.name}
              </span>
              {person.comingSoon && (
                <span className="person-coming-soon">coming soon</span>
              )}
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
