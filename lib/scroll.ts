import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Desktop-full-motion gate, imported everywhere so the query string can't drift
// between the scroll provider and the movements.
//
// reduced-data is deliberately kept out of this query: prefers-reduced-data is
// not widely supported, and an unsupported feature makes the whole and(...)
// clause fail to match, which would disable the desktop experience for everyone.
// It's handled separately via a .matches check (unsupported reads false) in
// lib/motion.tsx and the scroll provider; tweens are transform-only so nothing
// is hidden for that cohort anyway.
export const DESKTOP_FULL =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
export const REDUCED_OR_SMALL =
  "(max-width: 1023px), (prefers-reduced-motion: reduce)";

let registered = false;

/** Register GSAP plugins once, client-side only. Idempotent. */
export function registerScroll(): void {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  registered = true;
}

/** Re-measure triggers once fonts have swapped (metrics shift the layout). */
export function refreshAfterFonts(): void {
  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
