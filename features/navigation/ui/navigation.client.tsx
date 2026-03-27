"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import {
  PERSONAL,
  ROLE_NAV_LINKS,
  SECTION_NAV_LINKS,
  type NavLink,
} from "@data";
import { useNavStore, useSectionScroll } from "@hooks";
import {
  HISTORY_EVENT,
  SECTION_IDS_ORDERED,
  TOKENS,
  TRANSITION,
  type SectionId,
  Z_INDEX,
} from "@utilities";
import { isSectionId, resolveActiveSection } from "../model/active-section";
import { resolveNavLinkColor } from "../model/nav-link-state";
import {
  INITIAL_NAVIGATION_STATE,
  NAVIGATION_TIMING,
  navigationReducer,
} from "../model/navigation-machine";

const { textDim } = TOKENS;
const { nav } = Z_INDEX;
const { POP_STATE } = HISTORY_EVENT;

const WHO_AM_I_NAV = SECTION_NAV_LINKS.filter((l) => l.sectionId === "portrait");
const ACT_NAV = ROLE_NAV_LINKS;
const SECTION_NAV = SECTION_NAV_LINKS.filter((l) => l.sectionId !== "portrait");
const OBSERVER_THRESHOLDS = [0, 0.1, 0.25, 0.5];

const NavigationMobileMenu = dynamic(
  () =>
    import("./navigation-mobile-menu.client").then(
      ({ NavigationMobileMenu: Component }) => Component,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

function getSectionIdFromHash(hash: string): SectionId | null {
  if (!hash.startsWith("#")) return null;
  const id = hash.slice(1);
  return isSectionId(id) ? id : null;
}

interface DesktopNavLinkProps {
  link: NavLink;
  activeSection: SectionId | "";
  hoveredSection: SectionId | null;
  idleColor: string;
  onNavigate: (sectionId: SectionId) => void;
  onHoverSection: (sectionId: SectionId | null) => void;
}

function DesktopNavLink({
  link,
  activeSection,
  hoveredSection,
  idleColor,
  onNavigate,
  onHoverSection,
}: DesktopNavLinkProps) {
  const isActive = activeSection === link.sectionId;
  const color = resolveNavLinkColor({
    activeSection,
    hoveredSection,
    linkSection: link.sectionId,
    activeColor: link.color,
    idleColor,
  });

  return (
    <a
      href={`#${link.sectionId}`}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(link.sectionId);
      }}
      onMouseEnter={() => onHoverSection(link.sectionId)}
      onMouseLeave={() => onHoverSection(null)}
      className="relative cursor-pointer rounded-full px-3.5 py-1.5 font-ui text-[10.5px] font-semibold uppercase tracking-[0.14em] transition-all duration-150"
      style={{
        color,
        backgroundColor: isActive
          ? `color-mix(in srgb, ${link.color} 12%, transparent)`
          : "transparent",
        boxShadow: isActive ? `0 0 12px ${link.color}15` : "none",
      }}>
      {link.label}
    </a>
  );
}

/**
 * Navigation UI for the portfolio timeline.
 *
 * Architectural note:
 * - Rendering stays in this file.
 * - Stateful behavior and business rules stay in feature model modules.
 * This keeps the component easier to reason about and easier to test.
 */
