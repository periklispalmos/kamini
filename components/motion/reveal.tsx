"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

// IntersectionObserver reveal. Animation lives in globals.css, gated on
// html[data-motion="full"], so reduced-motion / no-JS users get the finished
// frame with nothing stuck at opacity:0.
//
// The observed (outer) node never carries the clip-path: Chromium clips an
// element's own IO rect by its own clip-path, so a mask-reveal on the observed
// node never intersects and stays hidden. Animate an inner child instead.
export function Reveal({
  children,
  as = "div",
  mode = "fade",
  delay = 0,
  once = true,
  className,
}: {
  children: ReactNode;
  as?: "div" | "span";
  mode?: "fade" | "mask";
  delay?: number; // seconds
  once?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const inner = (
    <span
      data-reveal={mode === "mask" ? "mask" : ""}
      data-shown={shown ? "" : undefined}
      style={
        delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined
      }
      className={as === "span" ? "inline-block" : "block"}
    >
      {children}
    </span>
  );

  if (as === "span") {
    return (
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className={cn(className)}
      >
        {inner}
      </span>
    );
  }
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={cn(className)}>
      {inner}
    </div>
  );
}
