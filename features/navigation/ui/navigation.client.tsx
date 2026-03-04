"use client";

import { useEffect, useReducer, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, PERSONAL, ROLES } from "@data";
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
import {
  INITIAL_NAVIGATION_STATE,
  NAVIGATION_TIMING,
  navigationReducer,
} from "../model/navigation-machine";

const { bgNav, creamMuted, gold, textDim } = TOKENS;
const { nav } = Z_INDEX;
const { POP_STATE } = HISTORY_EVENT;

const ACT_NAV = ROLES.map(({ color, label, sectionId }) => ({
  label,
  href: `#${sectionId}`,
  color,
}));

function getSectionTopById(): Record<SectionId, number | null> {
  return SECTION_IDS_ORDERED.reduce<Record<SectionId, number | null>>(
    (acc, sectionId) => {
      const section = document.getElementById(sectionId);
      acc[sectionId] = section ? section.getBoundingClientRect().top : null;
      return acc;
    },
    {} as Record<SectionId, number | null>,
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
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollToSection, scrollToTop } = useSectionScroll();

  const activeSection = state.activeSection;
  const hoveredLink = state.hoveredLink;
  const mobileOpen = state.mobileMenu.kind === "open";
  const visible = state.kind === "visible";

  useEffect(() => {
    const handleScroll = () => {
      const sectionTopById = getSectionTopById();
      const resolvedActive = resolveActiveSection({
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        sectionTopById,
      });

      dispatch({
        type: "SCROLLED",
        payload: {
          nowMs: Date.now(),
          isVisible:
            window.scrollY >
            window.innerHeight * NAVIGATION_TIMING.navVisibleViewportRatio,
          activeSection: resolvedActive,
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
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const id = hash.slice(1);
    if (!isSectionId(id)) return;

    dispatch({
      type: "SET_ACTIVE_SECTION",
      payload: { activeSection: id },
    });
    scrollToSection(id, { behavior: "instant", updateHistory: false });
  }, [scrollToSection]);

  useEffect(() => {
    const handlePop = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const id = hash.slice(1);
      if (!isSectionId(id)) return;

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
      if (suppressTimerRef.current) {
        clearTimeout(suppressTimerRef.current);
      }
    };
  }, []);

  const handleSectionClick = (href: string) => {
    const id = href.replace("#", "");
    if (!isSectionId(id)) return;

    dispatch({ type: "CLOSE_MOBILE_MENU" });
    dispatch({
      type: "SET_ACTIVE_SECTION",
      payload: { activeSection: id },
    });

    const untilMs = Date.now() + NAVIGATION_TIMING.suppressScrollMs;
    dispatch({ type: "SUPPRESS_SCROLL", payload: { untilMs } });

    if (suppressTimerRef.current) {
      clearTimeout(suppressTimerRef.current);
    }

    suppressTimerRef.current = setTimeout(() => {
      dispatch({ type: "CLEAR_SUPPRESSION" });
    }, NAVIGATION_TIMING.suppressScrollMs);

    // Ensure body overflow is cleared before scrolling (mobile menu sets it to "hidden")
    document.body.style.overflow = "";
    scrollToSection(id, { behavior: "smooth", updateHistory: true });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
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
              {ACT_NAV.map((link) => {
                const isActive = activeSection === link.href.slice(1);
                const isHovered = hoveredLink === link.href;
                const color = isActive || isHovered ? link.color : textDim;

                return (
                  <button
                    key={link.href}
                    onClick={() => handleSectionClick(link.href)}
                    onMouseEnter={() =>
                      dispatch({
                        type: "SET_HOVERED_LINK",
                        payload: { href: link.href },
                      })
                    }
                    onMouseLeave={() =>
                      dispatch({
                        type: "SET_HOVERED_LINK",
                        payload: { href: null },
                      })
                    }
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
                  </button>
                );
              })}

              <span className="h-3 w-px bg-[var(--stroke)]" />

              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.slice(1);
                const isHovered = hoveredLink === link.href;

                return (
                  <button
                    key={link.href}
                    onClick={() => handleSectionClick(link.href)}
                    onMouseEnter={() =>
                      dispatch({
                        type: "SET_HOVERED_LINK",
                        payload: { href: link.href },
                      })
                    }
                    onMouseLeave={() =>
                      dispatch({
                        type: "SET_HOVERED_LINK",
                        payload: { href: null },
                      })
                    }
                    className="relative cursor-pointer py-1 font-mono text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-200"
                    style={{ color: isActive || isHovered ? gold : textDim }}>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--gold)]"
                        transition={TRANSITION.fast}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => dispatch({ type: "TOGGLE_MOBILE_MENU" })}
              className="cursor-pointer text-[var(--text-dim)] transition-colors hover:text-[var(--gold)] md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: TRANSITION.fast.duration }}
                className="overflow-hidden border-t border-[var(--stroke)] md:hidden">
                <div className="flex flex-col gap-5 px-6 py-8">
                  {ACT_NAV.map((link, index) => (
                    <motion.button
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSectionClick(link.href)}
                      className="cursor-pointer text-left font-mono text-sm font-light uppercase tracking-[0.15em] transition-colors"
                      style={{
                        color:
                          activeSection === link.href.slice(1)
                            ? link.color
                            : creamMuted,
                      }}>
                      {link.label}
                    </motion.button>
                  ))}

                  <div className="h-px bg-[var(--stroke)]" />

                  {NAV_LINKS.map((link, index) => (
                    <motion.button
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (ACT_NAV.length + index) * 0.05 }}
                      onClick={() => handleSectionClick(link.href)}
                      className="cursor-pointer text-left font-mono text-sm font-light uppercase tracking-[0.15em] text-[var(--cream-muted)] transition-colors hover:text-[var(--gold)]">
                      {link.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
