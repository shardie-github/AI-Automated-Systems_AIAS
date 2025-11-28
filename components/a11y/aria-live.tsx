"use client";
import { useRef } from "react";

interface AriaLiveProps {
  message: string;
  priority?: "polite" | "assertive";
}

export function AriaLive({ message, priority = "polite" }: AriaLiveProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

export function useAriaLive() {
  const liveRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    if (liveRef.current) {
      liveRef.current.textContent = message;
      liveRef.current.setAttribute("aria-live", priority);
      setTimeout(() => {
        if (liveRef.current) {
          liveRef.current.textContent = "";
        }
      }, 1000);
    }
  };

  return {
    announce,
    AriaLiveRegion: () => (
      <div
        ref={liveRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    ),
  };
}
