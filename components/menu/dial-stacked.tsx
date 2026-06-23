"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { COURSES, COURSE_COUNT } from "@/data/menu";
import { useDial } from "@/components/menu/dial-context";
import { CourseDetails } from "@/components/menu/course-details";
import { MediaSlot } from "@/components/media/media-slot";
import { withAmp } from "@/lib/typeset";

// Vertical fallback for the radial dial: shown by default, `.dial-stacked` in
// globals.css hides it at the lg + full-motion gate where DialRadial takes over.
// Covers sub-lg, reduced motion, reduced data, no-JS (the plate is clipped shut
// there, so radial markers would orbit a void). Own `mdial-*` id namespace so
// both dials coexist in the DOM without id clashes.
export function DialStacked({
  onMenu,
  menuOpen,
}: {
  onMenu: () => void;
  menuOpen: boolean;
}) {
  const { active, setActive } = useDial();
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  function go(i: number) {
    const n = ((i % COURSE_COUNT) + COURSE_COUNT) % COURSE_COUNT;
    setActive(n);
    const btn = btns.current[n];
    btn?.focus();
    // Keep the chosen tab in view on the horizontal rail.
    btn?.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    // Horizontal rail: Left/Right only, per APG.
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        go(active + 1);
        break;
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

  const current = String(active + 1).padStart(2, "0");
  const total = String(COURSE_COUNT).padStart(2, "0");
  const progress = (active + 1) / COURSE_COUNT;
  const course = COURSES[active];

  return (
    <div className="dial-stacked relative px-[var(--page-margin)] py-24">
      {/* Grounding wash. This column sits over the fixed hero (stage layers don't
          animate sub-lg) and muted text (overline, inactive tabs) can't clear AA
          over the bright sunset (1.9-3.5:1). Near-solid bg floor, faded at top/bottom
          edges to blend into the movements above and below, lands muted labels on
          near-black (~5:1) without a hard seam. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, transparent 0px, var(--bg) 72px, var(--bg) calc(100% - 72px), transparent 100%)",
        }}
      />
      {/* Intro */}
      <p className="t-overline text-muted">The Menu</p>
      <h2 className="mt-4 t-dial-lead text-text">
        Seven courses.
        <br />
        One rhythm.
      </h2>
      <p className="mt-4 max-w-md t-spec text-text-soft">
        Explore the tasting menu. Tap a course.
      </p>

      {/* Course rail: horizontal scroll-snap selector. Bleeds to the screen edges
          (negative gutter) so the row scrolls fully while first/last cards still
          rest on the page margin. */}
      <div className="mt-10">
        <div
          role="tablist"
          aria-label="Tonight's tasting menu"
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          className="-mx-[var(--page-margin)] flex gap-3 overflow-x-auto px-[var(--page-margin)] pb-2 [-ms-overflow-style:none] [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {COURSES.map((c, i) => {
            const on = i === active;
            return (
              <button
                key={c.id}
                ref={(el) => {
                  btns.current[i] = el;
                }}
                role="tab"
                id={`mdial-tab-${c.index}`}
                aria-selected={on}
                aria-controls="mdial-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => go(i)}
                style={{ scrollSnapAlign: "center" }}
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-2xl border px-5 py-3 transition-colors duration-[var(--dur-ui)] ease-[var(--ease-soft)]",
                  on
                    ? "border-[rgba(233,225,212,0.4)] bg-[rgba(233,225,212,0.08)]"
                    : "border-line bg-transparent hover:border-line-strong",
                )}
              >
                <span
                  className={cn(
                    "t-marker-name whitespace-nowrap",
                    on ? "text-text" : "text-muted",
                  )}
                >
                  {withAmp(c.title)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress counter is the stacked dial's own; the radial dial omits a
            progress instrument by design (see dial-radial.tsx). The tap/keyboard
            rail still needs the readout. */}
        <div className="mt-5 flex items-center gap-4">
          <p className="t-label tabular-nums">
            <span className="text-text">{current}</span>
            <span className="text-muted"> / {total}</span>
          </p>
          <span className="relative block h-px flex-1 bg-line">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-full origin-left bg-accent transition-transform duration-[var(--dur-ui)] ease-[var(--ease-soft)]"
              style={{ transform: `scaleX(${progress})` }}
            />
          </span>
        </div>
      </div>

      {/* Active course: dish image + shared details block. NightStage's plate media
          is clipped shut on this branch, so the dish lives here inline. Single
          column on phones, two-up (image | details) once the gutter widens at
          tablet (max-w-4xl caps it for the reduced-motion desktop case). key=active
          remounts the image on change for a clean swap. */}
      <div className="mt-12 grid max-w-4xl gap-7 sm:grid-cols-[minmax(0,20rem)_1fr] sm:items-start sm:gap-10">
        <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-xl">
          <MediaSlot
            key={active}
            label={`course-0${active + 1}`}
            src={course.media}
            poster={course.poster}
            seed={course.seed}
          />
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(233,225,212,0.06), inset 0 0 0 1px var(--line), inset 0 0 70px rgba(0,0,0,0.5)",
            }}
          />
        </div>

        <CourseDetails
          idPrefix="mdial"
          course={course}
          onMenu={onMenu}
          menuOpen={menuOpen}
        />
      </div>
    </div>
  );
}
