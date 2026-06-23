import { SmoothScrollProvider } from "@/components/layout/smooth-scroll-provider";
import { GrainOverlay } from "@/components/layout/grain-overlay";
import { Vignette } from "@/components/layout/vignette";
import { CinematicCursor } from "@/components/layout/cinematic-cursor";
import { SkipLink } from "@/components/layout/skip-link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NightStage } from "@/components/night/night-stage";
import { DialProvider } from "@/components/menu/dial-context";
import { ReservationProvider } from "@/components/menu/reservation-context";

// Background, grain, vignette and NightStage mount once and never unmount, so the
// four movements read as one continuous night instead of stacked sections.
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <DialProvider>
        <ReservationProvider>
          <GrainOverlay />
          <Vignette />
          <CinematicCursor />
          <SkipLink />
          <Header />
          <NightStage />
          <main id="main" tabIndex={-1} className="relative z-[var(--z-content)]">
            {children}
          </main>
          <Footer />
        </ReservationProvider>
      </DialProvider>
    </SmoothScrollProvider>
  );
}
