import type { NextConfig } from "next";

// Production CSP. script-src 'unsafe-inline' is needed for the pre-paint
// MotionScript (sets html[data-motion] before first paint) and GSAP's inline
// style writes.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const baseHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Verify/prod builds set KAMINI_DIST_DIR (e.g. .next-verify) so a build won't
  // overwrite the chunks a running `next dev` serves from `.next` (shared dir
  // clobbers dev into an Internal Server Error). Dev keeps the default `.next`.
  distDir: process.env.KAMINI_DIST_DIR || ".next",
  experimental: {
    optimizePackageImports: ["motion", "gsap"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const headers =
      process.env.NODE_ENV === "production"
        ? [{ key: "Content-Security-Policy", value: csp }, ...baseHeaders]
        : baseHeaders;
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
