"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import { ACT_II, COMPANIES, type Company, type ImpactMetric } from "@data";

import {
  EASE,
  GLOW_OPACITY,
  SCROLL_RANGE,
  SECTION_ID,
  Z_INDEX,
} from "@utilities";
import { NAVIGATION_SCROLL_EVENT } from "@hooks";

/* ── Constants ── */

const { ACT_ENGINEER } = SECTION_ID;
const { glow } = SCROLL_RANGE;
const { act, title, color: COLOR, lead, body } = ACT_II;

const SECTION_BG = "#06060A";
const SITE_BG = "#0A0A0F";
const PANEL_BORDER = "#1A1A24";
const PANEL_HEADER_BG = "#0E0E16";
const TERMINAL_BG = "#08080C";
const TERMINAL_TITLE_BG = "#111118";
const PROMOTED_COLOR = "#5EBB73";

const COMMIT_TYPE_COLORS: Record<string, string> = {
  feat: "#5B9EC2",
  fix: "#E05252",
  perf: "#5EBB73",
  refactor: "#C9A84C",
  test: "#9B8FCE",
  docs: "#4A4640",
  chore: "#8A8478",
  collab: "#7A8B6E",
};

const SCRAMBLE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* ── Helpers ── */

function getStatColor(stat: string): string {
  if (stat.startsWith("+") || stat.startsWith("\u2192")) return PROMOTED_COLOR;
  if (stat.startsWith("-")) return "#E05252";
  return COLOR;
}

function getBarFill(stat: string): string {
  if (stat.startsWith("+") || stat.startsWith("\u2192"))
    return "rgba(94,187,115,0.5)";
  if (stat.startsWith("-")) return "rgba(224,82,82,0.5)";
  return "rgba(91,158,194,0.5)";
}

/* ── ScrambleText ── */

function ScrambleText({
  text,
  active,
  staggerMs = 40,
  cyclesPerChar = 4,
  intervalMs = 50,
}: {
  text: string;
  active: boolean;
  staggerMs?: number;
  cyclesPerChar?: number;
  intervalMs?: number;
}) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!active) return;

    const resolved = new Array(text.length).fill(false);
    const cycles = new Array(text.length).fill(0);

    const interval = setInterval(() => {
      let allDone = true;
      const next = text.split("").map((char, i) => {
        if (char === " ") return " ";

        const startDelay = i * staggerMs;
        const elapsed = cycles[i] * intervalMs;

        if (elapsed < startDelay) {
          cycles[i]++;
          allDone = false;
          return SCRAMBLE_CHARS[
            Math.floor(Math.random() * SCRAMBLE_CHARS.length)
          ];
        }

        if (resolved[i]) return char;

        cycles[i]++;
        const scrambleCycles = cycles[i] - Math.floor(startDelay / intervalMs);

        if (scrambleCycles >= cyclesPerChar) {
          resolved[i] = true;
          return char;
        }

        allDone = false;
        return SCRAMBLE_CHARS[
          Math.floor(Math.random() * SCRAMBLE_CHARS.length)
        ];
      });

      setDisplay(next.join(""));
      if (allDone) clearInterval(interval);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [active, text, staggerMs, cyclesPerChar, intervalMs]);

  return <>{display}</>;
}

/* ── ImpactStats ── */

