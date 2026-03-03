"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { NAV_LINKS, ROLES, PERSONAL } from "@/data/site"
import { TRANSITION } from "@/components/motion"
import { TOKENS } from "@/lib/tokens"
import { Z_INDEX } from "@/lib/constants"
import {
  SECTION_IDS_ORDERED,
  SECTION_SCROLL_OFFSET,
  DEFAULT_SCROLL_OFFSET,
  type SectionId,
} from "@/lib/sections"

const ACT_NAV = ROLES.map((r) => ({
  label: r.label,
  href: `#${r.sectionId}`,
  color: r.color,
}))

export function Navigation() {
  const [visible, setVisible] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const suppressScrollRef = useRef(false)
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const findActive = (): SectionId | "" => {
      // If within navScrollOffset of the page bottom, always activate the last section
      const nearBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - DEFAULT_SCROLL_OFFSET
      if (nearBottom) return SECTION_IDS_ORDERED[SECTION_IDS_ORDERED.length - 1]

      const threshold = window.innerHeight * 0.4
      let current: SectionId | "" = ""
      for (const id of SECTION_IDS_ORDERED) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= threshold) current = id
      }
      return current
    }

    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.75)
      if (suppressScrollRef.current) return
      setActiveSection(findActive())
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    // Initialize from current scroll position — requestAnimationFrame lets the
    // browser finish its own scroll restoration before we read scrollY
    const raf = requestAnimationFrame(handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  // On mount: if the URL has a hash, scroll to that section and pre-set active state
  // so the nav is correct immediately (before the scroll event fires)
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const id = hash.slice(1) as SectionId
    if (!SECTION_IDS_ORDERED.includes(id)) return
    setActiveSection(id)
    const el = document.getElementById(id)
    if (!el) return
    const offset = SECTION_SCROLL_OFFSET[id] ?? DEFAULT_SCROLL_OFFSET
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: "instant" })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle browser back/forward — scroll to the section in the URL hash
  useEffect(() => {
    const handlePop = () => {
      const hash = window.location.hash
      if (!hash) return
      const id = hash.slice(1)
      const el = document.getElementById(id)
      if (!el) return
      setActiveSection(id)
      const top = el.getBoundingClientRect().top + window.scrollY - DEFAULT_SCROLL_OFFSET
      window.scrollTo({ top, behavior: "smooth" })
    }
    window.addEventListener("popstate", handlePop)
    return () => window.removeEventListener("popstate", handlePop)
  }, [])

  const scrollTo = (href: string) => {
    setMobileOpen(false)
    const id = href.replace("#", "")
    const el = document.getElementById(id)
    if (!el) return

    // Push to browser history so back button returns here
    history.pushState(null, "", href)

    // Set active immediately — suppress scroll-based detection until scroll settles
    setActiveSection(id)
    suppressScrollRef.current = true
    if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current)
    suppressTimerRef.current = setTimeout(() => {
      suppressScrollRef.current = false
    }, 1200)

    const offset = SECTION_SCROLL_OFFSET[id as SectionId] ?? DEFAULT_SCROLL_OFFSET
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: "smooth" })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={TRANSITION.base}
          className="fixed top-0 left-0 right-0 border-b border-[var(--stroke)]"
          style={{ zIndex: Z_INDEX.nav, backdropFilter: "blur(24px) saturate(1.8)", backgroundColor: TOKENS.bgNav }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <button
              onClick={() => {
                history.pushState(null, "", "/")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="cursor-pointer font-serif text-2xl italic text-[var(--gold)] transition-opacity hover:opacity-70"
            >
              {PERSONAL.initials}
            </button>

            {/* Desktop nav */}
            <div className="hidden items-center gap-8 md:flex">
              {ACT_NAV.map((link) => {
                const isActive = activeSection === link.href.slice(1)
                const isHovered = hoveredLink === link.href
                const color = (isActive || isHovered) ? link.color : TOKENS.textDim
                return (
                  <button
                    key={link.href}
                    onClick={() => scrollTo(link.href)}
                    onMouseEnter={() => setHoveredLink(link.href)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="relative cursor-pointer py-1 font-mono text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-200"
                    style={{ color }}
                  >
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
                )
              })}

              <span className="h-3 w-px bg-[var(--stroke)]" />

              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.slice(1)
                const isHovered = hoveredLink === link.href
                return (
                  <button
                    key={link.href}
                    onClick={() => scrollTo(link.href)}
                    onMouseEnter={() => setHoveredLink(link.href)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="relative cursor-pointer py-1 font-mono text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-200"
                    style={{ color: (isActive || isHovered) ? TOKENS.gold : TOKENS.textDim }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--gold)]"
                        transition={TRANSITION.fast}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="cursor-pointer text-[var(--text-dim)] transition-colors hover:text-[var(--gold)] md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
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
                className="overflow-hidden border-t border-[var(--stroke)] md:hidden"
              >
                <div className="flex flex-col gap-5 px-6 py-8">
                  {ACT_NAV.map((link, i) => (
                    <motion.button
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => scrollTo(link.href)}
                      className="cursor-pointer text-left font-mono text-sm font-light uppercase tracking-[0.15em] transition-colors"
                      style={{ color: activeSection === link.href.slice(1) ? link.color : TOKENS.creamMuted }}
                    >
                      {link.label}
                    </motion.button>
                  ))}
                  <div className="h-px bg-[var(--stroke)]" />
                  {NAV_LINKS.map((link, i) => (
                    <motion.button
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (ACT_NAV.length + i) * 0.05 }}
                      onClick={() => scrollTo(link.href)}
                      className="cursor-pointer text-left font-mono text-sm font-light uppercase tracking-[0.15em] text-[var(--cream-muted)] transition-colors hover:text-[var(--gold)]"
                    >
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
  )
}
