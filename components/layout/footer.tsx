import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  AGENCY,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
  SITE_WORDMARK,
  VENUE,
} from "@/lib/site";

// Plain text, not links: no real Instagram/Press URLs yet, and href="#" is a
// jump-to-top trap (WCAG 2.4.4 / 4.1.2). Swap to anchors once URLs exist.
const ELSEWHERE: readonly { label: string }[] = [
  { label: "Instagram" },
  { label: "Press" },
];

// py-2 gives a ~42px tap target (WCAG 2.5.8); inline-block so the long email
// still wraps via [overflow-wrap].
const LINK =
  "inline-block py-2 t-body text-text-soft underline decoration-line underline-offset-[5px] transition-colors duration-[var(--dur-ui)] ease-[var(--ease-soft)] hover:text-text hover:decoration-line-strong";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-[var(--z-content)] border-t border-line bg-bg px-[var(--page-margin)] pb-12 pt-14">
      {/* items-end bottom-aligns the sparse column cluster to the taller brand
          block so the row doesn't float high-right with a void beneath. */}
      <div className="flex flex-col gap-14 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
        {/* Brand sign-off */}
        <div className="lg:max-w-sm">
          <p className="t-title text-text">{SITE_WORDMARK}</p>
          <p className="mt-3 t-overline text-muted">{SITE_TAGLINE}</p>
          <p className="mt-6 max-w-sm t-body text-text-soft">{SITE_DESCRIPTION}</p>
        </div>

        {/* Coordinates + reservations + elsewhere. */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-9 min-[480px]:grid-cols-3">
          <FootCol title="Coordinates">
            <span className="t-body text-text-soft">{VENUE.coordinates}</span>
          </FootCol>
          <FootCol title="Reservations">
            <a
              href={`mailto:${VENUE.email}`}
              className={cn(LINK, "[overflow-wrap:anywhere]")}
            >
              {VENUE.email}
            </a>
            <span className="t-body text-muted">By request only</span>
          </FootCol>
          <FootCol title="Elsewhere">
            {ELSEWHERE.map((l) => (
              <span key={l.label} className="t-body text-text-soft">
                {l.label}
              </span>
            ))}
          </FootCol>
        </div>
      </div>

      {/* Legal + credit */}
      <div className="mt-16 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="t-eyebrow text-muted">
          © {year} {SITE_WORDMARK} · {VENUE.place}
        </p>
        <p className="t-eyebrow text-muted">
          Designed &amp; built by{" "}
          <a
            href={AGENCY.url}
            rel="noopener"
            className="text-text-soft underline decoration-line underline-offset-4 transition-colors duration-[var(--dur-ui)] ease-[var(--ease-soft)] hover:text-text"
          >
            {AGENCY.name}
          </a>
        </p>
      </div>
    </footer>
  );
}

function FootCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2.5">
      <p className="t-eyebrow text-muted">{title}</p>
      {children}
    </div>
  );
}
