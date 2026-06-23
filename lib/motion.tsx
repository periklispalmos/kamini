"use client";

import { useSyncExternalStore } from "react";

// Reduced-motion or reduced-data both mean hold the heavy stuff. The whole site
// gates on both, so anything branching render output on the preference must too.
const REDUCE_QUERIES = [
  "(prefers-reduced-motion: reduce)",
  "(prefers-reduced-data: reduce)",
] as const;

// Runs before first paint, sets html[data-motion] so CSS can gate heavy
// animation. Honours both reduced-motion and reduced-data.
const MOTION_SCRIPT = `(function(){try{var m=window.matchMedia;var r=m&&(m('(prefers-reduced-motion: reduce)').matches||m('(prefers-reduced-data: reduce)').matches);document.documentElement.setAttribute('data-motion',r?'reduced':'full');}catch(e){document.documentElement.setAttribute('data-motion','full');}})();`;

export function MotionScript() {
  return <script dangerouslySetInnerHTML={{ __html: MOTION_SCRIPT }} />;
}

// Module-cached MediaQueryList pair (client only). Subscribe and getSnapshot
// share the same objects, so matchMedia never re-runs per render.
let reduceMqls: MediaQueryList[] | null = null;
function getReduceMqls(): MediaQueryList[] {
  if (!reduceMqls) reduceMqls = REDUCE_QUERIES.map((q) => window.matchMedia(q));
  return reduceMqls;
}

// Render-safe "is full motion allowed" signal for components that branch render
// output on the preference (e.g. autoplaying video vs static poster).
// useSyncExternalStore returns false on the server and on the first hydration
// render (getServerSnapshot), so first paint matches SSR with no flash, then
// flips live without setState-in-effect. Differs from motion/react's
// useReducedMotion: also honours reduced-data, and subscribes to `change` so a
// mid-session OS toggle tears the heavy media back down.
export function useMotionAllowed(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mqls = getReduceMqls();
      mqls.forEach((q) => q.addEventListener("change", onStoreChange));
      return () =>
        mqls.forEach((q) => q.removeEventListener("change", onStoreChange));
    },
    () => !getReduceMqls().some((q) => q.matches),
    () => false,
  );
}
