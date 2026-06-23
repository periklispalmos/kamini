"use client";

import { useRef } from "react";
import {
  DESKTOP_FULL,
  gsap,
  ScrollTrigger,
  SplitText,
  useGSAP,
  registerScroll,
} from "@/lib/scroll";
import { Reveal } from "@/components/motion/reveal";
import { GradientButton } from "@/components/ui/gradient-button";
import { useScrollTo } from "@/components/layout/smooth-scroll-provider";
import { VENUE } from "@/lib/site";

registerScroll();

// Movement 1, arrival. Hero media + oval aperture live in NightStage; this is the
// foreground copy that recedes as the aperture forms (transition 1).
export function Arrival() {
  const root = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_FULL, () => {
        // DESKTOP_FULL gates on reduced-motion only; reduced-data desktop users still
        // match it. data-motion already resolved both, so defer to it: a data-saver
        // visitor gets the static frame, no scrub/pin.
        if (document.documentElement.dataset.motion !== "full") return;
        gsap.to(inner.current, {
          // autoAlpha (not opacity) so the faded copy block also flips to
          // visibility:hidden, else the Menu CTA stays in the tab order + AT tree
          // while invisible (WCAG 2.4.7). Matches the dial fade-out.
          autoAlpha: 0,
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "62% top",
            scrub: 0.6,
          },
        });

        // Hero SplitText line-mask entrance, fired once on mount: H1 split into
        // lines, then words rise from behind a per-line clip mask.
        // Gotchas: (1) split only after document.fonts.ready, splitting before the
        // Fraunces variable-webfont metrics swap measures line breaks wrong;
        // (2) ScrollTrigger.refresh() after the split rewraps the DOM so the scrub
        // exit re-measures the new layout; (3) hold H1 at autoAlpha 0 (pre-paint)
        // until the split is ready so final text never flashes then jumps;
        // (4) split.revert() on teardown restores original markup. Gated behind
        // DESKTOP_FULL + data-motion==="full" so reduced-motion/data/no-JS keep the
        // static H1 with nothing trapped at opacity 0.
        const h1 = headline.current;
        let split: SplitText | null = null;
        let aborted = false;
        if (h1) {
          gsap.set(h1, { autoAlpha: 0 });
          const reveal = () => {
            // fonts.ready can resolve after this matchMedia context was reverted
            // (viewport dragged < 1024 or reduced-motion toggled during a slow
            // Fraunces load). `aborted` stops splitting an already-restored node,
            // else the SplitText wrappers + rise tween are created outside the
            // matchMedia context and leak past mm.revert().
            if (aborted || !h1.isConnected) return;
            split = SplitText.create(h1, { type: "lines,words", mask: "lines" });
            // SplitText's default aria:"auto" hard-codes aria-label to the trimmed
            // textContent ("An island.Held in light.", the two line spans carry no
            // separating space), overriding the browser's native block-flattening
            // (which inserts a boundary space) so a screen reader announces
            // "island dot Held" run-together. Re-assert the spaced name; split word
            // pieces stay aria-hidden so the heading exposes one accessible name.
            // revert() drops this on teardown, and the no-split path flattens to the
            // same spaced name natively.
            h1.setAttribute("aria-label", "An island. Held in light.");
            gsap.set(h1, { autoAlpha: 1 });
            gsap.from(split.words, {
              yPercent: 110,
              duration: 1.0,
              ease: "power3.out",
              stagger: 0.06,
              delay: 0.08,
            });
            ScrollTrigger.refresh();
          };
          if (document.fonts?.ready) document.fonts.ready.then(reveal);
          else reveal();
        }

        return () => {
          aborted = true;
          split?.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="arrival"
      ref={root}
      className="scene-track z-[var(--z-content)]"
      style={{ "--track-h": "180vh" } as React.CSSProperties}
    >
      <div
        ref={inner}
        className="scene-pin flex items-center px-[var(--page-margin)] py-32"
      >
        <div className="max-w-2xl">
          <Reveal>
            <p className="t-overline text-text-soft">Santorini · A night of service</p>
          </Reveal>

          {/* Plain static markup (no Reveal wrappers): the useGSAP SplitText
              entrance animates this under full motion; reduced-motion/no-JS show this
              exact frame. The two block spans are the two visual lines (line 2
              text-soft, "light" the italic hero-em); SplitText preserves both on
              rewrap. */}
          <h1 ref={headline} className="mt-9 t-hero text-text">
            <span className="block">An island.</span>
            <span className="block text-text-soft">
              Held in <em className="hero-em">light</em>.
            </span>
          </h1>

          <Reveal delay={0.34}>
            <p className="mt-8 max-w-lg text-balance t-lead text-text-soft">
              A tasting menu shaped by fire, sea, and season.
            </p>
          </Reveal>

          <Reveal delay={0.44}>
            <p className="mt-10 t-overline text-text-soft">{VENUE.service}</p>
          </Reveal>

          <Reveal delay={0.56}>
            <div className="mt-12">
              <GradientButton onClick={() => scrollTo("#dial")}>
                Menu
              </GradientButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
