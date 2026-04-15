import { Logo } from "@/components/Logo";
import { InfiniteNameList } from "@/components/InfiniteNameList";
import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        background: "#111111",
      }}
    >
      {/* Logo top-left */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          padding: "1.5rem 2rem",
          zIndex: 10,
        }}
      >
        <Link href="/">
          <Logo />
        </Link>
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
        <Link href="/about" className="about-link">
          About
        </Link>
      </div>

      {/* Gradient overlays for fade effect */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "20vh",
          background:
            "linear-gradient(to bottom, #111111 0%, transparent 100%)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "20vh",
          background: "linear-gradient(to top, #111111 0%, transparent 100%)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* Infinite scrolling name list */}
      <InfiniteNameList />
    </div>
  );
}
