import { cn } from "@/lib/utils";

// Still background image, the default menu asset. Box matches VideoSlot
// (absolute inset-0 + object-cover) so swapping video<->image is zero layout change.
// Decorative: alt empty + aria-hidden, surrounding markup carries semantics.
// Plain <img> (not next/image) stays drop-in interchangeable with <video>, no fill/sizes plumbing.
export function ImageSlot({
  src,
  className,
  priority,
}: {
  src: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    /* next/image fill adds loader/sizes plumbing that breaks the clean video<->image
       swap, with no LCP benefit on aria-hidden art. no-img-element suppressed on purpose. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
