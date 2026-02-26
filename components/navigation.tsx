"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

const NAV_LINKS = [
  { label: "Journey", href: "#journey" },
  { label: "About", href: "#skills" },
  { label: "Contact", href: "#contact" },
]

export function Navigation() {
  const [visible, setVisible] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.75)
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
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-[100] border-b border-[#16161E]"
          style={{ backdropFilter: "blur(24px) saturate(1.8)", backgroundColor: "rgba(7,7,10,0.8)" }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-serif text-2xl italic text-[#C9A84C] transition-opacity hover:opacity-70"
            >
              KJ
            </button>

            <div className="hidden items-center gap-10 md:flex">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.slice(1)
                return (
                  <button
                    key={link.href}
                    onClick={() => scrollTo(link.href)}
                    className="relative py-1 font-mono text-[11px] font-medium uppercase tracking-[0.15em] transition-colors duration-300"
                    style={{ color: isActive ? "#C9A84C" : "#8A8478" }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#C9A84C]"
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
                className="overflow-hidden border-t border-[#16161E] md:hidden"
              >
                <div className="flex flex-col gap-5 px-6 py-8">
                  {NAV_LINKS.map((link, i) => (
                    <motion.button
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => scrollTo(link.href)}
                      className="text-left font-mono text-sm font-light uppercase tracking-[0.15em] text-[#B0A890] transition-colors hover:text-[#C9A84C]"
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
