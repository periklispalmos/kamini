# KÁMINI

Fine dining above the Santorini caldera. A tasting menu shaped by fire, sea, and
season, served from sunset.

A single-page, scroll-driven site that plays as one continuous night in four movements:
arrival, the menu dial, the terrace, and the reservation. The whole experience is gated
behind `prefers-reduced-motion` and `prefers-reduced-data`, falling back to a calm static
layout when either is set.

## Stack

- Next.js 16 (App Router) + React 19, TypeScript (strict)
- Tailwind CSS v4
- GSAP + ScrollTrigger for the pinned scroll choreography
- Lenis for smooth scrolling
- Motion for UI micro-animation
- Zod for the reservation form

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Checks

```bash
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm build        # production build
```

Pass `KAMINI_DIST_DIR=.next-verify` to run a build into a separate directory without
disturbing the dev `.next`.

## Notes

- Media is placeholder until final photography and video land. The image and video slots
  live in `components/media`; swap the sources there.
- The radial menu dial runs full-motion on desktop (>=1024px); narrower or reduced-motion
  visitors get the stacked, static layout instead.
