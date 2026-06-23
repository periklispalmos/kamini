import { Fragment, type ReactNode } from "react";

// Wraps "&" in a span so it renders as Fraunces' italic/swash ampersand. Italic
// is the guaranteed floor; swsh/dlig may be stripped by the Google subset.
// Returns the raw string untouched when there's no "&" so callers can wrap blindly.
export function withAmp(text: string): ReactNode {
  if (!text.includes("&")) return text;
  const parts = text.split("&");
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 ? (
        <span className="amp">{"&"}</span>
      ) : null}
    </Fragment>
  ));
}
