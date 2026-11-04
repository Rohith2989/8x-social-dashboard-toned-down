"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

/*
  Arrival: a card resolves once, the first time it is on screen (the brand's loading resolves into the real layout).
  "wait" until then, "in" while it resolves, "done" after. Everything inside that moves on arrival (numbers rolling,
  dots arriving, a check drawing) reads it from context, so one observer serves the whole card. With reduced motion
  the same steps take no time (globals.css), so everything is simply there.
*/

export type Arrival = "wait" | "in" | "done";

const ArrivalContext = createContext<Arrival>("done");

export const useArrived = () => useContext(ArrivalContext) !== "wait";

export function useArrival<T extends Element>(threshold = 0.18) {
  const ref = useRef<T>(null);
  const [state, setState] = useState<Arrival>("wait");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // the last of the observer's entries is the one that holds
    const io = new IntersectionObserver(
      (es) => {
        if (es[es.length - 1].isIntersecting) {
          setState("in");
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, state, setState] as const;
}

export const ArrivalProvider = ArrivalContext.Provider;
