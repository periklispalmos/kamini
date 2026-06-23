"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { COURSE_COUNT } from "@/data/menu";

type DialState = {
  active: number;
  setActive: (i: number) => void;
};

const DialCtx = createContext<DialState>({ active: 0, setActive: () => {} });

// Single source of active course shared by dial UI and the fixed plate media,
// so click, keyboard, and scroll stay in sync.
export function DialProvider({ children }: { children: React.ReactNode }) {
  const [active, setRaw] = useState(0);
  const value = useMemo<DialState>(
    () => ({
      active,
      setActive: (i: number) =>
        setRaw(((i % COURSE_COUNT) + COURSE_COUNT) % COURSE_COUNT),
    }),
    [active],
  );
  return <DialCtx value={value}>{children}</DialCtx>;
}

export const useDial = () => useContext(DialCtx);
