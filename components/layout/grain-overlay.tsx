// One fixed overlay spanning all movements so the page reads as a single environment.
// Texture lives in the `.grain::after` rule in globals.css.
export function GrainOverlay() {
  return <div aria-hidden="true" className="grain" />;
}
