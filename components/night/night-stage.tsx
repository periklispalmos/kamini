"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  DESKTOP_FULL,
  gsap,
  useGSAP,
  registerScroll,
  refreshAfterFonts,
} from "@/lib/scroll";
import { MediaSlot } from "@/components/media/media-slot";
import { TerraceSequence } from "@/components/night/terrace-sequence";
import { useDial } from "@/components/menu/dial-context";
import { COURSES, EMBER_BY_MOOD, RIM_WARMTH_BY_MOOD } from "@/data/menu";
import { HERO_MEDIA } from "@/lib/media";
import { useMotionAllowed } from "@/lib/motion";

registerScroll();

// Single fixed media plane behind everything (z-0). Three layers (hero, plate,
// terrace) never unmount, so the movements read as one environment. GSAP scrubs
// only opacity/clip-path/transform; foreground movements provide scroll length +
// copy. Independent ScrollTriggers, not one master timeline.
//
// Under reduced-motion/reduced-data/sub-1024/no-JS none of this runs: the
// .stage-* static-first defaults in globals.css hold (hero visible, plate clipped
// shut, terrace opacity 0), collapsing to one calm hero backdrop. Those defaults
// are also the correct full-motion first frame, so gsap.set (pre-paint in
// useGSAP) overrides them with zero flash.
export function NightStage() {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const plateClip = useRef<HTMLDivElement>(null);
  const plateGlow = useRef<HTMLDivElement>(null);
  const room = useRef<HTMLDivElement>(null);
  const emberBreath = useRef<HTMLDivElement>(null);
  const { active } = useDial();

  // Crossfade the plate media only once full motion is allowed and past the first
  // (SSR-matching) render. useMotionAllowed() returns false on the server and on
  // the first client render, so both pin to the same hard-swap branch (no
  // hydration mismatch), then it flips to the AnimatePresence crossfade and holds
  // the hard-swap under reduced motion or reduced data.
  const animatePlate = useMotionAllowed();

  // Ember thermal arc: "coals under the plate" glow strength for the active
  // course's mood. Carried on a separate child element's own opacity (Motion)
  // inside the plateGlow wrapper, so it multiplies with the GSAP-owned wrapper
  // opacity, never a second writer on plateClip/plateGlow/room. Gated behind
  // animatePlate so the ember stays dark under reduced motion too.
  const emberStrength = animatePlate
    ? (EMBER_BY_MOOD[COURSES[active].mood] ?? 0.05)
    : 0;

  // Forge-instrument rim: the plate's hairline ring colour warms toward the fire
  // course. Percent of --ember mixed into the bone --line; gated behind
  // animatePlate so it stays pure bone under reduced motion. The ring is the inset
  // box-shadow on the plate child below (a separate, non-transform property), so
  // no second writer on the plate clip. CSS transition: box-shadow (0.9s
  // ease-soft) cross-fades it on course change, in step with the ember glow's
  // tween. Shadow-layer count + offsets stay fixed (only the middle layer's colour
  // changes) so the browser interpolates cleanly.
  const rimWarmth = animatePlate
    ? (RIM_WARMTH_BY_MOOD[COURSES[active].mood] ?? 0)
    : 0;
  const rimColor = `color-mix(in oklab, var(--line), var(--ember) ${rimWarmth}%)`;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_FULL, () => {
        // Reduced-data desktop still matches DESKTOP_FULL; defer to data-motion
        // (set by MotionScript from reduced-motion or reduced-data) so data-saver
        // visitors keep the calm hero backdrop, not the scrubbed morph.
        if (document.documentElement.dataset.motion !== "full") return;
        const arrival = document.querySelector("#arrival");
        const terrace = document.querySelector("#terrace");
        if (!arrival || !terrace) return;

        gsap.set(hero.current, { opacity: 1 });
        gsap.set(room.current, { opacity: 0 });

        // Arrival to clean dark: hero darkens to the page ground as you leave it.
        // The plate clip is owned entirely by the dedicated PLATE timeline below,
        // not here.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: arrival,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          })
          .to(hero.current, { opacity: 0, ease: "none" }, 0);

        // One timeline owns the plate clip, tied to the dial's pin window (trigger
        // #dial, start "top top", end "+=160%", the same span the dial pin uses in
        // ServiceDialMovement). The plate is fixed at viewport centre, but the
        // foreground orbit ring is only centred on it while the dial is pinned;
        // before engage and after release the ring sits off-centre, so a visible
        // dish would float above the rising ring or linger past the leaving one.
        // Binding to the pin window opens the aperture just after the pin centres
        // the ring and closes it just before release. Must stay a single
        // trigger/single writer: with open + close in two scrubbed timelines both
        // held conflicting end states past their ranges, and on a jump nav (header
        // "The Menu" -> scrollTo(#dial)) render order could flip so open won,
        // leaving the plate stuck open. One timeline that ends closed (held to 1.0)
        // keeps the closed end state deterministic on every path. A ~0.03 margin
        // inside each pin edge keeps open/close from bleeding outside the window.
        const dial = document.querySelector("#dial");
        if (dial) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: dial,
                start: "top top",
                end: "+=160%",
                scrub: 0.6,
              },
            })
            .fromTo(
              plateClip.current,
              { clipPath: "ellipse(0% 0% at 50% 50%)", scale: 1.12 },
              {
                clipPath: "ellipse(37% 37% at 50% 50%)",
                scale: 1,
                ease: "power2.out",
                duration: 0.07,
              },
              0.03,
            )
            // Spotlight: faint bone halo + soft contact shadow under the plate.
            // Opacity tied to this same timeline (in as the plate opens, out as it
            // closes) so it never glows over an empty hero/terrace. Separate
            // element, no transform, so it doesn't violate the plate's single
            // writer.
            .fromTo(
              plateGlow.current,
              { opacity: 0 },
              { opacity: 1, ease: "power2.out", duration: 0.07 },
              0.03,
            )
            .to(
              plateClip.current,
              {
                clipPath: "ellipse(0% 0% at 50% 50%)",
                scale: 1.06,
                ease: "power1.in",
                duration: 0.07,
              },
              0.9,
            )
            .to(
              plateGlow.current,
              { opacity: 0, ease: "power1.in", duration: 0.07 },
              0.9,
            )
            // Hold closed to pin release: keeps the final state closed
            // (deterministic on jump nav) and ensures the dish is gone the instant
            // the ring leaves centre.
            .to(
              plateClip.current,
              { clipPath: "ellipse(0% 0% at 50% 50%)", duration: 0.03 },
              0.97,
            );
        }

        // Terrace bloom is a timed crossfade with the dial fade-out, not scrubbed.
        // The copy reveals on a time clock (IntersectionObserver + 1.1s CSS fade);
        // a scrubbed bg bloom is on the scroll clock with a lag tail, so on a quick
        // scroll the terrace was still ~0.66 opacity after arrival and developed up
        // to full under the copy. A scrubbed dial-out can also outrun a scrubbed
        // terrace-in, dipping luminance mid-transition. Fix: put the bg on the same
        // clock as the copy, a fixed-duration tween that plays on enter and
        // reverses on leave-back, coupled 1:1 with the dial fade-out (identical
        // trigger/start/duration/ease in ServiceDialMovement), so dial-out and
        // terrace-in are one balanced cross-dissolve at any scroll speed: monotonic,
        // no lag tail, no dip. Leads the copy (fires at "top 80%").
        // immediateRender:false holds the static-first first frame (room stays 0 at
        // the top) until the trigger fires. room is owned only here.
        gsap.fromTo(
          room.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.9,
            ease: "power1.inOut",
            immediateRender: false,
            scrollTrigger: {
              trigger: terrace,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );

        // Ember-breath: an additive warm pulse on the dial->terrace handoff. Coupled
        // to the same trigger as the terrace bloom + dial-out (#terrace, top 80%)
        // but a separate element on its own opacity, so it doesn't touch the 1:1
        // dial-out/terrace-in luminance crossfade above. mix-blend-mode:screen makes
        // the pulse purely additive (glows up then fades), so it never reintroduces
        // a mid-transition luminance dip. One timeline (in then out) holds its end
        // state at opacity 0; reverses on scroll-back. Own element, own opacity, no
        // transform, no write on plateClip/plateGlow/room.
        if (emberBreath.current) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: terrace,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            })
            .fromTo(
              emberBreath.current,
              { opacity: 0 },
              { opacity: 0.32, duration: 0.42, ease: "power2.out" },
            )
            .to(emberBreath.current, {
              opacity: 0,
              duration: 0.6,
              ease: "power2.in",
            });
        }

        // Footer lift: the terrace bed scrolls up with the footer instead of staying
        // fixed while the opaque footer slides over it. Scrub the whole fixed stage
        // up in lockstep with the footer's entry: as the footer covers e px from the
        // viewport bottom, lift the stage -e px so its bottom edge stays pinned to
        // the footer's top, settling back to y:0 on scroll-up. The span [footer top
        // enters bottom -> page end] makes the lift distance exactly the footer's
        // height; y is a function + invalidateOnRefresh so it recomputes if the
        // footer reflows. Only room shows here (hero 0, plate clipped), but
        // translating the root keeps every layer coherent and avoids a second
        // transform writer on room. scrub:true (not 0.6) keeps the bed pinned
        // exactly; a lag tail would let the footer creep back over it on a fast
        // flick.
        const footer = document.querySelector("footer");
        if (footer) {
          gsap.to(root.current, {
            y: () => -footer.offsetHeight,
            ease: "none",
            scrollTrigger: {
              trigger: footer,
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }

        refreshAfterFonts();
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[var(--z-stage)] overflow-hidden"
    >
      {/* L-hero */}
      <div ref={hero} className="stage-hero absolute inset-0">
        <MediaSlot
          label="hero-caldera"
          src={HERO_MEDIA.src}
          poster={HERO_MEDIA.poster}
          active
          seed={4}
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            // Two-axis scrim: a left-column wash keeps the left-aligned hero copy
            // legible over the bright sunset sky (WCAG AA) while the sunset glow on
            // the right stays clear; the vertical wash grounds the frame into the
            // page background.
            background:
              "linear-gradient(100deg, rgba(5,5,5,0.82) 0%, rgba(5,5,5,0.55) 30%, rgba(5,5,5,0.12) 60%, transparent 88%), linear-gradient(180deg, rgba(5,5,5,0.3) 0%, rgba(5,5,5,0.4) 62%, var(--bg) 100%)",
          }}
        />
      </div>

      {/* Centered round plate; clip-path on the inner child (Chromium self-clip).
          Diameter is the shared --plate-d so the foreground orbit ring + markers
          track it exactly. */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative aspect-square w-[var(--plate-d)]">
          {/* Spotlight behind the plate (first child, paints under the clipped
              media). 150% of the plate so the bone halo spills past the rim; a
              narrower blurred ellipse just under it grounds it. Held at opacity 0
              (static-first) and faded in only by the plate timeline, so the calm
              reduced-motion/closed-plate states show nothing. */}
          <div
            ref={plateGlow}
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 [will-change:opacity]"
            style={{ width: "150%", height: "150%" }}
          >
            {/* Ember thermal arc. First child so it paints beneath the bone halo.
                Warm radial set low (64%) so it reads as coals under the plate. Its
                own opacity carries the per-mood heat (emberStrength) and tweens on
                course change; multiplies with this wrapper's GSAP open/close opacity
                so it only emits while the plate is open. Separate element,
                opacity-only, no transform, no write on plateClip/plateGlow/room. */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: emberStrength }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background:
                  "radial-gradient(closest-side at 50% 64%, color-mix(in oklab, var(--ember) 70%, transparent), transparent 60%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(233,225,212,0.12), rgba(233,225,212,0.045) 52%, transparent 70%)",
              }}
            />
            <div
              className="absolute left-1/2 top-[86%] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
              style={{
                width: "48%",
                height: "10%",
                background:
                  "radial-gradient(closest-side, rgba(0,0,0,0.5), transparent 74%)",
                filter: "blur(12px)",
              }}
            />
          </div>
          <div
            ref={plateClip}
            className="stage-plate absolute inset-0 overflow-hidden rounded-full [will-change:clip-path,transform]"
          >
            {/* Course still on the master plate. On course change it crossfades
                with a small scale + blur settle; under reduced motion it hard-swaps.
                GSAP owns the outer plate clip/scale, Motion owns only this inner
                media, so they never fight. */}
            {animatePlate ? (
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.99, filter: "blur(6px)" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <MediaSlot
                    label={`course-0${active + 1}`}
                    src={COURSES[active].media}
                    poster={COURSES[active].poster}
                    seed={COURSES[active].seed}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <MediaSlot
                key={active}
                label={`course-0${active + 1}`}
                src={COURSES[active].media}
                poster={COURSES[active].poster}
                seed={COURSES[active].seed}
              />
            )}
            {/* Forge-instrument rim. The middle hairline layer is the mood-reactive
                ring (rimColor); the bone top-highlight + inner vignette stay fixed.
                transition: box-shadow warms/cools it on course change (0.9s
                ease-soft, in step with the ember glow). */}
            <div
              className="absolute inset-0 rounded-full [transition:box-shadow_0.9s_var(--ease-soft)]"
              style={{
                boxShadow: `inset 0 1px 0 rgba(233,225,212,0.06), inset 0 0 0 1px ${rimColor}, inset 0 0 90px rgba(0,0,0,0.6)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Scroll-scrubbed terrace zoom (TerraceSequence canvas). Blooms in (opacity)
          as the dial's plate closes at the top of #terrace, then the camera pushes
          from the full terrace in to the single candlelit table; holds that final
          frame as the bed behind #request and is lifted with the footer at page
          end. The lower wash grounds the fixed frame; the Request form carries its
          own right-anchored legibility wash, so no directional side-wash here (it
          would fight the zoom and there's no foreground copy to protect). */}
      <div ref={room} className="stage-room absolute inset-0">
        <TerraceSequence />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--bg) 0%, color-mix(in oklab, var(--bg) 70%, transparent) 13%, color-mix(in oklab, var(--bg) 40%, transparent) 26%, color-mix(in oklab, var(--bg) 18%, transparent) 40%, color-mix(in oklab, var(--bg) 7%, transparent) 55%, transparent 74%)",
          }}
        />
      </div>

      {/* Ember-breath pulse: a separate additive (screen-blend) warm glow, opacity
          0 at rest, that pulses once during the dial->terrace handoff (timeline
          above). Last child of the stage so it sits over the media layers but under
          the foreground copy; mix-blend:screen only adds light, never a dip. Own
          element + opacity, no transform, no touch on plateClip/plateGlow/room.
          Stays dark under reduced motion (the timeline never runs). */}
      <div
        ref={emberBreath}
        aria-hidden="true"
        className="absolute inset-0 opacity-0 [mix-blend-mode:screen] [will-change:opacity]"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 58%, color-mix(in oklab, var(--ember) 64%, transparent), transparent 72%)",
        }}
      />
    </div>
  );
}
