import type { CSSProperties } from "react";

// While false, every media slot renders the designed placeholder, not a wireframe.
// To go live, drop real files in /public/media/ and flip this. The aspect-ratio
// wrapper keeps layout shift at zero on the flip.
export const ASSETS_READY = true;

export type Media = { readonly src: string; readonly poster: string };

// Hero is a single still (non-video src), not a loop. The NightStage scrim is
// tuned left-weighted for copy over this frame's bright right horizon.
export const HERO_MEDIA: Media = {
  src: "/media/hero-caldera.webp",
  poster: "/media/hero-caldera.webp",
};
// Movement 3 terrace zoom: scroll-scrubbed frame sequence, not an autoplay loop.
// Scrub is a desktop + full-motion upgrade; reduced motion/data, no-JS, and below
// desktop hold the final frame as a static still and never fetch the sequence, so
// the zero-JS arrival lands on the destination instead of a black canvas. Frames
// are 1-indexed (frame_001..frame_145.webp), 3-digit padded, encoded at source-
// native 1928x1072 so the canvas draws true detail into the up-to-2x retina
// backing store rather than upscaling a pre-shrunk frame.
export const TERRACE_SEQUENCE = {
  dir: "/media/terrace-seq",
  count: 145,
  width: 1928,
  height: 1072,
  // Settled last frame: the reduced-motion/no-JS bed behind the Request form, and
  // the poster the canvas paints before frames load.
  final: "/media/terrace-final.webp",
  frameUrl(i: number): string {
    // Clamp, 1-index, zero-pad to match on-disk names.
    const n = Math.min(this.count, Math.max(1, i + 1));
    return `${this.dir}/frame_${String(n).padStart(3, "0")}.webp`;
  },
} as const;

// Placeholder for every asset-less slot: cool limestone/blue-hour body with a
// faint warm glow low in the frame, so a slot reads as composed art, not a flat
// fill. Ember is reserved for real fire/candle media; here it only tints the
// horizon afterglow at very low strength.
export function placeholderStyle(seed: number): CSSProperties {
  const hue = 205 + ((seed % 12) * 1.1); // 205-217: cool blue-hour limestone
  return {
    backgroundImage: [
      // sunset afterglow: warm, low, to one side, kept faint
      "radial-gradient(120% 85% at 78% 110%, color-mix(in oklab, var(--ember) 16%, transparent) 0%, transparent 44%)",
      // limestone/blue-hour body
      `radial-gradient(125% 120% at 32% 22%, hsl(${hue} 9% 19%) 0%, var(--surface) 50%, var(--bg) 100%)`,
    ].join(", "),
  };
}
