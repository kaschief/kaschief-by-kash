"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import {
  PERSONAL,
  ROLE_NAV_LINKS,
  SECTION_NAV_LINKS,
  type NavLink,
} from "@data";
import { useNavStore, useLenis, useSectionScroll } from "@hooks";
import {
  DEFAULT_SCROLL_OFFSET,
  SECTION_ID,
  SECTION_IDS_ORDERED,
  SECTION_SCROLL_OFFSET,
  TOKENS,
  TRANSITION,
  type SectionId,
  Z_INDEX,
} from "@utilities";
import { isSectionId } from "../model/active-section";
import { resolveNavLinkColor } from "../model/nav-link-state";
import { NAVIGATION_TIMING } from "../model/navigation-machine";

const { textDim } = TOKENS;
const { nav } = Z_INDEX;
const { PORTRAIT } = SECTION_ID;

const WHO_AM_I_NAV = SECTION_NAV_LINKS.filter((l) => l.sectionId === "portrait");
const ACT_NAV = ROLE_NAV_LINKS;
const SECTION_NAV = SECTION_NAV_LINKS.filter((l) => l.sectionId !== "portrait");
const IO_THRESHOLDS = [0, 0.1, 0.25, 0.5];

/** Safety timeout for hash-scroll if target never stabilizes (ms). */
const HASH_SCROLL_SAFETY_MS = 5000;
/** Land slightly past sticky section boundaries so the act is pinned. */
const HASH_SCROLL_STICKY_OVERSHOOT_PX = 2;
/** Consider the hash target stable once it stops drifting for a few frames. */
const HASH_SCROLL_STABLE_EPSILON_PX = 4;
const HASH_SCROLL_STABLE_FRAMES = 3;
const HASH_SCROLL_MIN_SETTLE_MS = 1500;

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

