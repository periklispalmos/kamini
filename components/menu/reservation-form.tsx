"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { QuietButton } from "@/components/motion/quiet-button";
import {
  DEFAULT_DIAL_CODE,
  reservationSchema,
  submitReservation,
} from "@/lib/reservation";
import { VENUE } from "@/lib/site";

type FieldErrors = Partial<Record<"name" | "mobile", string>>;
type Status = "idle" | "submitting" | "done";

// Shared by the header dialog (idPrefix "reservation", autoFocusName) and the
// inline #request section (idPrefix "request"). idPrefix keeps field/title ids
// unique since both surfaces are in the DOM at once (the dialog stays mounted,
// just closed); the title id backs aria-labelledby, so it must track the prefix.
// autoFocusName defaults off: focusing a field in the scroll section would yank
// the page; only the focus-trapping dialog opts in.
export function ReservationForm({
  idPrefix = "reservation",
  autoFocusName = false,
}: {
  idPrefix?: string;
  autoFocusName?: boolean;
}) {
  const nameId = `${idPrefix}-name`;
  const mobileId = `${idPrefix}-mobile`;
  const titleId = `${idPrefix}-title`;
  const descId = `${idPrefix}-desc`;
  const nameErrId = useId();
  const mobileErrId = useId();
  const formErrId = useId();
  const nameRef = useRef<HTMLInputElement>(null);

  // React 19 implements autoFocus as an imperative focus() on mount that races
  // native showModal(), so defer to a rAF after paint. The offsetParent guard
  // skips the closed (display:none) mount.
  useEffect(() => {
    if (!autoFocusName) return;
    const id = requestAnimationFrame(() => {
      if (nameRef.current && nameRef.current.offsetParent !== null) {
        nameRef.current.focus();
      }
    });
    return () => cancelAnimationFrame(id);
  }, [autoFocusName]);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState(DEFAULT_DIAL_CODE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const parsed = reservationSchema.safeParse({ name, mobile });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if ((key === "name" || key === "mobile") && !next[key]) {
          next[key] = issue.message;
        }
      }
      setErrors(next);
      setFormError(null);
      return;
    }

    setErrors({});
    setFormError(null);
    setStatus("submitting");
    const result = await submitReservation(parsed.data);
    if (result.ok) {
      setStatus("done");
    } else {
      setStatus("idle");
      setFormError(result.error);
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="py-6 text-center">
        <p className="t-overline text-muted">{VENUE.place}</p>
        <h2 id={titleId} className="mt-5 t-display text-text">
          Thank you.
        </h2>
        <p id={descId} className="mx-auto mt-5 max-w-xs t-lead text-text-soft">
          Our maître d&rsquo; will call to confirm your evening.
        </p>
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-line pb-7">
        <p className="t-overline text-muted">Reservations</p>
        <h2 id={titleId} className="mt-3 t-display text-text">
          Request a table
        </h2>
        <p id={descId} className="mt-3 max-w-sm t-spec text-text-soft">
          Leave your name and number. Our maître d&rsquo; will call to arrange
          your evening. Doors at {VENUE.doorsAt}.
        </p>
      </header>

      <form
        noValidate
        onSubmit={handleSubmit}
        aria-describedby={formError ? formErrId : undefined}
        className="mt-8 flex flex-col gap-6"
      >
        <Field id={nameId} label="Name" errorId={nameErrId} error={errors.name}>
          <input
            ref={nameRef}
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? nameErrId : undefined}
            className={INPUT}
          />
        </Field>

        <Field
          id={mobileId}
          label="Mobile"
          errorId={mobileErrId}
          error={errors.mobile}
        >
          <input
            id={mobileId}
            name="mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+30 691 234 5678"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            aria-invalid={errors.mobile ? true : undefined}
            aria-describedby={errors.mobile ? mobileErrId : undefined}
            className={INPUT}
          />
        </Field>

        {/* Submit-level error. Always mounted as a polite live region so a
            change is announced. */}
        <p
          id={formErrId}
          aria-live="polite"
          className="min-h-[1.1rem] t-spec-fine text-text"
        >
          {formError}
        </p>

        <div className="mt-1">
          <QuietButton
            variant="primary"
            type="submit"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Sending…" : "Request a table"}
          </QuietButton>
        </div>
      </form>
    </>
  );
}

const INPUT =
  "w-full rounded-[2px] border border-line bg-[rgba(255,255,255,0.015)] px-4 py-3 t-body text-text placeholder:text-muted transition-colors duration-[var(--dur-ui)] ease-[var(--ease-soft)] hover:border-line-strong focus:border-line-strong aria-[invalid=true]:border-line-strong";

function Field({
  id,
  label,
  error,
  errorId,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  errorId: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="t-overline text-muted">
        {label}
      </label>
      <div className="mt-2.5">{children}</div>
      {/* Always-present polite live region so screen readers announce on change.
          min-height reserves space so the form never shifts (CLS) when a message
          appears. text-text carries the signal without colour (no red in palette). */}
      <p
        id={errorId}
        aria-live="polite"
        className="mt-2 min-h-[1.1rem] t-spec-fine text-text"
      >
        {error}
      </p>
    </div>
  );
}
