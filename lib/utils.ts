import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Fluid type scale is plain `.t-*` classes (globals.css), not @theme --text-*.
// Register as a font-size group, else tailwind-merge silently drops them.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "t-hero",
        "t-display",
        "t-title",
        "t-course-title",
        "t-lead",
        "t-body",
        "t-spec",
        "t-spec-fine",
        "t-spine",
        "t-label",
        "t-eyebrow",
        "t-overline",
        "t-wordmark",
        "t-button",
        "t-kicker",
        "t-marker-name",
        "t-subtitle",
        "t-subtitle-sm",
        "t-dial-lead",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
