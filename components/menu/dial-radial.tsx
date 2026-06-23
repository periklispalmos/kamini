"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { COURSES, COURSE_COUNT } from "@/data/menu";
import { useDial } from "@/components/menu/dial-context";
import { CourseDetails } from "@/components/menu/course-details";

// Desktop dial: bare centre plate (NightStage) framed by two text columns.
// Navigation is scroll-only. The pinned scroll quantises the active course; the
// right-column dish name is the position cue. `.dial-radial` in globals.css gates
// display on html[data-motion="full"] + min-width:1024px; everything else gets
// DialStacked.
//
// No progress instrument here (no counter, fill hairline, or markers) by design:
// the scroll user reads position from the dish name. DialStacked keeps a counter
// because its tap/keyboard rail lacks the pinned-scroll position readout.
//
// A screen-reader/keyboard tablist survives below, visually hidden until focused
// (then a labelled chip surfaces with the accent focus ring, WCAG 2.4.7).
// Selecting a tab drives `active` and scrolls (onSelectCourse) so it never desyncs
// from the pinned scroll.
export function DialRadial({
  onSelectCourse,
  onMenu,
  menuOpen,
}: {
  // When pinned, scrolls to the course's offset so click/keyboard stay in sync.
  onSelectCourse?: (i: number) => void;
  onMenu: () => void;
  menuOpen: boolean;
}) {
  const { active, setActive } = useDial();
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  function go(i: number) {
    const n = ((i % COURSE_COUNT) + COURSE_COUNT) % COURSE_COUNT;
    setActive(n);
    btns.current[n]?.focus();
    onSelectCourse?.(n);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        go(active + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        go(active - 1);
        break;
      case "Home":
        e.preventDefault();
        go(0);
        break;
      case "End":
        e.preventDefault();
        go(COURSE_COUNT - 1);
        break;
    }
  }

  // Asymmetric editorial layout: a static vertical spine label tight to the left
  // edge (section eyebrow), the headline dropped to the plate's upper-half, and the
  // details anchored bottom-right. The top-left corner is left to breathe. The
  // centred plate is untouched. `.dial-radial` (globals.css, unlayered) owns
  // `display`: none by default, flex only at the lg + full-motion gate. With every
  // child `absolute` the flex alignment is inert, but the parent stays the
  // positioning context.
  return (
    <div className="dial-radial relative h-[100svh]">
      {/* Section label as a vertical spine, tight to the left viewport edge and
          optically centred over the plate, reading bottom-to-top (writing-mode +
          180deg). Deliberately NOT a [data-dial-col]: the settle-rise writes an
          inline transform (gsap.from y:28), which would clobber the rotate. A
          static edge rule is the right read for an architectural label anyway.
          pointer-events-none so the full-height strip never swallows clicks. */}
      <div className="pointer-events-none absolute inset-y-0 left-5 z-[var(--z-content)] flex items-center">
        <p className="t-spine text-muted [writing-mode:vertical-rl] rotate-180">
          The Menu
        </p>
      </div>

      {/* Headline + caption, dropped from the top-left corner to sit in the plate's
          upper-half so the left column balances the bottom-right details across the
          centred plate (the top-left corner is left as open negative space). Left
          edge stays on the shared --page-margin; the right edge clears the visible
          plate (clipped to ellipse(37%) ≈ 34vw) at every desktop breakpoint. Keeps
          [data-dial-col] for the settle-rise, positioned by top-offset only (no
          translate) so the GSAP y-tween doesn't fight a transform. */}
      <div
        data-dial-col
        className="absolute left-[var(--page-margin)] top-[32vh] z-[var(--z-content)] w-[clamp(15rem,20vw,18.5rem)]"
      >
        <h2 className="t-dial-lead text-text">
          Seven courses.
          <br />
          One rhythm.
        </h2>
        <p className="mt-5 t-spec text-muted">Explore the tasting menu.</p>
      </div>

      {/* Course tablist, visually hidden, for keyboard + screen-reader nav.
          Source order is tablist before tabpanel for the WAI-ARIA focus order
          (it's absolute + sr-only, so source position is decoupled from layout).
          Roving tabindex: only the active tab is tabbable; Arrow/Home/End move
          between courses (each sets `active` and scrolls via go()). Each tab is
          sr-only until focused, then not-sr-only surfaces it as a labelled chip
          with the accent focus ring (WCAG 2.4.7). The chip sits at header-h +
          1.5rem; a % offset drifted into the header band at <=768px tall.
          id `dial-tab-${index}` is referenced by CourseDetails' tabpanel
          aria-labelledby, so it must stay. */}
      <div
        role="tablist"
        aria-label="Tonight's tasting menu"
        onKeyDown={onKeyDown}
        className="pointer-events-none absolute inset-0 z-[var(--z-content)]"
      >
        {COURSES.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              btns.current[i] = el;
            }}
            role="tab"
            id={`dial-tab-${c.index}`}
            aria-selected={i === active}
            aria-controls="dial-panel"
            tabIndex={i === active ? 0 : -1}
            onClick={() => go(i)}
            className={cn(
              "sr-only",
              "focus-visible:not-sr-only focus-visible:pointer-events-auto",
              "focus-visible:absolute focus-visible:left-1/2 focus-visible:top-[calc(var(--header-h)_+_1.5rem)] focus-visible:-translate-x-1/2",
              "focus-visible:whitespace-nowrap focus-visible:rounded-full focus-visible:border focus-visible:border-[rgba(233,225,212,0.5)] focus-visible:bg-[rgba(5,5,5,0.92)] focus-visible:px-5 focus-visible:py-2.5 focus-visible:backdrop-blur-md",
              "focus-visible:t-label focus-visible:text-text",
            )}
          >
            {c.title} — course {i + 1} of {COURSE_COUNT}
          </button>
        ))}
      </div>

      {/* Details, anchored bottom-right (role=tabpanel), lower than the intro so
          the dish name reads as a settling caption. Same width clamp as the intro
          column; its left edge clears the centred plate's right edge at every
          desktop breakpoint (1024/1280/1440/1920). */}
      <div
        data-dial-col
        className="absolute bottom-[clamp(2rem,8vh,5rem)] right-[var(--page-margin)] z-[var(--z-content)] w-[clamp(15rem,20vw,18.5rem)]"
      >
        <CourseDetails
          course={COURSES[active]}
          onMenu={onMenu}
          menuOpen={menuOpen}
        />
      </div>
    </div>
  );
}
