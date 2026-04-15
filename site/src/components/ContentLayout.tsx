"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function ContentLayout({
  children,
  backHref = "/",
  backLabel = "Back",
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const els = article.querySelectorAll("h2, h3");
    const items: Heading[] = [];
    els.forEach((el) => {
      if (!el.id) {
        el.id = el.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || "";
      }
      items.push({
        id: el.id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      });
    });
    setHeadings(items);
  }, []);

  const checkIfAtBottom = useCallback(() => {
    if (headings.length === 0) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setActiveId(headings[headings.length - 1].id);
    }
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener("scroll", checkIfAtBottom, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", checkIfAtBottom);
    };
  }, [headings, checkIfAtBottom]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar - back link + heading navigation */}
      <nav
        className="content-sidebar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "220px",
          height: "100vh",
          padding: "1.5rem 1.5rem 2rem 2rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.15rem",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", marginBottom: "1.5rem" }}>
          <Logo />
        </Link>
        <Link
          href={backHref}
          className="back-link"
          style={{
            display: "block",
            fontFamily: '"Manrope", sans-serif',
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "rgba(255, 255, 248, 0.55)",
            textDecoration: "none",
            transition: "color 0.2s ease",
            marginBottom: "0.75rem",
            letterSpacing: "0.01em",
          }}
        >
          &#9756;&ensp;{backLabel}
        </Link>
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className="sidebar-link"
            data-active={activeId === heading.id ? "true" : undefined}
            style={{
              display: "block",
              fontFamily: '"Manrope", sans-serif',
              fontSize: heading.level === 2 ? "0.85rem" : "0.78rem",
              fontWeight: heading.level === 2 ? 600 : 400,
              color:
                activeId === heading.id
                  ? "rgba(255, 255, 248, 0.9)"
                  : "rgba(255, 255, 248, 0.55)",
              textDecoration: "none",
              paddingLeft: heading.level === 3 ? "0.75rem" : 0,
              padding: "0.15rem 0",
              paddingRight: 0,
              transition: "color 0.2s ease",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
            }}
          >
            {heading.text}
          </a>
        ))}
      </nav>

      {/* Main content — offset by sidebar width */}
      <div className="content-main" style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
