// Fictional tasting-menu concept copy.

// Closed union (not string) so EMBER_BY_MOOD / RIM_WARMTH_BY_MOOD are
// Record<Mood, number>: a misspelled/missing mood is a compile error, not a silent
// fall-back to the cool floor that desyncs the thermal arc.
export type Mood = "brine" | "smoke" | "ink" | "fire" | "honey" | "cream";

export type Course = {
  readonly id: string;
  readonly index: number; // 0-based
  readonly title: string;
  readonly subtitle: string;
  readonly ingredients: readonly string[];
  readonly pairing: string;
  readonly mood: Mood; // drives media tint, details accent, thermal arc
  readonly spec: string; // mono micro-label (technique, temp); rendered behind SHOW_DISH_SPEC in course-details
  readonly media: string; // still image is the default
  readonly poster: string;
  readonly seed: number; // placeholder gradient hue seed
};

export const COURSES: readonly Course[] = [
  {
    id: "brined-tomato",
    index: 0,
    title: "Brined Tomato",
    subtitle: "Sun & Salt",
    ingredients: ["sun-dried tomato", "caper leaf", "bottarga"],
    pairing: "chilled assyrtiko · saline · citrus",
    mood: "brine",
    spec: "CURED · 4°C",
    media: "/media/course-01.jpg",
    poster: "/media/course-01.jpg",
    seed: 1,
  },
  {
    id: "fava",
    index: 1,
    title: "Fava",
    subtitle: "Onion & Sweet Oil",
    ingredients: ["yellow split pea", "sweet onion", "caper", "lemon"],
    pairing: "dry assyrtiko · mineral · stone",
    mood: "brine",
    spec: "SLOW · 90 MIN",
    media: "/media/course-02.jpg",
    poster: "/media/course-02.jpg",
    seed: 3,
  },
  {
    id: "red-mullet",
    index: 2,
    title: "Red Mullet",
    subtitle: "Ash & Lemon Leaf",
    ingredients: ["preserved lemon", "wild oregano", "smoked oil"],
    pairing: "mineral white · citrus · salt",
    mood: "smoke",
    spec: "EMBER-SMOKED",
    media: "/media/course-03.jpg",
    poster: "/media/course-03.jpg",
    seed: 5,
  },
  {
    id: "cuttlefish",
    index: 3,
    title: "Cuttlefish",
    subtitle: "Ink & Wild Fennel",
    ingredients: ["cuttlefish", "wild fennel", "sea herb"],
    pairing: "aidani · herb · sea",
    mood: "ink",
    spec: "RAW · SEA",
    media: "/media/course-04.jpg",
    poster: "/media/course-04.jpg",
    seed: 7,
  },
  {
    id: "lamb-over-coals",
    index: 4,
    title: "Lamb over Coals",
    subtitle: "Oregano & Lemon",
    ingredients: ["island lamb", "wild oregano", "lemon"],
    pairing: "mavrotragano · dark fruit · salt",
    mood: "fire",
    spec: "OVER COALS · 240°C",
    media: "/media/course-05.jpg",
    poster: "/media/course-05.jpg",
    seed: 9,
  },
  {
    id: "chloro-and-honey",
    index: 5,
    title: "Chloró & Honey",
    subtitle: "Goat & Thyme",
    ingredients: ["fresh chloró cheese", "thyme honey", "barley rusk"],
    pairing: "vinsanto · honey · nut",
    mood: "honey",
    spec: "AGED · HONEY",
    media: "/media/course-06.jpg",
    poster: "/media/course-06.jpg",
    seed: 6,
  },
  {
    id: "sea-salt-vanilla",
    index: 6,
    title: "Sea Salt & Vanilla",
    subtitle: "Cream & Salt",
    ingredients: ["vanilla cream", "grape must", "sea salt"],
    pairing: "vinsanto · caramel · long",
    mood: "cream",
    spec: "FROZEN · VANILLA",
    media: "/media/course-07.jpg",
    poster: "/media/course-07.jpg",
    seed: 2,
  },
];

export const COURSE_COUNT = COURSES.length;

// Per-mood strength of the warm "coals under the plate" glow (NightStage plateGlow),
// keyed by Course.mood. Heats toward the fire course, cools to dessert; peak 0.42 on
// "Lamb over Coals". brine/ink/cream keep a ~0.05 floor so the between-course centre
// never goes pure black. Glow opacity multiplies with the plate open/close envelope,
// so it only shows while the plate is open.
export const EMBER_BY_MOOD: Record<Mood, number> = {
  brine: 0.05,
  smoke: 0.18,
  ink: 0.06,
  fire: 0.42,
  honey: 0.3,
  cream: 0.05,
};

// Plate hairline ring (inset box-shadow in NightStage), keyed by Course.mood. Values
// are percent ember mixed into bone --line via color-mix(in oklab, var(--line),
// var(--ember) X%). Lower than EMBER_BY_MOOD since the rim is an always-present 1px
// line, not a glow: fire peaks at 50, dessert cools to pure bone (0). Gated behind
// animatePlate (0 under reduced motion) and transitioned over 0.9s. Writes box-shadow
// colour only, never a second writer on plateClip / plateGlow / room.
export const RIM_WARMTH_BY_MOOD: Record<Mood, number> = {
  brine: 6,
  smoke: 22,
  ink: 8,
  fire: 50,
  honey: 32,
  cream: 0,
};
