export const SITE_NAME = "Kámini";
export const SITE_WORDMARK = "KÁMINI";
export const SITE_TAGLINE = "A Night of Service";
export const SITE_DESCRIPTION =
  "Fine dining above the Santorini caldera. A tasting menu shaped by fire, sea, and season, served from sunset.";
export const SITE_URL = "https://kamini.example";

export const VENUE = {
  place: "Santorini, Greece",
  service: "Dinner from sunset",
  doorsAt: "21:00",
  season: "Open seasonally",
  // Display string (footer) + numerics (Restaurant JSON-LD geo). Keep in sync.
  coordinates: "36.3932° N, 25.4615° E",
  latitude: 36.3932,
  longitude: 25.4615,
  addressLocality: "Santorini",
  addressRegion: "South Aegean",
  addressCountry: "GR",
  servesCuisine: ["Greek", "Aegean", "Contemporary"],
  priceRange: "€€€€",
  email: "table@kamini.example",
} as const;

// Footer credit anchor. Keep referrer for attribution.
export const AGENCY = {
  name: "Selene Digital",
  url: "https://selenedigital.com",
} as const;
