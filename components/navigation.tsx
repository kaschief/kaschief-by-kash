"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { NAV_LINKS, ROLES, PERSONAL } from "@/data/site"
import { TRANSITION } from "@/components/motion"

const SECTION_IDS = ["act-nurse", "act-engineer", "act-leader", "act-builder", "philosophy", "capabilities", "contact"] as const

const ACT_NAV = ROLES.map((r) => ({
  label: r.label,
  href: `#act-${r.label.toLowerCase()}`,
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
    const findActive = () => {
      const threshold = window.innerHeight * 0.4
      let current = ""
      for (const id of SECTION_IDS) {
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
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  // Handle browser back/forward — scroll to the section in the URL hash
  useEffect(() => {
    const handlePop = () => {
      const hash = window.location.hash
      if (!hash) return
      const id = hash.slice(1)
      const el = document.getElementById(id)
      if (!el) return
      setActiveSection(id)
      const top = el.getBoundingClientRect().top + window.scrollY - 80
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

    const offset = id === "capabilities" ? 0 : 80
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
          className="fixed top-0 left-0 right-0 z-[100] border-b border-[var(--stroke)]"
          style={{ backdropFilter: "blur(24px) saturate(1.8)", backgroundColor: "rgba(7,7,10,0.8)" }}
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
                const color = (isActive || isHovered) ? link.color : "var(--text-dim)"
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
                    style={{ color: (isActive || isHovered) ? "var(--gold)" : "var(--text-dim)" }}
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
                      style={{ color: activeSection === link.href.slice(1) ? link.color : "var(--cream-muted)" }}
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
