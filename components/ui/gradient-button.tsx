"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Shared CTA. Static hairline pill over a bright translucent frost so it reads
// in the hero light rather than as a flat dark blob. frost + backdrop-blur +
// text-shadow keep it legible over bright caldera media; border/fill/hover
// mirror QuietButton's primary. Pass aria-* when it opens a dialog, omit when
// it just scrolls.
type GradientButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  ariaControls?: string;
  ariaHasPopup?: boolean | "dialog";
  ariaExpanded?: boolean;
};

export function GradientButton({
  children,
  onClick,
  type = "button",
  className,
  ariaControls,
  ariaHasPopup,
  ariaExpanded,
}: GradientButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-controls={ariaControls}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
      className={cn(
        "relative inline-flex min-h-[3.25rem] items-center justify-center rounded-full border border-[rgba(233,225,212,0.68)] bg-[rgba(233,225,212,0.2)] px-8 py-4 t-button text-text shadow-[inset_0_1px_0_rgba(233,225,212,0.12)] backdrop-blur-md transition-colors duration-[var(--dur-ui)] ease-[var(--ease-soft)] [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] hover:border-[rgba(233,225,212,0.85)] hover:bg-[rgba(233,225,212,0.28)] focus-visible:border-[rgba(233,225,212,0.85)]",
        className,
      )}
    >
      {children}
    </button>
  );
}
