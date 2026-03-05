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
import { useSectionScroll } from "@hooks";
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

const { bgNav, textDim } = TOKENS;
const { nav } = Z_INDEX;
const { POP_STATE } = HISTORY_EVENT;

const ACT_NAV = ROLE_NAV_LINKS;
const SECTION_NAV = SECTION_NAV_LINKS;
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
      className="relative cursor-pointer py-1 font-mono text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-200"
      style={{ color }}>
      {link.label}
      {isActive && (
        <motion.span
          layoutId="nav-dot"
          className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: link.color }}
          transition={TRANSITION.fast}
        />
      )}
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
  const { initials } = PERSONAL;
  const [state, dispatch] = useReducer(
    navigationReducer,
    INITIAL_NAVIGATION_STATE,
  );
  const navRef = useRef<HTMLElement | null>(null);
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSuppressedRef = useRef(false);
  const pendingMobileSectionRef = useRef<SectionId | null>(null);
  const activeSectionRef = useRef<SectionId | "">("");
  const [mobileMenuLoaded, setMobileMenuLoaded] = useState(false);
  const { scrollToSection, scrollToTop } = useSectionScroll();

  const activeSection = state.activeSection;
  const currentActiveSection = activeSectionRef.current || activeSection;
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
      if (isSuppressedRef.current) return;

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
      if (!isSuppressedRef.current) {
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
        scrollToSection(sectionId, { behavior: "smooth", updateHistory: true });
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
    scrollToSection(id, { behavior: "instant", updateHistory: false });
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
      scrollToSection(id, { behavior: "smooth", updateHistory: false });
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
      if (suppressTimerRef.current) {
        clearTimeout(suppressTimerRef.current);
      }
    };
  }, []);

  const handleSectionClick = (sectionId: SectionId) => {
    activeSectionRef.current = sectionId;
    dispatch({
      type: "SET_ACTIVE_SECTION",
      payload: { activeSection: sectionId },
    });

    const untilMs = Date.now() + NAVIGATION_TIMING.suppressScrollMs;
    dispatch({ type: "SUPPRESS_SCROLL", payload: { untilMs } });
    isSuppressedRef.current = true;

    if (suppressTimerRef.current) {
      clearTimeout(suppressTimerRef.current);
    }

    suppressTimerRef.current = setTimeout(() => {
      isSuppressedRef.current = false;
      dispatch({ type: "CLEAR_SUPPRESSION" });
    }, NAVIGATION_TIMING.suppressScrollMs);

    if (mobileOpen) {
      pendingMobileSectionRef.current = sectionId;

      if (mobileCloseTimerRef.current) {
        clearTimeout(mobileCloseTimerRef.current);
      }

      // Let the highlight update render before closing the menu.
      mobileCloseTimerRef.current = setTimeout(() => {
        dispatch({ type: "CLOSE_MOBILE_MENU" });
      }, 200);
      return;
    }

    scrollToSection(sectionId, { behavior: "smooth", updateHistory: true });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          ref={navRef}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={TRANSITION.base}
          className="fixed top-0 left-0 right-0 border-b border-[var(--stroke)]"
          style={{
            zIndex: nav,
            backdropFilter: "blur(24px) saturate(1.8)",
            backgroundColor: bgNav,
          }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <button
              onClick={() => scrollToTop()}
              className="cursor-pointer font-serif text-2xl italic text-[var(--gold)] transition-opacity hover:opacity-70">
              {initials}
            </button>

            <div className="hidden items-center gap-8 md:flex">
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

              <span className="h-3 w-px bg-[var(--stroke)]" />

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
            </div>

            <button
              onClick={() => dispatch({ type: "TOGGLE_MOBILE_MENU" })}
              className="cursor-pointer text-[var(--text-dim)] transition-colors hover:text-[var(--gold)] md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {mobileMenuLoaded ? (
            <NavigationMobileMenu
              mobileOpen={mobileOpen}
              activeSection={currentActiveSection}
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
