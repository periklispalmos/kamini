"use client";

import { useState } from "react";
import { DialogClose } from "@/components/menu/dialog-close";
import { ReservationForm } from "@/components/menu/reservation-form";
import { useDialog } from "@/components/menu/use-dialog";

// Centred reservation card, distinct from the right-sliding "Tonight's Menu" drawer.
// Native <dialog> via useDialog gives focus trap, Escape-to-close and focus-restore.
//
// The form remounts via `key` on open so each open starts fresh (no stale success
// screen / half-typed number) without a reset effect. The key holds steady while
// closing so content doesn't flash back to an empty form during the fade-out.
export function ReservationDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useDialog(open, onClose);

  // Advance the session key only on the closed-to-open edge (setState during render
  // re-renders before commit, so no flash and no effect needed).
  const [prevOpen, setPrevOpen] = useState(open);
  const [sessionKey, setSessionKey] = useState(0);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setSessionKey((k) => k + 1);
  }

  return (
    <dialog
      ref={ref}
      id="reservation-dialog"
      aria-labelledby="reservation-title"
      aria-describedby="reservation-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="modal modal-center m-auto w-[min(30rem,92vw)] max-w-none rounded-[2px] border border-line bg-surface p-0 text-text"
    >
      <div
        data-lenis-prevent
        className="relative max-h-[88dvh] overflow-y-auto px-9 py-11 sm:px-12 sm:py-14"
      >
        <DialogClose onClose={onClose} label="Close" className="right-6 top-6" />
        <ReservationForm key={sessionKey} idPrefix="reservation" autoFocusName />
      </div>
    </dialog>
  );
}
