"use client";

import { useRef } from "react";
import {
  DESKTOP_FULL,
  ScrollTrigger,
  gsap,
  registerScroll,
  useGSAP,
} from "@/lib/scroll";
import { TERRACE_SEQUENCE } from "@/lib/media";

registerScroll();

// Movement 3, the terrace zoom: scroll-scrubbed frame sequence painted to a
// canvas, scroll maps to frame index so the camera pushes from full terrace in to
// a single candlelit table. Lives inside NightStage's fixed `room` layer, which
// owns the opacity bloom (coupled to the dial fade-out) and footer-lift; this
// component owns only frame painting and the scrub.
//
// Desktop + full-motion upgrade only. Under reduced motion/data, sub-desktop, or
// no-JS the GSAP block never runs and the parent `room` stays opacity 0, so the
// canvas isn't shown and the frames are never fetched; the Request section paints
// its own settled still instead (globals.css .request-still). A poster img of the
// first frame sits behind the canvas so a full-motion visitor never sees a blank
// black plane while the sequence preloads.
export function TerraceSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const mm = gsap.matchMedia();
    mm.add(DESKTOP_FULL, () => {
      // DESKTOP_FULL gates on width + reduced-motion; reduced-data desktop still
      // matches it, so defer to data-motion (resolved from motion or data). A
      // data-saver visitor keeps the static still: no canvas, no frame fetch.
      if (document.documentElement.dataset.motion !== "full") return;
      // Windowed decode needs createImageBitmap (Baseline since 2021). On the rare
      // engine without it, skip the scrub and leave the poster (first frame) as a
      // static bed — same graceful-still philosophy as the reduced-motion path.
      if (typeof createImageBitmap !== "function") return;

      const { count } = TERRACE_SEQUENCE;

      // Decoded RGBA is ~8MB/frame at 1928x1072, so holding all 145 resident peaks
      // ~1.2GB. Instead keep every *encoded* WebP blob (≈14MB total, fetched once
      // on idle) and decode only a sliding window of frames around the playhead to
      // ImageBitmaps, closing those that fall outside it. Resident decoded memory
      // stays ~200MB with pixel-identical output: drawImage copies into the canvas,
      // so closing a bitmap never blanks the visible frame, and re-entering an
      // evicted position re-decodes from its in-memory blob (no refetch, no network).
      const WINDOW_LEAD = 16; // frames kept decoded ahead of travel
      const WINDOW_TRAIL = 8; // and behind it

      const blobs = new Array<Blob | null>(count).fill(null);
      const bitmaps = new Map<number, ImageBitmap>();
      const decoding = new Set<number>();
      const ac = new AbortController();
      let current = 0;
      let dir = 1; // scroll travel: 1 forward (zoom in), -1 reverse (zoom out)
      let painted = -1;
      let preloading = false;
      // Set on teardown so the async fetch/decode promises below can't store a
      // bitmap or paint into a reverted instance after the trigger is killed.
      let killed = false;

      // Cover-fit destination rect. All frames share the source aspect, so the
      // rect depends only on the canvas backing size: recompute it (and the
      // dpr-scaled backing store) only when size is dirty (first paint + resize),
      // never on a scrub tick. paint() is on the hot scroll path, kept to one
      // drawImage with no layout reads.
      const aspect = TERRACE_SEQUENCE.width / TERRACE_SEQUENCE.height;
      let sizeDirty = true;
      let dx = 0;
      let dy = 0;
      let dw = 0;
      let dh = 0;

      function resize() {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = Math.round(canvas!.clientWidth * dpr);
        const h = Math.round(canvas!.clientHeight * dpr);
        canvas!.width = w;
        canvas!.height = h;
        if (aspect > w / h) {
          dh = h;
          dw = h * aspect;
        } else {
          dw = w;
          dh = w / aspect;
        }
        dx = (w - dw) / 2;
        dy = (h - dh) / 2;
        // Setting canvas.width/height resets the 2D context to defaults, so
        // reapply high-quality resampling here; the default "low" smoothing
        // visibly softens the upscale into the retina backing store.
        ctx!.imageSmoothingQuality = "high";
        sizeDirty = false;
      }

      // Inclusive window bounds, biased toward travel direction so the lookahead
      // sits where the playhead is heading.
      function windowBounds(): [number, number] {
        const lead = dir >= 0 ? WINDOW_LEAD : WINDOW_TRAIL;
        const trail = dir >= 0 ? WINDOW_TRAIL : WINDOW_LEAD;
        return [
          Math.max(0, current - trail),
          Math.min(count - 1, current + lead),
        ];
      }

      function paint(target: number) {
        // Draw the nearest decoded frame at or before the target so a slow connection
        // (or a window not yet filled) scrubs through whatever has arrived rather
        // than flashing blank; the canvas also retains the last drawn frame, so a
        // fast jump past the window holds that frame until the new one decodes.
        let i = target;
        while (i >= 0 && !bitmaps.has(i)) i--;
        if (i < 0) return;
        const resized = sizeDirty;
        if (resized) resize();
        else if (i === painted) return;
        painted = i;
        ctx!.drawImage(bitmaps.get(i)!, dx, dy, dw, dh);
      }

      function decodeFrame(i: number) {
        const blob = blobs[i];
        if (!blob || bitmaps.has(i) || decoding.has(i)) return;
        decoding.add(i);
        createImageBitmap(blob).then(
          (bmp) => {
            decoding.delete(i);
            const [lo, hi] = windowBounds();
            // Slid out of the window (or torn down) while decoding: free it now.
            if (killed || i < lo || i > hi) {
              bmp.close();
              return;
            }
            bitmaps.set(i, bmp);
            // Repaint if this is (or just filled the gap before) the frame we
            // currently want, keeping the canvas current as frames stream in.
            if (i <= current && i >= painted) paint(current);
          },
          () => decoding.delete(i),
        );
      }

      function ensureWindow() {
        const [lo, hi] = windowBounds();
        for (let i = lo; i <= hi; i++) decodeFrame(i);
        // Evict decoded frames outside the window. Safe even for the visible frame:
        // its pixels were already copied into the canvas by drawImage.
        for (const [i, bmp] of bitmaps) {
          if (i < lo || i > hi) {
            bmp.close();
            bitmaps.delete(i);
          }
        }
      }

      function preload() {
        if (preloading) return;
        preloading = true;
        for (let i = 0; i < count; i++) {
          fetch(TERRACE_SEQUENCE.frameUrl(i), { signal: ac.signal })
            .then((r) => (r.ok ? r.blob() : null))
            .then((blob) => {
              if (killed || !blob) return;
              blobs[i] = blob;
              // Decode straight away if this frame is already in the live window.
              const [lo, hi] = windowBounds();
              if (i >= lo && i <= hi) decodeFrame(i);
            })
            .catch(() => {
              // Abort on teardown or a network error: the frame just stays
              // undecoded and paint() falls back to its nearest decoded neighbour.
            });
        }
      }

      // Preload on idle, not at mount: the frames must never compete with the
      // hero LCP (server-rendered text + still). By the time the visitor scrolls
      // the long dial pin, the blobs are warm and the first window is decoded.
      const ric =
        window.requestIdleCallback ??
        ((cb: () => void) => window.setTimeout(cb, 1200));
      const idle = ric(preload);

      const scrub = ScrollTrigger.create({
        trigger: "#terrace",
        // Co-located with the terrace bloom (NightStage room opacity tween,
        // #terrace top 80%), not "top top". The image blooms in at top 80%; start
        // the scrub there so the push-in begins the instant the image appears,
        // with no frozen lead-in. The frame mapping auto-rescales to the span.
        start: "top 80%",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          current = Math.round(self.progress * (count - 1));
          if (self.direction) dir = self.direction;
          ensureWindow();
          paint(current);
        },
      });

      // Repaint the current frame on resize (canvas is a bitmap, it doesn't
      // reflow like object-fit). Mark size dirty so the recompute runs.
      const onResize = () => {
        sizeDirty = true;
        paint(current);
      };
      window.addEventListener("resize", onResize);

      return () => {
        killed = true;
        scrub.kill();
        ac.abort();
        window.removeEventListener("resize", onResize);
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idle as number);
        } else {
          window.clearTimeout(idle as number);
        }
        for (const bmp of bitmaps.values()) bmp.close();
        bitmaps.clear();
      };
    });

    return () => mm.revert();
  });

  return (
    <div aria-hidden="true" className="absolute inset-0">
      {/* Poster is the first (widest) frame, so the bloom-in shows the full
          terrace immediately while the sequence preloads; the canvas overdraws it
          the instant frame 0 lands and on every scrub tick after. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={TERRACE_SEQUENCE.frameUrl(0)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
