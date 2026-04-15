"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Lenis from "lenis";

interface Person {
  name: string;
  slug: string;
}

const people: Person[] = [
  { name: "Christian Stolte", slug: "christian-stolte" },
  { name: "Giada Matteini", slug: "giada-matteini" },
  { name: "Jer Thorp", slug: "jer-thorp" },
  { name: "Rasagy Sharma", slug: "rasagy-sharma" },
  { name: "Jason Forrest", slug: "jason-forrest" },
];

export function InfiniteNameList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const isSnapping = useRef(false);
  const snapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const repetitions = 20;
  const repeatedPeople = Array.from(
    { length: repetitions },
    () => people
  ).flat();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const lenis = new Lenis({
      wrapper: container,
      content: container.firstElementChild as HTMLElement,
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.8,
    });
    lenisRef.current = lenis;

    // Scroll to middle on mount
    const singleSetHeight = container.scrollHeight / repetitions;
    const middleOffset = singleSetHeight * (repetitions / 2);
    lenis.scrollTo(middleOffset, { immediate: true });

    function snapToNearest() {
      if (!container || isSnapping.current) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestItem: HTMLAnchorElement | null = null;
      let closestDistance = Infinity;

      for (const item of itemRefs.current) {
        if (!item) continue;
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(itemCenter - containerCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestItem = item;
        }
      }

      if (closestItem && lenisRef.current) {
        // If already close enough, don't snap
        if (closestDistance < 2) return;

        isSnapping.current = true;
        const itemRect = closestItem.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        const offset = itemCenter - containerCenter;
        const target = container.scrollTop + offset;

        lenisRef.current.scrollTo(target, {
          duration: 0.6,
          onComplete: () => {
            isSnapping.current = false;
          },
        });
      }
    }

    let isJumping = false;

    function handleScroll({ velocity }: { velocity: number }) {
      if (isJumping) return;

      const scrollTop = container!.scrollTop;
      const totalHeight = container!.scrollHeight;

      // Infinite loop: jump when near edges
      if (scrollTop < singleSetHeight * 2) {
        const jump = singleSetHeight * (repetitions / 2);
        isJumping = true;
        lenis.scrollTo(scrollTop + jump, { immediate: true });
        isJumping = false;
      } else if (scrollTop > totalHeight - singleSetHeight * 4) {
        const jump = singleSetHeight * (repetitions / 2);
        isJumping = true;
        lenis.scrollTo(scrollTop - jump, { immediate: true });
        isJumping = false;
      }

      // Only schedule snap when user scroll is settling (not during our own snap)
      if (!isSnapping.current) {
        if (snapTimeout.current) clearTimeout(snapTimeout.current);
        snapTimeout.current = setTimeout(() => {
          // Check velocity is near zero before snapping
          if (Math.abs(velocity) < 0.5) {
            snapToNearest();
          }
        }, 200);
      }
    }

    lenis.on("scroll", handleScroll);

    let rafHandle: number;
    function raf(time: number) {
      lenis.raf(time);
      rafHandle = requestAnimationFrame(raf);
    }
    rafHandle = requestAnimationFrame(raf);

    // Initial snap after mount
    setTimeout(() => snapToNearest(), 200);

    return () => {
      if (snapTimeout.current) clearTimeout(snapTimeout.current);
      cancelAnimationFrame(rafHandle);
      lenis.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100vh",
        overflowY: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "35vh",
          paddingBottom: "35vh",
        }}
      >
        {repeatedPeople.map((person, index) => (
          <Link
            key={`${person.slug}-${index}`}
            href={`/conversation/${person.slug}`}
            ref={(el) => { itemRefs.current[index] = el; }}
            style={{
              display: "block",
              padding: "6.0vh 0",
              textAlign: "center",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span
              onMouseEnter={() => setHoveredSlug(person.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              style={{
                fontFamily: '"et-book", serif',
                fontWeight: 700,
                fontStyle: "italic",
                fontSize: "clamp(1.1rem, 1.8vw, 1.6rem)",
                color:
                  hoveredSlug === null
                    ? "rgba(255, 255, 248, 0.35)"
                    : hoveredSlug === person.slug
                      ? "#fffff8"
                      : "rgba(255, 255, 248, 0.12)",
                transition: "color 0.3s ease, opacity 0.3s ease",
                cursor: "pointer",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              {person.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
