"use client";

import { cn } from "@/lib/utils";
import { useMotionAllowed } from "@/lib/motion";
import { ImageSlot } from "@/components/media/image-slot";

// Muted looping background video, mounted as a post-hydration upgrade over a
// static poster. The poster is the loop's first frame, so the swap is
// pixel-identical and zero-CLS (same absolute-inset box); reduced-motion,
// reduced-data, and no-JS visitors never fetch the mp4.
//
// useMotionAllowed() returns false on the server and first hydration render, so
// `animate` matches SSR on first paint, then flips to the live value (no flash)
// and re-renders on a mid-session preference toggle.
export function VideoSlot({
  src,
  poster,
  active = true,
  className,
}: {
  src: string;
  poster?: string;
  active?: boolean;
  className?: string;
}) {
  const animate = useMotionAllowed();

  // Hold on the poster until motion is allowed; only fall through to a
  // non-autoplaying <video> when a slot has no poster.
  if (!animate && poster) {
    return <ImageSlot src={poster} className={className} />;
  }

  return (
    <video
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      autoPlay={animate && active}
      muted
      loop
      playsInline
      poster={poster}
      preload={animate && active ? "metadata" : "none"}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
