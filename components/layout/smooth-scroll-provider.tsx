"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useCallback, useEffect, useState } from "react";
import {
  DESKTOP_FULL,
  gsap,
  ScrollTrigger,
  registerScroll,
  refreshAfterFonts,
} from "@/lib/scroll";

// Lenis only constructs on the desktop-full-motion branch. Reduced-motion,
// reduced-data, or sub-1024px visitors never run the smooth-scroll rAF loop;
// they get native scroll and the static frames the CSS gate composes.
function useDesktopFull(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const full = window.matchMedia(DESKTOP_FULL);
    const reducedData = window.matchMedia("(prefers-reduced-data: reduce)");
    const update = () => setOn(full.matches && !reducedData.matches);
    update();
    full.addEventListener("change", update);
    reducedData.addEventListener("change", update);
    return () => {
      full.removeEventListener("change", update);
      reducedData.removeEventListener("change", update);
    };
  }, []);
  return on;
}

// Lives inside ReactLenis so useLenis() resolves. Drives Lenis from the GSAP
// ticker (single rAF source) and keeps ScrollTrigger in phase.
function GsapLenisBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    registerScroll();

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000); // gsap secs → lenis ms
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onRefreshInit = () => lenis.resize();
    ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Dev-only handle so visual / e2e checks can drive scroll deterministically.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;
    }

    // Re-measure once fonts swap (Fraunces metrics shift pin positions).
    refreshAfterFonts();

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
    };
  }, [lenis]);
  return null;
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const enabled = useDesktopFull();

  // Lenis mounts only on desktop-full, and must be a sibling of the app tree,
  // never wrapping it. In root mode Lenis drives window scroll and publishes its
  // instance through lenis/react's module-level root store, so useLenis() still
  // resolves in the movements and dialogs below via that store, not a parent provider.
  //
  // The sibling placement matters: enabled is false on first render and flips true
  // in an effect. With children inside the conditional <ReactLenis>, that flip
  // reparents them and React remounts every movement; each useGSAP runs twice and
  // leaves zombie ScrollTriggers anchored at the pre-pin layout, desyncing the
  // scenes. Keeping the app tree outside the conditional mounts only Lenis on flip.
  //
  // Reduced-motion / <1024px: ReactLenis never mounts, useLenis() returns
  // undefined, and the native-scroll + dialog overflow-lock fallbacks engage.
  return (
    <>
      {enabled && (
        <ReactLenis
          root
          options={{
            autoRaf: false, // raf driven from the GSAP ticker
            lerp: 0.1,
            duration: 1.1,
            smoothWheel: true,
            syncTouch: false,
          }}
        >
          <GsapLenisBridge />
        </ReactLenis>
      )}
      {children}
    </>
  );
}

/**
 * Smooth-scroll to a target. Uses Lenis when active (desktop-full), else native
 * scrollIntoView. Safe to call from anywhere in the tree.
 */
export function useScrollTo() {
  const lenis = useLenis();
  return useCallback(
    (target: string | HTMLElement, offset?: number) => {
      if (lenis) {
        // Header-aware offset lands the target below the fixed header (the native
        // branch gets this from CSS scroll-padding-top). Read --header-h so the two
        // can't drift; callers may pass an explicit offset to override.
        const headerH =
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--header-h",
            ),
          ) || 68;
        lenis.scrollTo(target, {
          offset: offset ?? -(headerH + 12),
          duration: 1.2,
        });
        return;
      }
      const el =
        typeof target === "string"
          ? document.querySelector<HTMLElement>(target)
          : target;
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [lenis],
  );
}
