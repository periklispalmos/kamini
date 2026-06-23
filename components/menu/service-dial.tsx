"use client";

import { useState } from "react";
import { DialRadial } from "@/components/menu/dial-radial";
import { DialStacked } from "@/components/menu/dial-stacked";
import { FullMenuDrawer } from "@/components/menu/full-menu-drawer";

// Two layouts share one `active` (via DialProvider) and the drawer.
// DialRadial: orbit clock, only when pinned choreography is live (desktop + full motion).
// DialStacked: vertical reading column for everything else (sub-lg, reduced motion/data, no-JS).
// Both render; .dial-radial / .dial-stacked in globals.css gate display pre-paint off
// html[data-motion] + width, so no flash and no-JS safe.
export function ServiceDial({
  onSelectCourse,
}: {
  // When pinned, the movement passes a scroll-to-offset fn so click/keyboard stay
  // in sync with scroll. Only the radial dial uses it; stacked just sets active.
  onSelectCourse?: (i: number) => void;
}) {
  const [menu, setMenu] = useState(false);
  const openMenu = () => setMenu(true);

  return (
    <>
      <DialRadial
        onSelectCourse={onSelectCourse}
        onMenu={openMenu}
        menuOpen={menu}
      />
      <DialStacked onMenu={openMenu} menuOpen={menu} />

      <FullMenuDrawer open={menu} onClose={() => setMenu(false)} />
    </>
  );
}
