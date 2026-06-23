import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { MotionScript } from "@/lib/motion";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  VENUE,
} from "@/lib/site";

// Restaurant structured data. URLs use placeholder SITE_URL until the real-domain swap;
// acceptsReservations true because the header opens a by-request reservation dialog.
const RESTAURANT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  servesCuisine: VENUE.servesCuisine,
  priceRange: VENUE.priceRange,
  acceptsReservations: "True",
  email: VENUE.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: VENUE.addressLocality,
    addressRegion: VENUE.addressRegion,
    addressCountry: VENUE.addressCountry,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: VENUE.latitude,
    longitude: VENUE.longitude,
  },
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <MotionScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(RESTAURANT_JSON_LD) }}
        />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
