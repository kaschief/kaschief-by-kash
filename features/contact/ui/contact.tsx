"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FadeUp,
  FadeIn,
  ListRow,
  ListRowArrow,
  RevealLine,
} from "@components";
import { TOKENS, SECTION_ID } from "@utilities";
import { PERSONAL } from "@data";
import type { ContactLinkProps } from "./contact.types";

const { fontSerif } = TOKENS;
const { CONTACT } = SECTION_ID;

const CONTACT_LINKS = (
  email: string,
  linkedin: string,
  github: string,
  phone: string,
): ContactLinkProps[] => [
  { label: "Email", detail: email, href: `mailto:${email}` },
  {
    label: "LinkedIn",
    detail: linkedin.replace("https://", ""),
    href: linkedin,
    external: true,
  },
  {
    label: "GitHub",
    detail: github.replace("https://", ""),
    href: github,
    external: true,
  },
  { label: "Phone", detail: phone, href: `tel:${phone}` },
];

/* ------------------------------------------------------------------ */
/*  Section                                                             */
/* ------------------------------------------------------------------ */

export function Contact() {
  const { email, linkedin, github, phone } = PERSONAL;
  const links = CONTACT_LINKS(email, linkedin, github, phone);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const glowScale = useTransform(scrollYProgress, [0.2, 0.7], [0.7, 1.1]);
  const glowOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.4, 0.9],
    [0, 0.5, 0],
  );

  return (
    <section
      id={CONTACT}
      ref={sectionRef}
      className="relative overflow-hidden px-[var(--page-gutter)] py-12 sm:py-28">
      {/* Atmospheric glows */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: glowOpacity }}>
        <motion.div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 55%)",
            scale: glowScale,
          }}
        />
        <div
          className="absolute left-[25%] top-[35%] h-[350px] w-[350px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(91,158,194,0.025) 0%, transparent 55%)",
            animation: "glow-drift 20s linear infinite",
          }}
        />
        <div
          className="absolute right-[20%] bottom-[25%] h-[350px] w-[350px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(94,187,115,0.025) 0%, transparent 55%)",
            animation: "glow-drift 25s linear 5s infinite",
          }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <FadeIn>
          <p className="mb-5 font-ui text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--gold-dim)]">
            Next Act
          </p>
        </FadeIn>

        <RevealLine delay={0.15}>
          <h2
            className="mb-3 text-4xl text-[var(--cream)] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: fontSerif }}>
            Yours to write.
          </h2>
        </RevealLine>

        <FadeUp delay={0.4}>
          <p
            className="mx-auto mb-10 max-w-md text-sm text-[var(--text-dim)]"
            style={{ lineHeight: 1.8 }}>
            Open to engineering, leadership, and roles where range is a feature,
            not a footnote.
          </p>
        </FadeUp>

        {/* Contact links — built on ListRow, consistent with all list patterns */}
        <FadeUp delay={0.5}>
          <div className="border-t border-[var(--stroke)] text-left">
            {links.map((link) => (
              <ListRow
                key={link.label}
                color="var(--gold)"
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="flex items-start justify-between gap-3 sm:items-center sm:gap-4"
                animated={false}>
                {({ hovered }) => (
                  <>
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="mb-1 font-ui text-[9px] uppercase tracking-[0.22em] text-[var(--text-faint)] transition-colors group-hover:text-[var(--cream-muted)]">
                        {link.label}
                      </p>
                      <p className="text-sm leading-relaxed text-[var(--cream-muted)] transition-colors group-hover:text-[var(--cream)] break-all">
                        {link.detail}
                      </p>
                    </div>
                    <ListRowArrow
                      hovered={hovered}
                      color="var(--gold)"
                      className="hidden shrink-0 self-center text-sm sm:inline-flex"
                    />
                  </>
                )}
              </ListRow>
            ))}
          </div>
        </FadeUp>

        <FadeIn delay={0.7}>
          <div
            className="mx-auto mt-14 h-px w-14"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--gold), transparent)",
            }}
          />
        </FadeIn>
      </div>
    </section>
  );
}
