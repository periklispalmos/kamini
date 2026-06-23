"use client";

import { COURSES } from "@/data/menu";
import { DialogClose } from "@/components/menu/dialog-close";
import { useDialog } from "@/components/menu/use-dialog";
import { withAmp } from "@/lib/typeset";
import { SITE_WORDMARK, VENUE } from "@/lib/site";

// Native <dialog> menu panel, slides in from the right. All courses shown
// fully, never hover-gated.
export function FullMenuDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useDialog(open, onClose);

  return (
    <dialog
      ref={ref}
      id="menu-dialog"
      aria-label="Tonight's menu"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="modal modal-right m-0 ml-auto h-dvh max-h-none w-[min(560px,92vw)] max-w-none bg-surface p-0 text-text"
    >
      {/* Lenis captures the wheel at the window even while stopped, so this panel
          can't scroll without data-lenis-prevent. Lenis checks the attribute
          before its stop guard, letting the wheel fall through to native overflow
          here while the page stays locked. */}
      <div
        data-lenis-prevent
        className="relative flex h-full flex-col overflow-y-auto px-12 py-14"
      >
        {/* Inset to the panel's own padding, not the page gutter. */}
        <DialogClose onClose={onClose} label="Close menu" className="right-8 top-8" />

        <header className="border-b border-line pb-8">
          <p className="t-overline text-muted">{SITE_WORDMARK}</p>
          <h2 className="mt-3 t-display text-text">Tonight</h2>
          <p className="mt-2 t-overline text-muted">{VENUE.service}</p>
        </header>

        <ol className="mt-8 flex flex-col">
          {COURSES.map((c) => (
            <li
              key={c.id}
              className="border-b border-line py-6 last:border-b-0"
            >
              <h3 className="t-title text-text">{withAmp(c.title)}</h3>
              <p className="mt-1 t-subtitle-sm text-text-soft">
                {withAmp(c.subtitle)}
              </p>
              <p className="mt-3 t-spec text-text-soft">
                {c.ingredients.join("  ·  ")}
              </p>
              <p className="mt-2 t-spec-fine text-muted">
                Pairing — {c.pairing}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </dialog>
  );
}
