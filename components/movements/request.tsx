import { Reveal } from "@/components/motion/reveal";
import { ImageSlot } from "@/components/media/image-slot";
import { ReservationForm } from "@/components/menu/reservation-form";
import { TERRACE_SEQUENCE } from "@/lib/media";

// Form is right-anchored: the terrace zoom settles its candlelit table lower-left,
// so copy lands over the darker right cliff (same composition as hero + dial). The
// form carries its own contrast with a semi-opaque blurred panel (no full-bleed
// scrim over the frame); the caption leans on the frame's dark left cliff + its own
// text-shadow.
//
// Under full desktop motion the fixed TerraceSequence canvas paints the final frame
// behind this transparent section. Under reduced motion/data/no-JS that canvas is
// hidden, so .request-still paints the same frame as the bed; it's gated off under
// full motion in globals.css so it never occludes the live canvas.
export function Request() {
  return (
    <section
      id="request"
      aria-labelledby="request-title"
      className="relative z-[var(--z-content)] flex min-h-svh items-center justify-end px-[var(--page-margin)] py-32"
    >
      {/* Reduced-motion/no-JS bed; the canvas supersedes it under full motion. */}
      <div className="request-still absolute inset-0 -z-20" aria-hidden="true">
        <ImageSlot src={TERRACE_SEQUENCE.final} />
      </div>

      {/* Settling line, upper-left over the dark sea. No grounding scrim behind it
          (the full-bleed gradient wash read as a templated overlay); it sits over the
          frame's naturally darker left cliff and carries its own contrast with a tight
          near-shadow + a soft far glow — typographic, not a slab. Quieter than the form
          header (text-soft vs text-text) and leads by a beat (form delay below) so it
          reads first. Reveal is gated on data-motion=full, so reduced-motion/no-JS show
          it settled with nothing trapped at opacity 0. */}
      <Reveal className="pointer-events-none absolute left-[var(--page-margin)] top-[clamp(6.5rem,19vh,12rem)] max-w-[19rem] sm:max-w-sm">
        <p className="t-display text-balance text-text-soft [text-shadow:0_1px_2px_rgba(5,5,5,0.85),0_2px_28px_rgba(5,5,5,0.55)]">
          Set for one evening, above the water.
        </p>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="w-[min(30rem,100%)] rounded-[2px] border border-line bg-[rgba(5,5,5,0.5)] px-8 py-10 backdrop-blur-md sm:px-10 sm:py-12">
          <ReservationForm idPrefix="request" />
        </div>
      </Reveal>
    </section>
  );
}
