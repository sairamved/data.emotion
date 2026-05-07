"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { playTap } from "@/lib/sounds";

interface NavProps {
  /** When true, shows the logo at top-left. Hide on landing where it appears in hero. */
  showLogo?: boolean;
  /** Hide the About link (e.g. when already on the About page). */
  hideAbout?: boolean;
}

export function Nav({ showLogo = true, hideAbout = false }: NavProps) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.5rem 2rem",
        pointerEvents: "none",
      }}
    >
      <div style={{ pointerEvents: "auto" }}>
        {showLogo && (
          <Link href="/" onClick={() => playTap()}>
            <Logo />
          </Link>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          pointerEvents: "auto",
        }}
      >
        {!hideAbout && (
          <Link href="/about" onClick={() => playTap()} className="nav-link">
            About
          </Link>
        )}
      </div>
    </nav>
  );
}
