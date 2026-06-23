import { placeholderStyle } from "@/lib/media";
import { cn } from "@/lib/utils";

// Designed dark placeholder (ceramic gradient + ash-white rim + smoky vignette), not a wireframe.
// The [data-media] caption is hidden normally (.media-label in globals.css), shown only under html.dev-media-labels.
export function PlaceholderMedia({
  label,
  seed = 0,
  className,
}: {
  label: string;
  seed?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={placeholderStyle(seed)}
    >
      {/* rim light + inner darkening */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(233,225,212,0.07), inset 0 0 140px rgba(0,0,0,0.55)",
        }}
      />
      {/* smoky drift from a low corner */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(150% 100% at 72% 112%, rgba(20,19,16,0) 28%, rgba(5,5,5,0.62) 100%)",
        }}
      />
      <span
        data-media={label}
        className="media-label absolute bottom-2.5 right-3 t-eyebrow text-muted"
      >
        {label}
      </span>
    </div>
  );
}
