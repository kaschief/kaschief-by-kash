"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type NavLink } from "@data";
import { TOKENS, TRANSITION, type SectionId } from "@utilities";
import { resolveNavLinkColor } from "../model/nav-link-state";

const { creamMuted } = TOKENS;

interface MobileNavLinkProps {
  link: NavLink;
  activeSection: SectionId | "";
  index: number;
  onNavigate: (sectionId: SectionId) => void;
}

function MobileNavLink({
  link,
  activeSection,
  index,
  onNavigate,
}: MobileNavLinkProps) {
  return (
    <motion.a
      href={`#${link.sectionId}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(link.sectionId);
      }}
      className="cursor-pointer text-left font-mono text-sm font-light uppercase tracking-[0.15em] transition-colors"
      style={{
        color: resolveNavLinkColor({
          activeSection,
          linkSection: link.sectionId,
          activeColor: link.color,
          idleColor: creamMuted,
        }),
      }}>
      {link.label}
    </motion.a>
  );
}

interface NavigationMobileMenuProps {
  mobileOpen: boolean;
  activeSection: SectionId | "";
  whoAmINav: readonly NavLink[];
  actNav: readonly NavLink[];
  sectionNav: readonly NavLink[];
  onNavigate: (sectionId: SectionId) => void;
  onClose: () => void;
}

export function NavigationMobileMenu({
  mobileOpen,
  activeSection,
  whoAmINav,
  actNav,
  sectionNav,
  onNavigate,
  onClose,
}: NavigationMobileMenuProps) {
  return (
    <AnimatePresence>
      {mobileOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: TRANSITION.fast.duration }}
            onClick={onClose}
            className="absolute inset-x-0 top-full z-0 h-[calc(100dvh-100%)] md:hidden"
            style={{
              backgroundColor: "color-mix(in srgb, var(--bg) 84%, transparent)",
              backdropFilter: "blur(10px) saturate(1.05)",
              WebkitBackdropFilter: "blur(10px) saturate(1.05)",
            }}
          />

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: TRANSITION.fast.duration }}
            className="relative z-10 overflow-hidden border-t border-[var(--stroke)] md:hidden"
            style={{
              backgroundColor: "rgba(7, 7, 10, 0.92)",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            }}>
            <div className="flex flex-col gap-5 px-6 py-8">
              {whoAmINav.map((link, index) => (
                <MobileNavLink
                  key={link.sectionId}
                  link={link}
                  activeSection={activeSection}
                  index={index}
                  onNavigate={onNavigate}
                />
              ))}

              <div className="h-px bg-[var(--stroke)]" />

              {actNav.map((link, index) => (
                <MobileNavLink
                  key={link.sectionId}
                  link={link}
                  activeSection={activeSection}
                  index={whoAmINav.length + index}
                  onNavigate={onNavigate}
                />
              ))}

              <div className="h-px bg-[var(--stroke)]" />

              {sectionNav.map((link, index) => (
                <MobileNavLink
                  key={link.sectionId}
                  link={link}
                  activeSection={activeSection}
                  index={whoAmINav.length + actNav.length + index}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
