import { ASSETS_READY } from "@/lib/media";
import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { VideoSlot } from "@/components/media/video-slot";
import { ImageSlot } from "@/components/media/image-slot";

// Video extensions render as a looping <video>; everything else is a still <img>.
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

// Single switch for every media surface. Renders the dark placeholder until
// ASSETS_READY (or ready prop), then the real image/video with no layout change.
export function MediaSlot({
  label,
  src,
  poster,
  seed = 0,
  active = false,
  ready = ASSETS_READY,
  priority = false,
  className,
}: {
  label: string;
  src?: string;
  poster?: string;
  seed?: number;
  active?: boolean;
  ready?: boolean;
  priority?: boolean;
  className?: string;
}) {
  if (ready && src) {
    return VIDEO.test(src) ? (
      <VideoSlot src={src} poster={poster} active={active} className={className} />
    ) : (
      <ImageSlot src={src} className={className} priority={priority} />
    );
  }
  return <PlaceholderMedia label={label} seed={seed} className={className} />;
}
