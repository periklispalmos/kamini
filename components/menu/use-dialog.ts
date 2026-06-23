"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";

// Drives a native <dialog> from React state. showModal() gives focus trap,
// top-layer, inert background and focus-restore; this adds Escape->onClose and
// background scroll-lock.
//
// Two scroll-lock paths. Where Lenis owns scroll, lenis.stop()/start() is the
// lock. With no Lenis (reduced-motion / <1024px) showModal() blocks interaction
// but not wheel, so document overflow is locked too (scrollbar-gutter:stable
// keeps it shift-free).
export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();
  const locked = useRef(false);

  // This effect owns the scroll lock symmetrically: it (re)acquires whenever the
  // dialog is open and releases in cleanup, so every teardown path frees it —
  // normal close (open flips false), unmount-while-open, and a re-run when the
  // Lenis instance changes (SmoothScrollProvider mounts/unmounts ReactLenis on a
  // resize across 1024px or a reduced-motion/reduced-data toggle). Acquiring on
  // every open run (not just the showModal edge) re-locks the new Lenis instance
  // after such a swap. Without this, releasing only in the native `close` event
  // left the page permanently scroll-dead on unmount-while-open.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
    if (!open) return;
    if (lenis) {
      lenis.stop();
    } else {
      document.documentElement.style.overflow = "hidden";
      locked.current = true;
    }
    return () => {
      lenis?.start();
      if (locked.current) {
        document.documentElement.style.overflow = "";
        locked.current = false;
      }
    };
  }, [open, lenis]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e: Event) => {
      e.preventDefault(); // let React drive the close on Escape
      onClose();
    };
    d.addEventListener("cancel", onCancel);
    return () => {
      d.removeEventListener("cancel", onCancel);
    };
  }, [onClose]);

  return ref;
}
