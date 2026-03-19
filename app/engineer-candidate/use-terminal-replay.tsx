"use client";

/* ==================================================================
   useTerminalReplay — terminal typing replay + narrative + mobile
   carousel + dot indicator.

   Extracted from page.tsx MOVEMENT 2. Owns all terminal-specific
   refs, exposes update(p, lg) + jsx.
   ================================================================== */

import { useRef, type RefObject } from "react";
import { ss, lerp, remap } from "./math";
import { COMPANY_COLORS, COMPANY_ROLES, CONTENT } from "./engineer-data";
import {
  TERMINAL,
  TERMINAL_NARRATOR,
  PH,
} from "./engineer-candidate.types";
import {
  TERMINAL_COLORS,
  TERM_COMPANIES,
  TERMINAL_FONT,
  ALL_COMPANY_LINES,
  CHAR_COUNTS,
  TERM_NARRATIVES,
  escapeHtml,
} from "./terminal-data";

/* ------------------------------------------------------------------ */
/*  Options                                                            */
/* ------------------------------------------------------------------ */

interface TerminalReplayOptions {
  /** Scroll container — needed for dot-click scroll-to */
  forgeContainerRef: RefObject<HTMLDivElement | null>;
  /** Beat glow overlay — reset to opacity 0 */
  beatGlowEl: RefObject<HTMLDivElement | null>;
  /** Vignette overlay — reset to opacity 0 */
  vignetteEl: RefObject<HTMLDivElement | null>;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useTerminalReplay({
  forgeContainerRef,
  beatGlowEl,
  vignetteEl,
}: TerminalReplayOptions) {
  /* ---- Refs ---- */
  const terminalRef = useRef<HTMLDivElement>(null);
  const termContentRef = useRef<HTMLPreElement>(null);
  const termWipeRef = useRef<HTMLDivElement>(null);
  const termNarrativeRef = useRef<HTMLDivElement>(null);
  const termLastStateRef = useRef({ company: -1, chars: -1 });
  const termProgressRefs = useRef<(HTMLDivElement | null)[]>([]);
  const termProgressWrapRef = useRef<HTMLDivElement>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const mobileCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ================================================================ */
  /*  update(p, lg) — called once per scroll frame                     */
  /* ================================================================ */

  function update(p: number, lg: boolean) {
    const termEl = terminalRef.current;
    const termContent = termContentRef.current;
    const termWipe = termWipeRef.current;

    // Terminal + mobile carousel timing (shared scroll phase)
    const termStart = PH.BEATS[0].start;
    const termEnd = PH.BEATS[3].end;
    const termIn = ss(termStart, termStart + TERMINAL.fadeDur, p);
    const termOut = 1 - ss(termEnd - TERMINAL.fadeDur, termEnd, p);

    // Fade desktop terminal
    if (termEl) termEl.style.opacity = String(termIn * termOut);
    if (termProgressWrapRef.current) {
      termProgressWrapRef.current.style.opacity = String(termIn * termOut);
    }
    // Fade mobile carousel wrapper
    if (!lg && mobileCarouselRef.current) {
      mobileCarouselRef.current.style.opacity = String(termIn * termOut);
    }

    if (termIn > 0 && termOut > 0) {
      // Determine which company
      const totalDur = termEnd - termStart;
      const localP = Math.max(0, Math.min(1, (p - termStart) / totalDur));
      const companyIdx = Math.min(
        Math.floor(localP * TERMINAL.companyCount),
        TERMINAL.companyCount - 1,
      );
      const companyProgress =
        (localP - companyIdx / TERMINAL.companyCount) * TERMINAL.companyCount;

      // Mobile: show/hide stacked cards based on scroll progress
      if (!lg) {
        for (let ci = 0; ci < TERMINAL.companyCount; ci++) {
          const card = mobileCardRefs.current[ci];
          if (card) card.style.opacity = ci === companyIdx ? "1" : "0";
        }
        // Update dot indicators
        const CC4 = COMPANY_COLORS;
        termProgressRefs.current.forEach((dot, i) => {
          if (!dot) return;
          dot.style.width =
            i === companyIdx
              ? TERMINAL.dotActiveWidth
              : TERMINAL.dotInactiveWidth;
          dot.style.opacity =
            i === companyIdx ? "1" : String(TERMINAL.dotInactiveOpacity);
          dot.style.background =
            i === companyIdx ? CC4[companyIdx] : "var(--text-dim)";
        });
      }

      if (termEl && termContent && termWipe) {
        // Phase boundaries — terminal types in first half, narrative reveals in second
        const P1_END = TERMINAL.typingP1,
          P2_END = TERMINAL.typingP2,
          P3_END = TERMINAL.typingP3;
        const NAR_START = TERMINAL.narStart,
          NAR_END = TERMINAL.narEnd;

        // Wipe — only at very end, AFTER narrative finishes
        const wipeProgress = ss(
          TERMINAL.wipeStart,
          TERMINAL.wipeEnd,
          companyProgress,
        );
        termWipe.style.opacity =
          wipeProgress > 0 && wipeProgress < 1 ? "1" : "0";
        termWipe.style.transform = `translateY(${(1 - wipeProgress) * 100}%)`;

        if (wipeProgress >= TERMINAL.wipeComplete) {
          if (termLastStateRef.current.chars !== -2) {
            termContent.innerHTML = "";
            termLastStateRef.current = { company: companyIdx, chars: -2 };
          }
        } else {
          const lines = ALL_COMPANY_LINES[companyIdx];
          const cc = CHAR_COUNTS[companyIdx];

          // How many chars to reveal
          let charsToShow = 0;
          if (companyProgress <= P1_END) {
            charsToShow = Math.floor(
              remap(companyProgress, 0, P1_END, 0, cc.p1),
            );
          } else if (companyProgress <= P2_END) {
            charsToShow =
              cc.p1 +
              Math.floor(remap(companyProgress, P1_END, P2_END, 0, cc.p2));
          } else if (companyProgress <= P3_END) {
            charsToShow =
              cc.p1 +
              cc.p2 +
              Math.floor(remap(companyProgress, P2_END, P3_END, 0, cc.p3));
          } else {
            charsToShow = cc.total;
          }

          // Build HTML
          let html = "";
          let charsSoFar = 0;
          let lineNum = 1;
          let cursorPlaced = false;

          for (const line of lines) {
            const lineLen = line.text.length + 1;
            if (charsSoFar >= charsToShow) break;

            const visibleChars = Math.min(
              line.text.length,
              charsToShow - charsSoFar,
            );
            const visibleText = escapeHtml(line.text.slice(0, visibleChars));
            const isPartial = visibleChars < line.text.length;

            const numStr = `<span style="color:${TERMINAL_COLORS.lineNumber};user-select:none;display:inline-block;width:3ch;text-align:right;margin-right:1.5ch;">${lineNum}</span>`;

            let foreground: string = TERMINAL_COLORS.text;
            let background: string = "transparent";
            let italic = false;
            switch (line.style) {
              case "keyword":
                foreground = TERMINAL_COLORS.keyword;
                break;
              case "add":
                foreground = TERMINAL_COLORS.addedForeground;
                background = TERMINAL_COLORS.addedBackground;
                break;
              case "remove":
                foreground = TERMINAL_COLORS.removedForeground;
                background = TERMINAL_COLORS.removedBackground;
                break;
              case "comment":
                foreground = TERMINAL_COLORS.comment;
                italic = true;
                break;
              case "promotion":
                foreground = TERMINAL.promotionFg;
                background = TERMINAL.promotionBg;
                break;
              case "string":
                foreground = TERMINAL_COLORS.string;
                break;
            }

            const cursor =
              isPartial && !cursorPlaced
                ? `<span style="color:${TERMINAL_COLORS.text};animation:blink 1s step-end infinite;">█</span>`
                : "";
            if (isPartial) cursorPlaced = true;

            html += `<div style="background:${background};min-height:1.5em;line-height:1.5;padding:0 1ch;">${numStr}<span style="color:${foreground};${italic ? "font-style:italic;" : ""}">${visibleText}</span>${cursor}</div>`;

            charsSoFar += lineLen;
            lineNum++;
          }

          // Only update DOM when content actually changed (preserves cursor blink animation)
          if (
            termLastStateRef.current.company !== companyIdx ||
            termLastStateRef.current.chars !== charsToShow
          ) {
            termContent.innerHTML = html;
            termLastStateRef.current = {
              company: companyIdx,
              chars: charsToShow,
            };
          }
        }

        // V15-style narrative reveal — starts AFTER terminal finishes
        const narEl = termNarrativeRef.current;
        if (narEl) {
          const nar = TERM_NARRATIVES[companyIdx];
          // Map NAR_START..NAR_END to 0..1
          const narP = Math.max(
            0,
            Math.min(
              1,
              (companyProgress - NAR_START) / (NAR_END - NAR_START),
            ),
          );
          const sceneReveal = ss(0, TERMINAL_NARRATOR.sceneEnd, narP);
          const actionFade = ss(
            TERMINAL_NARRATOR.actionStart,
            TERMINAL_NARRATOR.actionEnd,
            narP,
          );
          const shiftFade = ss(
            TERMINAL_NARRATOR.shiftStart,
            TERMINAL_NARRATOR.shiftEnd,
            narP,
          );
          const fadeOut =
            companyProgress > TERMINAL_NARRATOR.fadeoutStart
              ? ss(
                  TERMINAL_NARRATOR.fadeoutStart,
                  TERMINAL_NARRATOR.fadeoutEnd,
                  companyProgress,
                )
              : 0;
          narEl.style.opacity = String(1 - fadeOut);

          const nameEl =
            narEl.querySelector<HTMLElement>("[data-role=name]");
          const sceneEl =
            narEl.querySelector<HTMLElement>("[data-role=scene]");
          const actionEl =
            narEl.querySelector<HTMLElement>("[data-role=action]");
          const shiftEl =
            narEl.querySelector<HTMLElement>("[data-role=shift]");

          if (nameEl) {
            nameEl.textContent =
              TERM_COMPANIES[companyIdx].company +
              " · " +
              TERM_COMPANIES[companyIdx].location;
            nameEl.style.color = COMPANY_COLORS[companyIdx];
            nameEl.style.opacity = String(
              ss(0, TERMINAL_NARRATOR.headerFadeEnd, narP),
            );
          }
          if (sceneEl && nar) {
            sceneEl.textContent = nar.scene;
            const clipRight = 100 - sceneReveal * 100;
            sceneEl.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
          }
          if (actionEl && nar) {
            actionEl.textContent = nar.action;
            actionEl.style.opacity = String(actionFade);
            actionEl.style.transform = `translateY(${lerp(TERMINAL_NARRATOR.slideY, 0, actionFade)}px)`;
          }
          if (shiftEl && nar) {
            shiftEl.textContent = nar.shift;
            shiftEl.style.opacity = String(shiftFade);
            shiftEl.style.transform = `translateY(${lerp(TERMINAL_NARRATOR.slideY, 0, shiftFade)}px)`;
          }
        }

        // Dot indicator — active dot is pill, others are circles
        const DOT_COLORS = COMPANY_COLORS;
        for (let pi = 0; pi < TERMINAL.companyCount; pi++) {
          const dot = termProgressRefs.current[pi];
          if (!dot) continue;
          const isActive = pi === companyIdx;
          dot.style.width = isActive
            ? TERMINAL.dotActiveWidth
            : TERMINAL.dotInactiveWidth;
          dot.style.opacity = isActive
            ? "1"
            : String(TERMINAL.dotInactiveOpacity);
          dot.style.background = isActive
            ? DOT_COLORS[pi]
            : "var(--text-dim)";
        }
      }
    }

    // Beat glow + vignette disabled — clean dark background only
    if (beatGlowEl.current) beatGlowEl.current.style.opacity = "0";
    if (vignetteEl.current) vignetteEl.current.style.opacity = "0";
  }

  /* ================================================================ */
  /*  JSX                                                              */
  /* ================================================================ */

  const jsx = (
    <>
      {/* Terminal + Narrative (replaces beats) */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      <div
        ref={terminalRef}
        className="absolute inset-0"
        style={{ opacity: 0, zIndex: 8 }}>
        {/* Desktop: Terminal + Narrative side by side */}
        <div
          className="hidden lg:flex absolute inset-0 items-center justify-center flex-row"
          style={{ padding: "0 4vw", gap: "3vw" }}>
          {/* LEFT: Terminal */}
          <div
            style={{
              width: "clamp(560px, 38vw, 720px)",
              minHeight: "clamp(400px, 50cqh, 560px)",
              borderRadius: "8px",
              overflow: "hidden",
              background: TERMINAL_COLORS.background,
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              fontFamily: TERMINAL_FONT,
              fontSize: "clamp(10px, 1.6cqh, 13px)",
              position: "relative",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column" as const,
            }}>
            {/* Top bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                background: TERMINAL_COLORS.topBar,
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: TERMINAL_COLORS.dotRed,
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: TERMINAL_COLORS.dotYellow,
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: TERMINAL_COLORS.dotGreen,
                }}
              />
              <span
                style={{
                  marginLeft: "auto",
                  color: "#8b949e",
                  fontSize: "10px",
                }}>
                {CONTENT.terminal.header}
              </span>
            </div>
            {/* Terminal content + wipe (wipe only covers content, not header) */}
            <div
              style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <pre
                ref={termContentRef}
                style={{
                  padding: "12px 0",
                  margin: 0,
                  overflow: "hidden",
                  color: TERMINAL_COLORS.text,
                  lineHeight: 1.5,
                  fontSize: "clamp(10px, 1.5cqh, 13px)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word" as const,
                }}
              />
              <div
                ref={termWipeRef}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: TERMINAL_COLORS.background,
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* RIGHT: V15-style narrative reveal */}
          <div
            ref={termNarrativeRef}
            style={{ width: "clamp(340px, 22vw, 420px)", padding: "0" }}>
            {/* Company label — name only (dates are in terminal) */}
            <div style={{ marginBottom: "1.5rem" }}>
              <span
                data-role="name"
                className="font-sans"
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                }}
              />
            </div>
            {/* Scene — clip-path reveal left-to-right */}
            <p
              data-role="scene"
              className="font-serif"
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.7,
                color: "var(--cream, #F0E6D0)",
                marginBottom: "1.25rem",
                clipPath: "inset(0 100% 0 0)",
              }}
            />
            {/* Action — fade in */}
            <p
              data-role="action"
              className="font-sans"
              style={{
                fontSize: "0.85rem",
                lineHeight: 1.65,
                color: "var(--cream-muted, #B0A890)",
                marginBottom: "1.25rem",
                opacity: 0,
              }}
            />
            {/* Shift — fade in italic */}
            <p
              data-role="shift"
              className="font-serif"
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.6,
                fontStyle: "italic",
                color: "var(--cream, #F0E6D0)",
                opacity: 0,
              }}
            />
          </div>
        </div>
        {/* close desktop wrapper */}

        {/* Mobile carousel — static swipeable cards, lg:hidden */}
        <div
          ref={mobileCarouselRef}
          className="absolute inset-0 lg:hidden"
          style={{ background: "var(--bg)" }}>
          {/* Stacked cards — scroll-driven, one visible at a time */}
          {TERM_COMPANIES.map((co, ci) => {
            const nar = TERM_NARRATIVES[ci];
            return (
              <div
                key={co.company}
                ref={(el) => {
                  mobileCardRefs.current[ci] = el;
                }}
                className="absolute inset-0 flex flex-col items-center px-6"
                style={{
                  opacity: ci === 0 ? 1 : 0,
                  paddingTop: "clamp(60px, 12vh, 120px)",
                  willChange: "opacity",
                  transition: "opacity 0.3s ease",
                }}>
                {/* Company label + role — above the card */}
                <div
                  style={{
                    marginBottom: "0.6rem",
                    textAlign: "center",
                  }}>
                  <div
                    className="font-ui"
                    style={{
                      fontSize: "0.7rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: COMPANY_COLORS[ci],
                    }}>
                    {co.company} &middot; {co.location}
                  </div>
                  <div
                    className="font-sans"
                    style={{
                      fontSize: "0.6rem",
                      color: "var(--text-dim)",
                      marginTop: "0.25rem",
                      letterSpacing: "0.04em",
                    }}>
                    {COMPANY_ROLES[co.company]}
                  </div>
                </div>
                {/* Glass card container */}
                <div
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    padding: "clamp(16px, 3vh, 24px)",
                    background: "rgba(14,14,20,0.45)",
                    backdropFilter: "blur(20px) saturate(1.3)",
                    WebkitBackdropFilter: "blur(20px) saturate(1.3)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow:
                      "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)",
                  }}>
                  {/* Narrative text — clear 3-tier hierarchy */}
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "clamp(0.8rem, 2vh, 1.2rem)",
                    }}>
                    <p
                      className="font-serif"
                      style={{
                        fontSize: "1.05rem",
                        lineHeight: 1.55,
                        color: "var(--cream)",
                        marginBottom: "0.75rem",
                      }}>
                      {nar.scene}
                    </p>
                    <p
                      className="font-sans"
                      style={{
                        fontSize: "0.82rem",
                        lineHeight: 1.6,
                        color: "var(--cream-muted)",
                        marginBottom: "0.75rem",
                      }}>
                      {nar.action}
                    </p>
                    <p
                      className="font-narrator"
                      style={{
                        fontSize: "0.88rem",
                        lineHeight: 1.5,
                        fontStyle: "italic",
                        color: "var(--gold-dim)",
                      }}>
                      &ldquo;{nar.shift}&rdquo;
                    </p>
                  </div>
                  {/* Mini terminal — role + key takeaway instead of commit */}
                  <div
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: TERMINAL_COLORS.background,
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "6px 10px",
                        background: TERMINAL_COLORS.topBar,
                      }}>
                      {[
                        TERMINAL_COLORS.dotRed,
                        TERMINAL_COLORS.dotYellow,
                        TERMINAL_COLORS.dotGreen,
                      ].map((c) => (
                        <div
                          key={c}
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: c,
                          }}
                        />
                      ))}
                      <span
                        className="font-sans"
                        style={{
                          marginLeft: "auto",
                          fontSize: "8px",
                          color: "var(--text-dim)",
                          letterSpacing: "0.05em",
                        }}>
                        {CONTENT.terminal.header}
                      </span>
                    </div>
                    <pre
                      style={{
                        padding: "8px 10px",
                        margin: 0,
                        fontFamily: TERMINAL_FONT,
                        fontSize: "10px",
                        lineHeight: 1.7,
                        color: TERMINAL_COLORS.text,
                        whiteSpace: "pre-wrap",
                      }}>
                      <span style={{ color: TERMINAL_COLORS.keyword }}>
                        {co.commitType}: {co.commitMsg}
                      </span>
                      {co.insight.map((line, li) => (
                        <span key={li}>
                          {"\n"}
                          <span style={{ color: TERMINAL_COLORS.comment }}>
                            {line}
                          </span>
                        </span>
                      ))}
                      {co.promotion && (
                        <span>
                          {"\n"}
                          <span
                            style={{
                              color: TERMINAL.promotionFg,
                              background: TERMINAL.promotionBg,
                              padding: "0 4px",
                              borderRadius: "2px",
                            }}>
                            {co.promotion}
                          </span>
                        </span>
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* close terminalRef outer */}

      {/* Dot indicator — Apple-style, all devices */}
      <div
        ref={termProgressWrapRef}
        style={{
          position: "absolute",
          bottom: "5vh",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 10,
          pointerEvents: "auto",
          opacity: 0,
        }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={`tp-${i}`}
            ref={(el) => {
              termProgressRefs.current[i] = el;
            }}
            onClick={() => {
              const beatDur = PH.BEATS[i].end - PH.BEATS[i].start;
              const target = PH.BEATS[i].start + beatDur * 0.1;
              const container = forgeContainerRef.current;
              if (!container) return;
              const containerTop =
                container.getBoundingClientRect().top + window.scrollY;
              const containerH =
                container.offsetHeight - window.innerHeight;
              window.scrollTo({
                top: containerTop + target * containerH,
                behavior: "smooth",
              });
            }}
            style={{
              height: "6px",
              width: i === 0 ? "20px" : "6px",
              borderRadius: "3px",
              background: i === 0 ? "var(--gold)" : "var(--text-dim)",
              opacity: i === 0 ? 1 : 0.35,
              cursor: "pointer",
              transition: "width 0.3s, opacity 0.3s, background 0.3s",
            }}
          />
        ))}
      </div>
    </>
  );

  return { update, jsx };
}
