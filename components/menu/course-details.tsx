"use client";

import { Fragment } from "react";
import { motion, type Variants } from "motion/react";
import type { Course } from "@/data/menu";
import { QuietButton } from "@/components/motion/quiet-button";
import { withAmp } from "@/lib/typeset";
import { useMotionAllowed } from "@/lib/motion";

// Kill switch for the per-course mono spec placard. Flip to false to pull every
// spec label; the data stays in menu.ts. Governs both dials (radial + stacked).
const SHOW_DISH_SPEC = true;

// On each course change the lines settle in one after another (spec, name,
// subtitle, ingredients, pairing): cross-fade plus slight rise, same easing as
// the hero. Honours reduced-motion / reduced-data.
const STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
};
const LINE: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function CourseDetails({
  course,
  onMenu,
  menuOpen,
  idPrefix = "dial",
}: {
  course: Course;
  onMenu: () => void;
  // Drawer open state so the opener exposes a correct aria-expanded.
  menuOpen: boolean;
  // Both dials mount a CourseDetails. Namespacing the tabpanel id (and its
  // aria-labelledby ref) keeps both in the DOM without duplicate ids; the CSS
  // layout gate shows only one at a time.
  idPrefix?: string;
}) {
  // Animate course changes only, never first paint. useMotionAllowed() is false
  // on the server and first hydration render (initial course renders statically
  // at "show"; the dial entrance handles its arrival), then flips to the live
  // value honouring reduced-motion or reduced-data.
  const animateChange = useMotionAllowed();

  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel`}
      aria-labelledby={`${idPrefix}-tab-${course.index}`}
    >
      <motion.div
        key={course.id}
        variants={STAGGER}
        initial={animateChange ? "hidden" : false}
        animate="show"
      >
        {SHOW_DISH_SPEC && course.spec ? (
          <motion.p
            variants={LINE}
            className="mb-3 t-eyebrow text-muted [will-change:transform,opacity]"
          >
            {course.spec}
          </motion.p>
        ) : null}
        <motion.h3
          variants={LINE}
          className="t-course-title text-text [will-change:transform,opacity]"
        >
          {withAmp(course.title)}
        </motion.h3>
        <motion.p
          variants={LINE}
          className="mt-2 t-subtitle text-accent [will-change:transform,opacity]"
        >
          {withAmp(course.subtitle)}
        </motion.p>
        <motion.p
          variants={LINE}
          className="mt-5 t-spec text-text-soft [will-change:transform,opacity]"
        >
          {course.ingredients.map((ing, i) => (
            <Fragment key={ing}>
              {i > 0 ? <span className="sep">{" · "}</span> : null}
              {ing}
            </Fragment>
          ))}
        </motion.p>
        <motion.p
          variants={LINE}
          className="mt-2.5 t-spec-fine text-muted [will-change:transform,opacity]"
        >
          Pairing — {course.pairing}
        </motion.p>
      </motion.div>

      {/* Secondary action: quiet hairline pill, not the frosted CTA, so it sits
          below the real "Request a table" CTA without competing with it. */}
      <div className="mt-7">
        <QuietButton
          onClick={onMenu}
          size="sm"
          ariaHasPopup="dialog"
          ariaControls="menu-dialog"
          ariaExpanded={menuOpen}
        >
          Menu
        </QuietButton>
      </div>
    </div>
  );
}
