"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useInView, type Variants } from "framer-motion"
import { SECTION_ID } from "@utilities"
import { PERSONAL, CONTACT_COPY } from "@data"

const { CONTACT } = SECTION_ID

const { firstName, lastName, email, phone, linkedin, github } = PERSONAL
const { paragraphs: PARAGRAPHS, coda: CODA } = CONTACT_COPY

const CONTACT_ITEMS = [
  { key: "email", label: email, href: `mailto:${email}`, external: false },
  { key: "phone", label: phone, href: `tel:${phone}`, external: false },
  { key: "linkedin", label: "LinkedIn", href: linkedin, external: true },
  { key: "github", label: "GitHub", href: github, external: true },
]

/* ── Easing ── */
const SMOOTH = [0.22, 1, 0.36, 1] as unknown as number[]

/* ── Variants ── */
const nameV: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.5, ease: SMOOTH } },
}

const ruleVert: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 1.4, delay: 0.3, ease: SMOOTH } },
}

const ruleHoriz: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.4, delay: 0.3, ease: SMOOTH } },
}

const parasV: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.6, staggerChildren: 0.4 } },
}

const paraV: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.4, ease: SMOOTH } },
}

const contactsV: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 2.6, staggerChildren: 0.2 } },
}

const contactV: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1, ease: SMOOTH } },
}

/* ── Shared sub-components ── */

function CopyBlock({ className }: { className?: string }) {
  return (
    <motion.div className={`flex flex-col gap-[1em] ${className ?? ""}`} variants={parasV}>
      {PARAGRAPHS.map((p, i) => (
        <motion.p
          key={i}
          className="font-narrator text-[clamp(0.88rem,1.05vw,1.02rem)] leading-[1.85] font-light"
          style={{ color: "var(--cream)", opacity: 0.72 }}
          variants={paraV}>
          {p}
        </motion.p>
      ))}
      <motion.p
        className="font-narrator text-[clamp(0.78rem,0.88vw,0.88rem)] leading-[1.75] font-light italic"
        style={{ color: "var(--cream)", opacity: 0.38 }}
        variants={paraV}>
        {CODA}
      </motion.p>
    </motion.div>
  )
}

function ContactLinks({ className }: { className?: string }) {
  return (
    <motion.div className={`flex flex-col gap-3 ${className ?? ""}`} variants={contactsV}>
      {CONTACT_ITEMS.map((item, i) => (
        <motion.a
          key={item.key}
          href={item.href}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          className={`font-ui uppercase transition-colors duration-500 hover:text-[var(--gold)] ${
            i === 0 ? "text-[0.78rem] tracking-[0.26em]" : "text-[0.64rem] tracking-[0.16em]"
          }`}
          style={{
            color: i === 0 ? "var(--cream)" : "var(--text-dim)",
            opacity: i === 0 ? 0.8 : 1,
          }}
          variants={contactV}>
          {item.label}
        </motion.a>
      ))}
    </motion.div>
  )
}

/* ================================================================== */

/** If the page loaded with #contact, skip entrance animation entirely. */
const isHashTarget = typeof window !== "undefined" && window.location.hash === `#${CONTACT}`

export function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.1 })
  const animate = isHashTarget || inView ? "visible" : "hidden"

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const glowOpacity = useTransform(scrollYProgress, [0.1, 0.4, 0.9], [0, 0.45, 0])

  return (
    <section id={CONTACT} ref={sectionRef} className="relative h-screen overflow-hidden">
      {/* Atmospheric glow */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glowOpacity }}>
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 55%)",
          }}
        />
      </motion.div>

      {/* ═══ DESKTOP (>=1024px): Split layout ═══ */}
      <div
        className="hidden lg:flex relative z-10 h-full items-center justify-center"
        style={{ padding: "0 clamp(2rem, 6vw, 8rem)" }}>
        {/* Left: monumental name — shrink-proof, sizes by its own clamp() */}
        <motion.div
          variants={nameV}
          initial="hidden"
          animate={animate}
          className="flex shrink-0 items-center">
          <h2
            className="font-serif font-bold leading-[0.85] tracking-[-0.03em] select-none text-right"
            style={{
              color: "var(--cream)",
              fontSize: "clamp(4rem, 7.5vw, 14rem)",
            }}>
            {firstName}
            <br />
            <span className="block" style={{ color: "var(--cream)", opacity: 0.5 }}>
              {lastName}
            </span>
          </h2>
        </motion.div>

        {/* Vertical gold rule */}
        <div
          className="flex shrink-0 items-center justify-center self-stretch"
          style={{ padding: "0 clamp(1.5rem, 3vw, 4rem)" }}>
          <motion.div
            variants={ruleVert}
            initial="hidden"
            animate={animate}
            className="w-px origin-top"
            style={{ background: "var(--gold)", height: "45vh" }}
          />
        </div>

        {/* Right: copy + contact — capped width, takes remaining space */}
        <motion.div
          initial="hidden"
          animate={animate}
          className="flex max-w-[460px] flex-col justify-center gap-10">
          <CopyBlock />
          <ContactLinks />
        </motion.div>
      </div>

      {/* ═══ PHONE + TABLET (<1024px): Stacked, vertically centered ═══ */}
      <div className="flex lg:hidden relative z-10 h-full flex-col justify-center px-[var(--page-gutter)]">
        {/* Name */}
        <motion.div variants={nameV} initial="hidden" animate={animate}>
          <h2
            className="font-serif font-bold leading-[0.85] tracking-[-0.03em] select-none"
            style={{
              color: "var(--cream)",
              fontSize: "clamp(3rem, 14vw, 8rem)",
            }}>
            {firstName}
            <br />
            <span style={{ opacity: 0.5 }}>{lastName}</span>
          </h2>
        </motion.div>

        {/* Gold rule */}
        <motion.div
          variants={ruleHoriz}
          initial="hidden"
          animate={animate}
          className="h-px w-12 origin-left mt-7 mb-7"
          style={{ background: "var(--gold)" }}
        />

        {/* Content */}
        <motion.div initial="hidden" animate={animate} className="flex flex-col gap-8">
          <CopyBlock />
          <ContactLinks />
        </motion.div>
      </div>
    </section>
  )
}