function ImpactStats({
  impact,
  hash,
}: {
  impact: readonly ImpactMetric[];
  hash: string;
}) {
  return (
    <div
      className="mb-7 overflow-hidden rounded-md border"
      style={{ borderColor: PANEL_BORDER }}
      aria-label="Impact metrics">
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5 font-mono text-xs text-[var(--text-faint)]"
        style={{ background: PANEL_HEADER_BG, borderColor: PANEL_BORDER }}>
        <span className="text-[var(--gold)]">{hash}</span>
        <span aria-hidden="true">{"\u00B7"}</span>
        <span>impact summary</span>
      </div>
      {impact.map((item, i) => (
        <div
          key={item.label}
          className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs"
          style={{
            borderBottom:
              i < impact.length - 1 ? "1px solid #111118" : "none",
          }}>
          <span
            className="w-14 shrink-0 text-right font-bold"
            style={{ color: getStatColor(item.stat) }}>
            {item.stat}
          </span>
          <span className="shrink-0 text-[var(--cream-muted)]">
            {item.label}
          </span>
          <div className="ml-auto flex gap-px" aria-hidden="true">
            {Array.from({ length: 8 }, (_, j) => (
              <div
                key={j}
                className="h-2.5 w-1.5 rounded-[1px]"
                style={{
                  backgroundColor:
                    j < Math.round(item.pct / 12.5)
                      ? getBarFill(item.stat)
                      : "rgba(255,255,255,0.04)",
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── ReadmeContent ── */

function ReadmeContent({ lines }: { lines: readonly string[] }) {
  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6">
      {lines.map((line, i) => {
        if (line === "") return <div key={i} className="h-3" />;
        if (line.startsWith("## "))
          return (
            <h2
              key={i}
              className="mb-3 border-b border-[var(--stroke)] pb-2 text-lg font-semibold text-[var(--cream)] md:text-xl"
              style={{ marginTop: i > 0 ? 8 : 0 }}>
              {line.replace("## ", "")}
            </h2>
          );
        if (line.startsWith("### "))
          return (
            <h3
              key={i}
              className="mb-2 mt-4 text-sm font-semibold text-[var(--cream)] md:text-base">
              {line.replace("### ", "")}
            </h3>
          );
        if (line.startsWith("**")) {
          const parts = line.split("**");
          return (
            <p
              key={i}
              className="mb-2 text-[12px] leading-[1.8] text-[var(--cream-muted)] sm:text-[13px]">
              <strong className="text-[var(--cream)]">{parts[1]}</strong>
              {parts[2]}
            </p>
          );
        }
        return (
          <p
            key={i}
            className="mb-2 text-[12px] leading-[1.8] text-[var(--cream-muted)] sm:text-[13px]">
            {line}
          </p>
        );
      })}
    </div>
  );
}

/* ── RepoPanel ── */

function RepoPanel({
  company,
  onClose,
}: {
  company: Company;
  onClose: () => void;
}) {
  const r = company.repo;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPaddingRight = document.body.style.paddingRight;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.documentElement.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.paddingRight = prevBodyPaddingRight;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      tabIndex={-1}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${company.company} — ${r.name} repository details`}
      className="fixed inset-0 cursor-default overflow-y-auto overscroll-contain outline-none"
      style={{
        zIndex: Z_INDEX.repoPanel,
        background: "rgba(4,4,8,0.92)",
        backdropFilter: "blur(12px)",
        WebkitOverflowScrolling: "touch",
      }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mx-auto cursor-auto px-6 pt-4 pb-20"
        style={{ maxWidth: 860 }}
        onClick={(e) => e.stopPropagation()}>

        {/* Top bar — sticky; pt absorbs space behind the nav so content scrolls under it */}
        <nav
          className="sticky top-0 z-10 mb-6 flex items-center justify-between pt-20 pb-4"
          style={{ borderBottom: `1px solid ${PANEL_BORDER}`, background: "rgba(4,4,8,0.98)", backdropFilter: "blur(8px)" }}
          aria-label="Repository navigation">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-[rgba(91,158,194,0.08)] active:scale-[0.97] focus-visible:outline-1 focus-visible:outline-[rgba(91,158,194,0.4)]"
            aria-label={`Back to career log from ${company.company}`}
            style={{ background: "none", border: "none" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill={COLOR}
              className="shrink-0"
              aria-hidden="true">
              <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5z" />
            </svg>
            <span className="truncate font-mono text-xs sm:text-sm">
              <span style={{ color: COLOR }}>{r.org}</span>
              <span className="text-[var(--text-faint)]"> / </span>
              <span className="font-bold text-[var(--cream)]">{r.name}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex shrink-0 min-h-11 cursor-pointer items-center whitespace-nowrap rounded-md border border-[#2A2A34] px-3.5 py-1.5 font-mono text-xs text-[var(--cream-muted)] transition-all hover:border-[var(--text-faint)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--cream)] active:scale-[0.97] focus-visible:outline-1 focus-visible:outline-[rgba(91,158,194,0.4)]"
            style={{ background: "none" }}>
            ✕ Close
          </button>
        </nav>

        {/* Meta bar */}
        <div
          className="mb-5 flex flex-wrap items-center gap-4 font-mono text-xs"
          aria-label="Repository metadata">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: r.languageColor }}
              aria-hidden="true"
            />
            <span className="text-[var(--cream-muted)]">{r.language}</span>
          </span>
          <span className="text-[var(--text-faint)]">
            <span aria-hidden="true">{"\u2605"} </span>
            {r.stars}
          </span>
          <span className="text-[var(--text-faint)]">
            <span aria-hidden="true">{"\u2387"} </span>
            {r.branch}
          </span>
        </div>

        {/* Description */}
        <p className="mb-7 max-w-[700px] text-[13px] leading-[1.7] text-[var(--cream-muted)] sm:text-sm">
          {r.description}
        </p>

        {/* Stack pills */}
        <div className="mb-8 flex flex-wrap gap-1.5">
          {r.stack.map((s) => (
            <span
              key={s}
              className="rounded-full border font-mono text-[10px]"
              style={{
                padding: "3px 10px",
                background: "rgba(91,158,194,0.08)",
                color: COLOR,
                borderColor: "rgba(91,158,194,0.15)",
              }}>
              {s}
            </span>
          ))}
        </div>

        {/* Impact stats */}
        <ImpactStats impact={r.impact} hash={company.hash} />

        {/* README */}
        <div
          className="overflow-hidden rounded-md border"
          style={{ borderColor: PANEL_BORDER }}>
          <div
            className="flex items-center gap-2 border-b px-4 py-2.5 font-mono text-xs text-[var(--cream-muted)]"
            style={{ background: PANEL_HEADER_BG, borderColor: PANEL_BORDER }}>
            {"\uD83D\uDCC4"} README.md
          </div>
          <ReadmeContent lines={r.readme} />
        </div>

        {/* External link */}
        <div className="mt-8 text-center">
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-md border px-6 py-2.5 font-mono text-xs no-underline transition-all hover:border-[rgba(91,158,194,0.4)] hover:bg-[rgba(91,158,194,0.08)] active:scale-[0.97] focus-visible:outline-1 focus-visible:outline-[rgba(91,158,194,0.4)]"
            style={{
              color: COLOR,
              borderColor: "rgba(91,158,194,0.2)",
            }}
            aria-label={`${r.url.replace("https://www.", "")} (opens in new tab)`}>
            {r.url.replace("https://www.", "")}{" "}
            <span aria-hidden="true">{"\u2197"}</span>
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── CommitEntry ── */

function CommitEntry({
  company,
  index,
  onSelect,
}: {
  company: Company;
  index: number;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const isLast = index === COMPANIES.length - 1;

  return (
    <motion.article
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`View ${company.company} — ${company.role}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: EASE }}
      className={`group relative ml-1.5 cursor-pointer pl-7 pr-4 py-5 outline-none transition-all duration-200 hover:bg-[rgba(91,158,194,0.03)] active:scale-[0.99] rounded-r-2xl focus-visible:rounded-r-2xl focus-visible:ring-1 focus-visible:ring-[rgba(91,158,194,0.4)] ${!isLast ? "border-l-2 border-[var(--stroke)]" : ""}`}
      onClick={onSelect}>
      {/* Branch dot */}
      <div
        className="absolute -left-[7px] top-[26px] h-3 w-3 rounded-full border-2 transition-shadow duration-300 group-hover:shadow-[0_0_8px_rgba(91,158,194,0.4)]"
        style={{
          borderColor: company.promoted ? PROMOTED_COLOR : COLOR,
          backgroundColor: company.promoted ? PROMOTED_COLOR : SECTION_BG,
        }}
      />

      {/* Hash */}
      <div className="mb-1 font-mono text-[11px] tracking-[0.05em] text-[var(--gold)]">
        {company.hash}
      </div>

      {/* Company */}
      <div className="flex items-center justify-between text-sm font-bold text-[var(--cream)] transition-colors duration-200 group-hover:text-[#5B9EC2] sm:text-base lg:text-lg">
        <span>{company.company}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="shrink-0 text-[var(--text-faint)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#5B9EC2]"
          aria-hidden="true">
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Role */}
      <div className="mt-0.5 font-mono text-xs transition-[filter] duration-200 group-hover:brightness-125" style={{ color: COLOR }}>
        {company.role}
      </div>

      {/* Location + period */}
      <div className="mt-1 font-mono text-[11px] text-[var(--text-faint)]">
        {company.location} · {company.period}
      </div>

      {/* Commit messages */}
      <ul className="mt-3 flex list-none flex-col gap-1.5" aria-label="Commits">
        {company.commits.map((commit, i) => (
          <li key={i} className="font-mono text-[10px] leading-[1.7] sm:text-[11px] md:text-[12px]">
            <span
              style={{ color: COMMIT_TYPE_COLORS[commit.type] || "#4A4640" }}>
              {commit.type}
            </span>
            <span className="text-[var(--text-faint)]">: </span>
            <span className="text-[var(--cream-muted)]">{commit.msg}</span>
          </li>
        ))}
      </ul>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
        {company.tags.map((tag) => (
          <span
            key={tag.text}
            className="rounded px-2 py-0.5 font-mono text-[10px]"
            style={{
              backgroundColor: `${tag.color}12`,
              color: tag.color,
            }}>
            {tag.text}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

/* ── ActIIGitLog (main export) ── */

export function ActIIGitLog() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const inView = useInView(sceneRef, { once: true, amount: 0.05 });
  const titleInView = useInView(titleRef, { once: true, amount: 0.5 });
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "end start"],
  });
  const glowOpacity = useTransform(scrollYProgress, glow, GLOW_OPACITY);

  const handleClose = useCallback(() => setSelectedCompany(null), []);

  // Close repo panel when user navigates via nav bar
  useEffect(() => {
    const close = () => setSelectedCompany(null);
    window.addEventListener(NAVIGATION_SCROLL_EVENT, close);
    return () => window.removeEventListener(NAVIGATION_SCROLL_EVENT, close);
  }, []);

  return (
    <div
      id={ACT_ENGINEER}
      ref={sceneRef}
      className="relative min-h-screen py-24 sm:py-32"
      style={{ backgroundColor: SECTION_BG }}>
      {/* Grid texture — mobile/tablet */}
      <div
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{
          backgroundImage: `
            linear-gradient(rgba(91,158,194,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91,158,194,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
      {/* Grid texture — desktop */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          backgroundImage: `
            linear-gradient(rgba(91,158,194,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91,158,194,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Grid fade mask */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, transparent 40%, ${SECTION_BG} 85%)`,
        }}
      />

      {/* Top fog */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background: `linear-gradient(to bottom, ${SITE_BG}, transparent)`,
        }}
      />

      {/* Bottom fog */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{
          background: `linear-gradient(to top, ${SITE_BG}, transparent)`,
        }}
      />

      {/* Blue atmospheric glows */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: glowOpacity }}>
        <div
          className="atmospheric-glow"
          style={{
            width: 1000,
            height: 1000,
            top: "25%",
            right: "10%",
            transform: "translate(0, -50%)",
            background:
              "radial-gradient(circle, rgba(91,158,194,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          className="atmospheric-glow"
          style={{
            width: 700,
            height: 700,
            bottom: "20%",
            left: "5%",
            background:
              "radial-gradient(circle, rgba(91,158,194,0.04) 0%, transparent 65%)",
          }}
        />
      </motion.div>

      {/* Scan line */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(91,158,194,0.08), transparent)`,
        }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-[900px] px-[var(--page-gutter)]">
        {/* Act header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE }}>
          <p
            className="mb-3 text-xs tracking-wide sm:mb-6 sm:text-sm md:text-base"
            style={{ color: COLOR }}>
            {act}
          </p>
          <h2
            ref={titleRef}
            className="font-sans text-4xl font-bold tracking-[-0.03em] text-[var(--cream)] sm:text-6xl md:text-8xl lg:text-[140px] lg:tracking-[-0.04em]">
            <ScrambleText
              text={title.toUpperCase().replace(/I/, "1")}
              active={titleInView}
              staggerMs={70}
              cyclesPerChar={6}
              intervalMs={70}
            />
          </h2>
          <p className="mx-auto mt-6 max-w-[500px] font-serif text-sm leading-relaxed text-[var(--cream-muted)] italic sm:text-base md:text-lg lg:text-xl">
            {lead}
          </p>
          <p className="mx-auto mt-5 max-w-[640px] text-xs leading-[1.7] text-[var(--text-dim)] sm:text-[13px] sm:mt-6 md:text-sm lg:text-base">
            {body}
          </p>
        </motion.div>

        {/* Terminal title bar */}
        <motion.div
          className="flex items-center gap-2 rounded-t-lg border border-b-0 border-[var(--stroke)] px-4 py-2.5"
          style={{ backgroundColor: TERMINAL_TITLE_BG }}
          initial={{ opacity: 0, y: -15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}>
          <span className="h-2.5 w-2.5 rounded-full bg-[#E05252]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#C9A84C]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#5EBB73]" />
          <span className="ml-3 font-mono text-[11px] text-[var(--text-faint)]">
            kaschief — ~/career — git log --oneline
          </span>
        </motion.div>

        {/* Terminal body */}
        <motion.div
          className="rounded-b-lg border border-[var(--stroke)] p-4 sm:p-5 md:p-6 lg:p-8"
          style={{ backgroundColor: TERMINAL_BG }}
          initial={{ opacity: 0, y: -10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}>
          {/* Prompt line */}
          <motion.div
            className="mb-8 font-mono text-[13px]"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}>
            <span style={{ color: COLOR }}>~/career</span>
            <span className="text-[var(--text-faint)]"> $ </span>
            <span className="text-[var(--cream)]">git log --graph --all</span>
            <span
              className="ml-1 inline-block h-4 w-2"
              style={{
                backgroundColor: COLOR,
                animation: "cursor-blink 1s step-end infinite",
              }}
            />
          </motion.div>

          {/* Commit entries */}
          {COMPANIES.map((company, i) => (
            <CommitEntry
              key={company.hash}
              company={company}
              index={i}
              onSelect={() => setSelectedCompany(company)}
            />
          ))}
        </motion.div>

        {/* Bottom separator */}
        <motion.div
          className="mx-auto mt-20 h-px max-w-lg"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          style={{
            background: `linear-gradient(90deg, transparent, rgba(91,158,194,0.2), transparent)`,
          }}
        />
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedCompany && (
              <RepoPanel company={selectedCompany} onClose={handleClose} />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