/** Stable layout top independent of transform/sticky shifts. */
function getAbsoluteTop(el: HTMLElement): number {
  let top = 0;
  let current: HTMLElement | null = el;
  while (current) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
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
 * Navigation — rebuilt with simpler internals.
 *
 * Active section: single IntersectionObserver (no getBoundingClientRect per frame).
 * Visibility: one passive scroll listener with threshold check.
 * State: plain useState hooks (no reducer, no suppression).
 * Hash scroll: MutationObserver waits for target, scrolls once, reveals.
 */
export function Navigation() {
  const { name } = PERSONAL;

  // --- State (plain hooks, no reducer) ---
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | "">("");
  const [hoveredLink, setHoveredLink] = useState<SectionId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuLoaded, setMobileMenuLoaded] = useState(false);

  const navRef = useRef<HTMLElement | null>(null);
  const pendingMobileSectionRef = useRef<SectionId | null>(null);

  const getLenis = useLenis();
  const { scrollToSection, scrollToTop } = useSectionScroll();
  const { isNavigating, targetSection, settledSection, clearSettled } = useNavStore();

  // --- Derived active section ---
  // Priority: navigating target > settled section > IO-detected section
  let displayedSection: SectionId | "" = activeSection;
  if (isNavigating && targetSection) {
    displayedSection = targetSection;
  } else if (settledSection) {
    displayedSection = settledSection;
    // Sync to local state so IO detection picks up from here
    queueMicrotask(() => {
      setActiveSection(settledSection);
      clearSettled();
    });
  }

  // Eager-load mobile menu component once opened
  useEffect(() => {
    if (mobileOpen) setMobileMenuLoaded(true);
  }, [mobileOpen]);

  // --- IO-based active section detection ---
  useEffect(() => {
    const ratioMap = new Map<SectionId, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        if (useNavStore.getState().isNavigating) return;

        for (const entry of entries) {
          const id = entry.target.id;
          if (!isSectionId(id)) continue;

          if (entry.intersectionRatio > 0) {
            ratioMap.set(id, entry.intersectionRatio);
          } else {
            ratioMap.delete(id);
          }
        }

        // Pick highest-ratio section
        let best: SectionId | "" = "";
        let bestRatio = 0;
        for (const [id, ratio] of ratioMap) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }

        // Bottom-of-page snap: always activate last section near end
        const nearBottom =
          window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 80;
        if (nearBottom) {
          best = SECTION_IDS_ORDERED[SECTION_IDS_ORDERED.length - 1];
        }

        setActiveSection(best);
      },
      {
        root: null,
        rootMargin: "-35% 0px -55% 0px",
        threshold: IO_THRESHOLDS,
      },
    );

    // Observe all section elements; re-run when lazy content mounts
    const observed = new Set<SectionId>();

    const observeSections = () => {
      for (const sectionId of SECTION_IDS_ORDERED) {
        if (observed.has(sectionId)) continue;
        const section = document.getElementById(sectionId);
        if (!section) continue;
        observer.observe(section);
        observed.add(sectionId);
      }
    };

    observeSections();

    // Timeline is lazy-loaded; watch for new section nodes
    const mutationObserver = new MutationObserver(observeSections);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  // --- Nav visibility (scroll threshold) ---
  useEffect(() => {
    const onScroll = () => {
      setVisible(
        window.scrollY > window.innerHeight * NAVIGATION_TIMING.navVisibleViewportRatio,
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Hash scroll ---
  // Re-aligns to the target every frame until the target stops drifting,
  // then reveals. A one-shot scroll is not enough here: between the
  // initial scrollTo and the reveal, several layout shifts can happen —
  // the Portrait pin spacer being created in its useEffect, GSAP
  // ScrollTrigger.refresh() running from LenisProvider's RAF, font swaps,
  // and lazy Timeline children mounting. Any of those shift the absolute
  // top of the target after a one-shot scroll, leaving the user landed
  // at a position that is now inside the previous section.
  useEffect(() => {
    const hashId = getSectionIdFromHash(window.location.hash);
    if (!hashId) return;

    setActiveSection(hashId);

    const root = document.documentElement;
    let raf = 0;
    let stableFrames = 0;
    let lastTarget: number | null = null;
    let lastTargetShiftAt = performance.now();
    const deadline = performance.now() + HASH_SCROLL_SAFETY_MS;

    function reveal() {
      root.style.removeProperty("visibility");
    }

    function alignToHashTarget() {
      const el = document.getElementById(hashId!);
      if (!el) {
        if (performance.now() >= deadline) {
          console.warn(`[nav] hash-scroll: #${hashId} not found before timeout`);
          reveal();
          return;
        }
        raf = requestAnimationFrame(alignToHashTarget);
        return;
      }

      const offset = SECTION_SCROLL_OFFSET[hashId!] ?? DEFAULT_SCROLL_OFFSET;
      const stickyOvershoot = offset === 0 ? HASH_SCROLL_STICKY_OVERSHOOT_PX : 0;
      const target = getAbsoluteTop(el) - offset + stickyOvershoot;

      // Force an immediate correction every frame until layout settles.
      const lenis = getLenis();
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(target, { immediate: true, force: true });
      } else {
        window.scrollTo({ top: target, behavior: "instant" as ScrollBehavior });
      }

      const scrollDelta = Math.abs(window.scrollY - target);
      const targetDelta =
        lastTarget === null ? Number.POSITIVE_INFINITY : Math.abs(target - lastTarget);
      if (targetDelta > HASH_SCROLL_STABLE_EPSILON_PX) {
        lastTargetShiftAt = performance.now();
      }
      stableFrames =
        scrollDelta <= HASH_SCROLL_STABLE_EPSILON_PX &&
        targetDelta <= HASH_SCROLL_STABLE_EPSILON_PX
          ? stableFrames + 1
          : 0;
      lastTarget = target;

      if (
        stableFrames >= HASH_SCROLL_STABLE_FRAMES &&
        performance.now() - lastTargetShiftAt >= HASH_SCROLL_MIN_SETTLE_MS
      ) {
        requestAnimationFrame(() => reveal());
        return;
      }

      if (performance.now() >= deadline) {
        console.warn(
          `[nav] hash-scroll: target did not stabilize within ${HASH_SCROLL_SAFETY_MS}ms`,
        );
        reveal();
        return;
      }

      raf = requestAnimationFrame(alignToHashTarget);
    }

    raf = requestAnimationFrame(alignToHashTarget);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      root.style.removeProperty("visibility");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only: hash scroll runs once on page load
  }, []);

  // --- Mobile menu overflow + scroll recovery ---
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    let raf1 = 0;
    let raf2 = 0;

    if (!mobileOpen && pendingMobileSectionRef.current) {
      const sectionId = pendingMobileSectionRef.current;
      pendingMobileSectionRef.current = null;

      // 2-frame delay: iOS Safari needs layout recalc after overflow change
      raf1 = requestAnimationFrame(() => {
        const lenis = getLenis();
        if (lenis) {
          lenis.resize();
          if (lenis.isStopped) lenis.start();
        }

        raf2 = requestAnimationFrame(() => {
          if (sectionId === PORTRAIT) {
            scrollToTop({ updateHistory: true });
          } else {
            scrollToSection(sectionId, { updateHistory: true });
          }
        });
      });
    }

    return () => {
      document.body.style.overflow = "";
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [mobileOpen, getLenis, scrollToSection, scrollToTop]);

  // --- Outside-click to close mobile menu ---
  useEffect(() => {
    if (!mobileOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const navElement = navRef.current;
      if (!navElement) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!navElement.contains(target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mobileOpen]);

  // --- Popstate for browser back/forward ---
  useEffect(() => {
    const handlePop = () => {
      const id = getSectionIdFromHash(window.location.hash);
      if (!id) return;
      setActiveSection(id);
      scrollToSection(id, { updateHistory: false });
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [scrollToSection]);

  // --- Handlers ---
  const handleSectionClick = useCallback(
    (sectionId: SectionId) => {
      setActiveSection(sectionId);

      if (mobileOpen) {
        pendingMobileSectionRef.current = sectionId;
        setMobileOpen(false);
        return;
      }

      scrollToSection(sectionId, { updateHistory: true });
    },
    [mobileOpen, scrollToSection],
  );

  // --- Render (identical visual design) ---
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
                  activeSection={displayedSection}
                  hoveredSection={hoveredLink}
                  idleColor={textDim}
                  onNavigate={handleSectionClick}
                  onHoverSection={setHoveredLink}
                />
              ))}

              <span className="mx-1.5 h-3.5 w-px bg-white/[0.08]" />

              {ACT_NAV.map((link) => (
                <DesktopNavLink
                  key={link.sectionId}
                  link={link}
                  activeSection={displayedSection}
                  hoveredSection={hoveredLink}
                  idleColor={textDim}
                  onNavigate={handleSectionClick}
                  onHoverSection={setHoveredLink}
                />
              ))}

              <span className="mx-1.5 h-3.5 w-px bg-white/[0.08]" />

              {SECTION_NAV.map((link) => (
                <DesktopNavLink
                  key={link.sectionId}
                  link={link}
                  activeSection={displayedSection}
                  hoveredSection={hoveredLink}
                  idleColor={textDim}
                  onNavigate={handleSectionClick}
                  onHoverSection={setHoveredLink}
                />
              ))}

              {/*
                Dev/preview-only Lab entry point.
                Gated by NEXT_PUBLIC_ENABLE_LAB so it's dead-code-eliminated
                from production builds — the divider AND the link are tree-
                shaken when the env var is not "true" at build time.
              */}
              {process.env.NEXT_PUBLIC_ENABLE_LAB === "true" && (
                <>
                  <span className="mx-1.5 h-3.5 w-px bg-white/[0.08]" />
                  <a
                    href="/lab"
                    className="px-2.5 py-1 text-[11px] font-sans tracking-wide rounded-full transition-colors duration-200 hover:text-[var(--gold)]"
                    style={{ color: "var(--text-faint)" }}
                  >
                    Lab
                  </a>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="cursor-pointer text-[var(--cream)] transition-colors hover:text-[var(--gold)] lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Mobile dropdown */}
          {mobileMenuLoaded ? (
            <NavigationMobileMenu
              mobileOpen={mobileOpen}
              activeSection={displayedSection}
              whoAmINav={WHO_AM_I_NAV}
              actNav={ACT_NAV}
              sectionNav={SECTION_NAV}
              onNavigate={handleSectionClick}
              onClose={() => setMobileOpen(false)}
            />
          ) : null}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
