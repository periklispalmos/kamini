"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerScroll } from "@/lib/scroll";

registerScroll();

// Hairline ring trailing the pointer (quickTo lerp), grows/brightens over interactive
// targets. Layered over the native cursor, which stays as the real hit point.
// aria-hidden + pointer-events-none so it never enters the AT tree or blocks clicks.
// Gated to a true mouse on a full-motion desktop: 1024px + pointer:fine + no-preference,
// plus html[data-motion]==="full" (folds in reduced-data like the rest of the site).
// Otherwise the element never attaches and stays display:none + opacity 0. Hidden
// until the first real mouse move so a touch-first session never flashes it.
const INTERACTIVE =
  "a, button, [role='button'], [role='tab'], input, textarea, select, summary, label";

export function CinematicCursor() {
  const ring = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        if (document.documentElement.dataset.motion !== "full") return;
        const el = ring.current;
        if (!el) return;

        // Centre on transform origin and park off-screen so it doesn't flash at (0,0).
        gsap.set(el, { xPercent: -50, yPercent: -50, x: -100, y: -100, opacity: 0 });
        const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });

        let shown = false;
        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return; // ignore pen, synthetic touch
          xTo(e.clientX);
          yTo(e.clientY);
          if (!shown) {
            shown = true;
            gsap.to(el, { opacity: 1, duration: 0.4, ease: "power2.out" });
          }
        };
        const onOver = (e: PointerEvent) => {
          const t = e.target as Element | null;
          if (t?.closest?.(INTERACTIVE)) {
            gsap.to(el, {
              scale: 2.1,
              borderColor: "rgba(233,225,212,0.9)",
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        };
        const onOut = (e: PointerEvent) => {
          const t = e.target as Element | null;
          const to = e.relatedTarget as Element | null;
          // Shrink only when actually leaving the interactive subtree, not when
          // moving between its children.
          if (t?.closest?.(INTERACTIVE) && !to?.closest?.(INTERACTIVE)) {
            gsap.to(el, {
              scale: 1,
              borderColor: "rgba(233,225,212,0.5)",
              duration: 0.35,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        };
        const onLeave = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          gsap.to(el, { opacity: 0, duration: 0.3 });
        };
        const onEnter = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          if (shown) gsap.to(el, { opacity: 1, duration: 0.3 });
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerover", onOver, { passive: true });
        document.addEventListener("pointerout", onOut, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        document.documentElement.addEventListener("pointerenter", onEnter);

        return () => {
          window.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerover", onOver);
          document.removeEventListener("pointerout", onOut);
          document.documentElement.removeEventListener("pointerleave", onLeave);
          document.documentElement.removeEventListener("pointerenter", onEnter);
          gsap.set(el, { clearProps: "all" });
        };
      },
    );
    return () => mm.revert();
  });

  return (
    <div
      ref={ring}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[95] hidden h-7 w-7 rounded-full border border-[rgba(233,225,212,0.5)] opacity-0 [will-change:transform,opacity] lg:block"
    />
  );
}
