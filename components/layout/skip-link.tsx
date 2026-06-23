// Keyboard skip target: visually hidden until focused.
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-[var(--z-skip)] focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:border focus:border-line-strong focus:bg-surface focus:px-4 focus:py-2.5 focus:t-label focus:text-text"
    >
      Skip to content
    </a>
  );
}
