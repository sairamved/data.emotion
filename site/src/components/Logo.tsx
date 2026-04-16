"use client";

import { useState } from "react";
import { Calligraph } from "calligraph";

interface LogoProps {
  /** When true, always shows "Data + Emotion" (hover still works on top). */
  alwaysExpanded?: boolean;
}

export function Logo({ alwaysExpanded }: LogoProps = {}) {
  const [hovered, setHovered] = useState(false);
  const expanded = alwaysExpanded || hovered;

  return (
    <div
      className="logo-container"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0,
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 600,
          fontSize: "1.8rem",
          letterSpacing: "-0.02em",
        }}
      >
        <Calligraph
          variant="text"
          animation="snappy"
          initial={false}
          stagger={0.005}
          autoSize={false}
        >
          {expanded ? "Data " : "D"}
        </Calligraph>
      </span>
      <span
        style={{
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 600,
          fontSize: "1.8rem",
        }}
      >
        +
      </span>
      <span
        style={{
          fontFamily: '"et-book", serif',
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: "1.9rem",
        }}
      >
        <Calligraph
          variant="text"
          animation="snappy"
          initial={false}
          stagger={0.005}
          autoSize={false}
        >
          {expanded ? " Emotion" : "E"}
        </Calligraph>
      </span>
    </div>
  );
}
