"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Singleton Lenis instance — lives outside React to avoid stale closures. */
let globalLenis: Lenis | null = null;

const LenisContext = createContext<{ getLenis: () => Lenis | null }>({
  getLenis: () => null,
});

export function useLenis() {
  const ctx = useContext(LenisContext);
  return ctx.getLenis;
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const getterRef = useRef({ getLenis: () => globalLenis });

  useEffect(() => {
    const instance = new Lenis({
      duration: 2.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
      wheelMultiplier: 0.65,
      smoothWheel: true,
    });
    globalLenis = instance;

    // Synchronize Lenis with GSAP ScrollTrigger
    instance.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Refresh all ScrollTriggers after Lenis is ready
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(tickerCallback);
      instance.destroy();
      globalLenis = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={getterRef.current}>
      {children}
    </LenisContext.Provider>
  );
}