export function Navigation() {
  const { name } = PERSONAL;
  const [state, dispatch] = useReducer(
    navigationReducer,
    INITIAL_NAVIGATION_STATE,
  );
  const navRef = useRef<HTMLElement | null>(null);
  const mobileCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMobileSectionRef = useRef<SectionId | null>(null);
  const activeSectionRef = useRef<SectionId | "">("");
  const [mobileMenuLoaded, setMobileMenuLoaded] = useState(false);
  const { scrollToSection, scrollToTop } = useSectionScroll();
  const { isNavigating, targetSection, settledSection, startNavigation, clearSettled } = useNavStore();

  const activeSection = state.activeSection;

  // When navigating, lock to target. When just settled, lock to settled section
  // until scroll detection catches up.
  let currentActiveSection: SectionId | "" = activeSectionRef.current || activeSection;
  if (isNavigating && targetSection) {
    currentActiveSection = targetSection;
  } else if (settledSection) {
    currentActiveSection = settledSection;
    activeSectionRef.current = settledSection;
    // Clear after one render so scroll detection takes over
    queueMicrotask(() => clearSettled());
  }
  const hoveredLink = state.hoveredLink;
  const mobileOpen = state.mobileMenu.kind === "open";
  const visible = state.kind === "visible";

  useEffect(() => {
    if (mobileOpen) {
      setMobileMenuLoaded(true);
    }
  }, [mobileOpen]);

  useEffect(() => {
    const updateActiveSection = () => {
      if (useNavStore.getState().isNavigating) return;

      const sectionTopById = SECTION_IDS_ORDERED.reduce<
        Record<SectionId, number | null>
      >(
        (acc, id) => {
          const el = document.getElementById(id);
          acc[id] = el ? el.getBoundingClientRect().top : null;
          return acc;
        },
        {} as Record<SectionId, number | null>,
      );

      activeSectionRef.current = resolveActiveSection({
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        sectionTopById,
      });
    };

    const observer = new IntersectionObserver(
      () => {
        updateActiveSection();
      },
      {
        root: null,
        rootMargin: "-35% 0px -55% 0px",
        threshold: OBSERVER_THRESHOLDS,
      },
    );

    const observed = new Set<SectionId>();

    const observeSections = () => {
      for (const sectionId of SECTION_IDS_ORDERED) {
        if (observed.has(sectionId)) continue;

        const section = document.getElementById(sectionId);
        if (!section) continue;

        observer.observe(section);
        observed.add(sectionId);
      }

      updateActiveSection();
    };

    observeSections();

    // Timeline is lazy-loaded; observe section nodes when they mount later.
    const mutationObserver = new MutationObserver(observeSections);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!useNavStore.getState().isNavigating) {
        const sectionTopById = SECTION_IDS_ORDERED.reduce<
          Record<SectionId, number | null>
        >(
          (acc, id) => {
            const el = document.getElementById(id);
            acc[id] = el ? el.getBoundingClientRect().top : null;
            return acc;
          },
          {} as Record<SectionId, number | null>,
        );

        activeSectionRef.current = resolveActiveSection({
          scrollY: window.scrollY,
          viewportHeight: window.innerHeight,
          documentHeight: document.documentElement.scrollHeight,
          sectionTopById,
        });
      }

      dispatch({
        type: "SCROLLED",
        payload: {
          nowMs: Date.now(),
          isVisible:
            window.scrollY >
            window.innerHeight * NAVIGATION_TIMING.navVisibleViewportRatio,
          activeSection: activeSectionRef.current,
        },
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const raf = requestAnimationFrame(handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    let raf = 0;

    if (!mobileOpen && pendingMobileSectionRef.current) {
      const sectionId = pendingMobileSectionRef.current;
      pendingMobileSectionRef.current = null;

      // Wait one frame after menu close so mobile browsers apply restored scrolling.
      raf = requestAnimationFrame(() => {
        scrollToSection(sectionId, { updateHistory: true });
      });
    }

    return () => {
      document.body.style.overflow = "";
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [mobileOpen, scrollToSection]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const navElement = navRef.current;
      if (!navElement) return;

      const target = event.target;
      if (!(target instanceof Node)) return;

      if (!navElement.contains(target)) {
        dispatch({ type: "CLOSE_MOBILE_MENU" });
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const id = getSectionIdFromHash(window.location.hash);
    if (!id) return;

    activeSectionRef.current = id;
    dispatch({
      type: "SET_ACTIVE_SECTION",
      payload: { activeSection: id },
    });

    // Delay hash-scroll so GSAP ScrollTrigger pins and spacers are
    // initialized first — otherwise element positions are wrong.
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToSection(id, { updateHistory: false });
      });
    });
    return () => cancelAnimationFrame(timer);
  }, [scrollToSection]);

  useEffect(() => {
    const handlePop = () => {
      const id = getSectionIdFromHash(window.location.hash);
      if (!id) return;

      activeSectionRef.current = id;
      dispatch({
        type: "SET_ACTIVE_SECTION",
        payload: { activeSection: id },
      });
      scrollToSection(id, { updateHistory: false });
    };

    window.addEventListener(POP_STATE, handlePop);
    return () => {
      window.removeEventListener(POP_STATE, handlePop);
    };
  }, [scrollToSection]);

  useEffect(() => {
    return () => {
      if (mobileCloseTimerRef.current) {
        clearTimeout(mobileCloseTimerRef.current);
      }
    };
  }, []);

  const handleSectionClick = (sectionId: SectionId) => {
    activeSectionRef.current = sectionId;
    dispatch({
      type: "SET_ACTIVE_SECTION",
      payload: { activeSection: sectionId },
    });

    if (mobileOpen) {
      pendingMobileSectionRef.current = sectionId;
      startNavigation(sectionId);

      if (mobileCloseTimerRef.current) {
        clearTimeout(mobileCloseTimerRef.current);
      }

      mobileCloseTimerRef.current = setTimeout(() => {
        dispatch({ type: "CLOSE_MOBILE_MENU" });
      }, 200);
      return;
    }

    // scrollToSection handles startNavigation/endNavigation via store
    scrollToSection(sectionId, { updateHistory: true });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          ref={navRef}
          initial={{ y: -40, opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -30, opacity: 0, filter: "blur(6px)" }}
          transition={TRANSITION.slow}
          className="fixed top-0 left-0 right-0"
          style={{
            zIndex: nav,
            background: mobileOpen
              ? "rgba(7,7,10,1)"
              : "linear-gradient(to bottom, rgba(7,7,10,0.5) 0%, transparent 48px)",
          }}>
          {/* Mobile: taller fade to hide content scrolling under nav */}
          <div
            className="pointer-events-none absolute inset-0 bottom-auto lg:hidden"
            style={{
              height: 120,
              background: "linear-gradient(to bottom, rgba(7,7,10,1) 0%, rgba(7,7,10,0.85) 40%, transparent 100%)",
            }}
          />
          <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            {/* Name — outside the pill, standalone */}
            <button
              onClick={() => scrollToTop()}
              className="group cursor-pointer font-serif text-[21px] tracking-[-0.01em] transition-all duration-200 hover:opacity-70"
              style={{ color: "var(--cream)" }}>
              <span className="relative">
                {name}
                <span
                  className="absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: "var(--gold)", opacity: 0.4 }}
                />
              </span>
            </button>

            {/* ── Floating pill ── */}
            <div
              className="hidden items-center gap-0.5 rounded-full border border-white/[0.08] px-2 py-1 lg:flex"
              style={{
                backdropFilter: "blur(24px) saturate(1.8)",
                backgroundColor: "rgba(10, 10, 16, 0.65)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.05) inset, 0 0 60px rgba(201,168,76,0.03)",
              }}>
              {WHO_AM_I_NAV.map((link) => (
                <DesktopNavLink
                  key={link.sectionId}
                  link={link}
                  activeSection={currentActiveSection}
                  hoveredSection={hoveredLink}
                  idleColor={textDim}
                  onNavigate={handleSectionClick}
                  onHoverSection={(sectionId) =>
                    dispatch({
                      type: "SET_HOVERED_LINK",
                      payload: { sectionId },
                    })
                  }
                />
              ))}

              <span className="mx-1.5 h-3.5 w-px bg-white/[0.08]" />

              {ACT_NAV.map((link) => (
                <DesktopNavLink
                  key={link.sectionId}
                  link={link}
                  activeSection={currentActiveSection}
                  hoveredSection={hoveredLink}
                  idleColor={textDim}
                  onNavigate={handleSectionClick}
                  onHoverSection={(sectionId) =>
                    dispatch({
                      type: "SET_HOVERED_LINK",
                      payload: { sectionId },
                    })
                  }
                />
              ))}

              <span className="mx-1.5 h-3.5 w-px bg-white/[0.08]" />

              {SECTION_NAV.map((link) => (
                <DesktopNavLink
                  key={link.sectionId}
                  link={link}
                  activeSection={currentActiveSection}
                  hoveredSection={hoveredLink}
                  idleColor={textDim}
                  onNavigate={handleSectionClick}
                  onHoverSection={(sectionId) =>
                    dispatch({
                      type: "SET_HOVERED_LINK",
                      payload: { sectionId },
                    })
                  }
                />
              ))}

              {/* Dev-only lab link — remove before production */}
              <span className="mx-1.5 h-3.5 w-px bg-white/[0.08]" />
              <a
                href="/lab"
                className="px-2.5 py-1 text-[11px] font-sans tracking-wide rounded-full transition-colors duration-200 hover:text-[var(--gold)]"
                style={{ color: "var(--text-faint)" }}
              >
                Lab
              </a>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => dispatch({ type: "TOGGLE_MOBILE_MENU" })}
              className="cursor-pointer text-[var(--cream)] transition-colors hover:text-[var(--gold)] lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Mobile dropdown */}
          {mobileMenuLoaded ? (
            <NavigationMobileMenu
              mobileOpen={mobileOpen}
              activeSection={currentActiveSection}
              whoAmINav={WHO_AM_I_NAV}
              actNav={ACT_NAV}
              sectionNav={SECTION_NAV}
              onNavigate={handleSectionClick}
              onClose={() => dispatch({ type: "CLOSE_MOBILE_MENU" })}
            />
          ) : null}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
