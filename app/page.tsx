import type { CSSProperties } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { Arrival } from "@/components/movements/arrival";
import { ServiceDialMovement } from "@/components/movements/service-dial-movement";
import { Request } from "@/components/movements/request";

export default function Home() {
  return (
    <SiteShell>
      <Arrival />
      <ServiceDialMovement />
      {/* Scroll length for the terrace zoom. Empty/aria-hidden: the push-in is the
          fixed TerraceSequence canvas scrubbed across this height, no foreground copy.
          Tall only under desktop motion (scene-track); collapses to 0 otherwise so
          reduced-motion goes dial straight to request. */}
      <section
        id="terrace"
        aria-hidden="true"
        className="scene-track"
        style={{ "--track-h": "240vh" } as CSSProperties}
      />
      <Request />
    </SiteShell>
  );
}
