"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

const NAV_LINKS = [
  { label: "Journey", href: "#journey" },
  { label: "Trading System", href: "#trading" },
  { label: "Leadership", href: "#leadership" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
]

export function Navigation() {
  const [visible, setVisible] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: "-40% 0px -40% 0px" }
    )
    const sections = document.querySelectorAll("section[id]")
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const scrollTo = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed top-0 left-0 right-0 z-40 border-b border-[#1A1A22]"
          style={{ backdropFilter: "blur(20px)", backgroundColor: "rgba(11,11,15,0.85)" }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-serif text-2xl italic text-[#C9A84C] transition-opacity hover:opacity-80"
            >
              KJ
            </button>

            <div className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.slice(1)
                return (
                  <button
                    key={link.href}
                    onClick={() => scrollTo(link.href)}
                    className="relative py-1 font-sans text-sm font-light tracking-wide transition-colors"
                    style={{ color: isActive ? "#C9A84C" : "#8A8478" }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#C9A84C]"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-[#8A8478] transition-colors hover:text-[#C9A84C] md:hidden"
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
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-[#1A1A22] md:hidden"
              >
                <div className="flex flex-col gap-4 px-6 py-6">
                  {NAV_LINKS.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => scrollTo(link.href)}
                      className="text-left font-sans text-sm font-light tracking-wide text-[#B0A890] transition-colors hover:text-[#C9A84C]"
                    >
                      {link.label}
                    </button>
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
