"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMotionAllowed } from "@/lib/motion";

// Pill control. primary = real CTAs (bone fill + hairline + accent dot, no gold).
// quiet = secondary actions (hairline + faint bone wash, lifts on hover).
// Renders as <a> when href is set, else <button>.
type Variant = "primary" | "quiet";
type Size = "md" | "sm";

type QuietButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  className?: string;
  ariaControls?: string;
  ariaHasPopup?: boolean | "dialog";
  ariaExpanded?: boolean;
};

const BASE =
  "group inline-flex items-center justify-center rounded-full border t-button transition-[color,background-color,border-color,box-shadow] duration-[var(--dur-ui)] ease-[var(--ease-soft)]";

// Two footprints over the same look. md = real CTAs; sm = compact quiet pill
// (the dial's Menu opener), same hairline/label type, tighter spacing.
const SIZES: Record<Size, string> = {
  md: "min-h-[3.25rem] gap-3 px-8 py-4",
  sm: "min-h-[2.25rem] gap-2 px-5 py-2.5",
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "border-[rgba(233,225,212,0.5)] bg-[rgba(233,225,212,0.14)] text-text shadow-[inset_0_1px_0_rgba(233,225,212,0.12)] hover:border-[rgba(233,225,212,0.78)] hover:bg-[rgba(233,225,212,0.2)] hover:shadow-[inset_0_1px_0_rgba(233,225,212,0.18),0_10px_34px_-16px_rgba(0,0,0,0.7)] focus-visible:border-[rgba(233,225,212,0.78)]",
  quiet:
    "border-[rgba(233,225,212,0.22)] bg-[rgba(233,225,212,0.02)] text-text-soft hover:border-[rgba(233,225,212,0.42)] hover:bg-[rgba(233,225,212,0.05)] hover:text-text focus-visible:border-[rgba(233,225,212,0.42)] focus-visible:text-text",
};

export function QuietButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "quiet",
  size = "md",
  disabled,
  className,
  ariaControls,
  ariaHasPopup,
  ariaExpanded,
}: QuietButtonProps) {
  // Gestures only once motion is allowed. useMotionAllowed() returns false on the
  // server and the first hydration render, so the gesture props (and the tabindex="0"
  // Motion stamps onto gesture elements) are absent in both, keeping the first client
  // render byte-identical to SSR. Unlike useReducedMotion() it also honours
  // prefers-reduced-data, matching the site-wide contract.
  const motionAllowed = useMotionAllowed();
  const still = disabled || !motionAllowed;
  const hover = still ? undefined : { scale: 1.02 };
  const tap = still ? undefined : { scale: 0.99 };
  const transition = { type: "spring" as const, stiffness: 420, damping: 32 };
  const classes = cn(BASE, SIZES[size], VARIANTS[variant], className);

  if (href) {
    return (
      <motion.a
        href={href}
        onClick={onClick}
        whileHover={hover}
        whileTap={tap}
        transition={transition}
        className={classes}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-controls={ariaControls}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
      whileHover={hover}
      whileTap={tap}
      transition={transition}
      className={cn(classes, disabled && "pointer-events-none opacity-50")}
    >
      {children}
    </motion.button>
  );
}
