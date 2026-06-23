import { z } from "zod";

// Schema is the single source of truth: dialog validates for inline errors,
// Server Action re-validates before sending. Accepts canonical Greek mobiles
// (+30 69x), bare national mobiles (auto-prefixed +30), and any other valid
// international number as a fallback for non-Greek guests.

export const DEFAULT_DIAL_CODE = "+30 ";

const name = z
  .string()
  .trim()
  .min(2, "Please enter your name.")
  .max(80, "That name looks too long.");

const mobile = z
  .string()
  .trim()
  .min(1, "Please enter a mobile number.")
  .transform((value) => {
    const cleaned = value.replace(/[\s().-]/g, "").replace(/^0030/, "+30");
    // Auto-prefix a bare Greek national mobile (10 digits starting 69).
    return /^69\d{8}$/.test(cleaned) ? `+30${cleaned}` : cleaned;
  })
  .refine(
    (value) =>
      /^\+3069\d{8}$/.test(value) || // canonical Greek mobile
      (/^\+\d{8,15}$/.test(value) && !value.startsWith("+30")), // international
    "Enter a valid mobile number, e.g. +30 691 234 5678.",
  );

export const reservationSchema = z.object({ name, mobile });

export type ReservationInput = z.input<typeof reservationSchema>;
export type ReservationData = z.output<typeof reservationSchema>;

export type ReservationResult = { ok: true } | { ok: false; error: string };

// Client-side stand-in for the Server Action. The async signature +
// ReservationResult shape match the real impl so it drops in at the call site.
export async function submitReservation(
  raw: ReservationInput,
): Promise<ReservationResult> {
  // Re-validate on submit as a Server Action would; never trust client values.
  const parsed = reservationSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Please check the details and try again." };
  }
  // Fake the round-trip so the dialog's pending state shows.
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 700);
  });
  return { ok: true };
}
