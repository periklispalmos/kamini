"use client";

import { useScrollTo } from "@/components/layout/smooth-scroll-provider";
import { useReservation } from "@/components/menu/reservation-context";
import { SITE_WORDMARK } from "@/lib/site";

// Wordmark plus two links at sm+. Below sm the links collapse to one "Reserve"
// pill so the nav never collides with the wordmark or wraps on a phone.
export function Header() {
  const scrollTo = useScrollTo();
  const { open: reservationOpen, openReservation } = useReservation();

  // Lenis scrollTo leaves focus on the clicked link (unlike a native hash jump),
  // so move focus to the target: tabindex=-1 + focus({preventScroll}) hands focus
  // over without fighting the scroll.
  function goTo(id: string) {
    scrollTo(id);
    const el = document.querySelector<HTMLElement>(id);
    if (el) {
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
      // drop the tabindex once focus leaves, no stale attribute
      el.addEventListener("blur", () => el.removeAttribute("tabindex"), {
        once: true,
      });
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[var(--z-header)]">
      {/* Scrim: soft bg-to-transparent wash behind the transparent header so the
          nav stays legible over the bright terrace and incoming headings are muted
          at the top edge. Multi-stop ease-out (dense behind the nav, long tail) so
          it blends into the image with no flat band or hard line. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[200px]"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg) 0%, color-mix(in oklab, var(--bg) 90%, transparent) 14%, color-mix(in oklab, var(--bg) 68%, transparent) 32%, color-mix(in oklab, var(--bg) 42%, transparent) 52%, color-mix(in oklab, var(--bg) 20%, transparent) 72%, transparent 100%)",
        }}
      />
      {/* Full-bleed gutter, not a centred max-width container: the wordmark must
          share the fixed left gutter with hero/dial/terrace content at every
          width. A centred container let it drift ~180px inward by 1920. */}
      <div className="relative flex h-[var(--header-h)] items-center justify-between px-[var(--page-margin)]">
        <a
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            goTo("#main");
          }}
          className="group flex min-h-11 flex-col justify-center gap-0.5 leading-none"
        >
          <span className="t-wordmark text-text transition-colors duration-[var(--dur-ui)] ease-[var(--ease-soft)] group-hover:text-accent">
            {SITE_WORDMARK}
          </span>
          <span className="t-kicker text-muted">Santorini</span>
          {/* "home" hint appended so the visible wordmark stays a prefix of the
              accessible name (WCAG 2.5.3 Label-in-Name). An aria-label would
              replace the name and break containment for voice-control users. */}
          <span className="sr-only"> — home</span>
        </a>

        {/* Text nav at sm and up, where it fits beside the wordmark. */}
        <nav aria-label="Primary" className="hidden items-center gap-8 sm:flex">
          <a
            href="#dial"
            onClick={(e) => {
              e.preventDefault();
              goTo("#dial");
            }}
            className="flex min-h-11 items-center t-overline text-text-soft transition-colors duration-[var(--dur-ui)] ease-[var(--ease-soft)] hover:text-text"
          >
            The Menu
          </a>
          <button
            type="button"
            onClick={openReservation}
            aria-haspopup="dialog"
            aria-controls="reservation-dialog"
            aria-expanded={reservationOpen}
            className="flex min-h-11 items-center t-overline text-text-soft transition-colors duration-[var(--dur-ui)] ease-[var(--ease-soft)] hover:text-text"
          >
            Request a Table
          </button>
        </nav>

        {/* Mobile: one compact CTA pill instead of the two text links so the
            chrome never crowds the wordmark. Opens the reservation dialog; 44px
            min tap target. */}
        <button
          type="button"
          onClick={openReservation}
          aria-haspopup="dialog"
          aria-controls="reservation-dialog"
          aria-expanded={reservationOpen}
          className="flex min-h-11 items-center rounded-full border border-[rgba(233,225,212,0.28)] bg-[rgba(233,225,212,0.05)] px-5 t-button text-text-soft transition-colors duration-[var(--dur-ui)] ease-[var(--ease-soft)] hover:border-[rgba(233,225,212,0.5)] hover:text-text sm:hidden"
        >
          Reserve
        </button>
      </div>
    </header>
  );
}
