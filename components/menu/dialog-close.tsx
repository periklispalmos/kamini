import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared close button for every native <dialog>, keeps size/stroke/inset consistent.
// 44px hit target (WCAG 2.5.8); stroke 1.25 at size 18 reads ~0.94px to match the 1px hairlines.
// Insets to the page gutter by default; override via className (e.g. "right-8 top-8") for panel dialogs.
export function DialogClose({
  onClose,
  label,
  className,
}: {
  onClose: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className={cn(
        "absolute right-[var(--page-margin)] top-[var(--page-margin)] flex h-11 w-11 items-center justify-center rounded-full border border-line text-text-soft transition-colors duration-[var(--dur-ui)] ease-[var(--ease-soft)] hover:border-line-strong hover:text-text",
        className,
      )}
    >
      <X size={18} strokeWidth={1.25} />
    </button>
  );
}
