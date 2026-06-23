"use client";

import { useCallback, useRef } from "react";
import { useLenis } from "lenis/react";
import {
  DESKTOP_FULL,
  gsap,
  ScrollTrigger,
  useGSAP,
  registerScroll,
  refreshAfterFonts,
} from "@/lib/scroll";
import { ServiceDial } from "@/components/menu/service-dial";
import { useDial } from "@/components/menu/dial-context";
import { COURSE_COUNT } from "@/data/menu";

registerScroll();

// Pins the dial for +160% so the central plate stays anchored while the course
// changes. Scroll is a secondary input (quantised to whole courses); click +
// keyboard are primary and sync back via lenis.scrollTo so the two never desync.
export function ServiceDialMovement() {
  const root = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const lastIndex = useRef(-1);
  const { setActive } = useDial();
  const lenis = useLenis();

  const scrollToCourse = useCallback(
    (i: number) => {
      const st = stRef.current;
      if (!st || !lenis) return;
      const target =
        st.start + ((i + 0.5) / COURSE_COUNT) * (st.end - st.start);
      // immediate: dial is pinned, so scroll position moves with no page jump,
      // only the active course changes. Lands the selection directly instead of
      // spinning the index through every dish between (reads as flicker).
      lenis.scrollTo(target, { immediate: true });
    },
    [lenis],
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_FULL, () => {
        // Reduced-data desktop still matches DESKTOP_FULL; gate on data-motion
        // (set from reduced-motion or reduced-data) so data-saver visitors get
        // the unpinned static dial, not the pin + scrub choreography.
        if (document.documentElement.dataset.motion !== "full") return;
        stRef.current = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "+=160%",
          pin: pin.current,
          anticipatePin: 1,
          // This pin sits above #terrace, so its spacer shifts every trigger
          // below it. Refresh it first (higher priority) so later triggers
          // measure against the post-pin layout, otherwise NightStage's T3
          // (created earlier in the tree) anchors ~160vh too high and the
          // terrace bloom desyncs from the copy.
          refreshPriority: 1,
          onUpdate: (self) => {
            // Cycle all courses across the first 88% of the pin, not the full
            // span, so the last course (dessert) holds for the closing ~12%
            // instead of landing just as the plate clips shut mid-reveal (plate
            // close starts at 0.9 in NightStage). Math.min clamps the >1.0 tail.
            const i = Math.min(
              COURSE_COUNT - 1,
              Math.floor((self.progress / 0.88) * COURSE_COUNT),
            );
            if (i !== lastIndex.current) {
              lastIndex.current = i;
              setActive(i);
            }
          },
        });

        // Details block and marker arc settle in as the dial scrolls to pin.
        // Timed, not scrubbed, so it holds at any scroll speed. Transform-only,
        // no opacity: the two columns are the focusable tablist + tabpanel, so
        // fading them could leave keyboard focus on an invisible control (WCAG
        // 2.4.7). A pure rise keeps everything visible.
        const cols = pin.current?.querySelectorAll<HTMLElement>("[data-dial-col]");
        if (cols && cols.length) {
          gsap.from(cols, {
            y: 28,
            duration: 0.9,
            ease: "power2.out",
            stagger: 0.12,
            scrollTrigger: { trigger: root.current, start: "top 78%" },
          });
        }

        // Fade the dial out as the terrace rises so markers never linger opaque
        // over the next scene. Timed (not scrubbed) and coupled 1:1 with
        // NightStage's terrace bloom (same trigger/start/duration/ease) so the
        // two form one balanced cross-dissolve independent of scroll speed; a
        // scrubbed pair lets the dial outrun the bloom and dips luminance
        // mid-transition. autoAlpha (not opacity) so the faded dial also flips to
        // visibility:hidden, else the tab + dialog buttons stay in the focus
        // order and AT tree while invisible (WCAG 2.4.7 / 4.1.2).
        const terrace = document.querySelector("#terrace");
        if (terrace) {
          gsap.to(pin.current, {
            autoAlpha: 0,
            duration: 0.9,
            ease: "power1.inOut",
            scrollTrigger: {
              trigger: terrace,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });
        }

        refreshAfterFonts();
      });
      return () => {
        mm.revert();
        stRef.current = null;
      };
    },
    { scope: root },
  );

  return (
    <section
      id="dial"
      ref={root}
      aria-label="The menu"
      className="relative z-[var(--z-content)]"
    >
      <div ref={pin} className="relative">
        <ServiceDial onSelectCourse={scrollToCourse} />
      </div>
    </section>
  );
}
