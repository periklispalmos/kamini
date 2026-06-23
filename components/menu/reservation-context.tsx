"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ReservationDialog } from "@/components/menu/reservation-dialog";

// Single ReservationDialog mounted once, opened from anywhere via useReservation().
type ReservationContextValue = {
  open: boolean;
  openReservation: () => void;
  closeReservation: () => void;
};

const ReservationContext = createContext<ReservationContextValue | null>(null);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({
      open,
      openReservation: () => setOpen(true),
      closeReservation: () => setOpen(false),
    }),
    [open],
  );

  return (
    <ReservationContext.Provider value={value}>
      {children}
      <ReservationDialog open={open} onClose={() => setOpen(false)} />
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const ctx = useContext(ReservationContext);
  if (!ctx) {
    throw new Error("useReservation must be used within ReservationProvider");
  }
  return ctx;
}
