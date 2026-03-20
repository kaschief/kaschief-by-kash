"use client";

import { useRef } from "react";
import { CONTENT } from "../engineer-candidate/engineer-data";
import {
  THESIS as EC_THESIS,
  CONTAINER_VH as EC_CONTAINER_VH,
  CURTAIN_THESIS,
  PREFIX_DISSOLVE,
  POST_CURTAIN,
} from "../engineer-candidate/engineer-candidate.types";
import { smoothstep, lerp, clamp } from "../engineer-candidate/math";
import { JiraCard, SentryCard, SlackCard } from "../lab-artifacts/artifact-cards";

/* ── Local config ── */

/** Total scroll container height in viewport units */
export const CONTAINER_HEIGHT_VH = 600;

/**
 * EC's stagger/reveal values are calibrated to EC's ~1799vh container.
 * Scale them so the same physical scroll distance produces the same effect.
 */
const EC_TO_LOCAL_SCALE = EC_CONTAINER_VH / CONTAINER_HEIGHT_VH;

/** Where thesis entrance begins (fraction of total scroll 0–1) */
const THESIS_PHASE_START = 0.0;

/** How much scroll the thesis entrance occupies (fraction of total scroll) */
const THESIS_PHASE_DURATION = 0.25; // 0.25 × 600 = 150vh

/** RAF smoothing — lower = more resistance/guided feeling */
export const SMOOTH_LERP_FACTOR = 0.07;

/** Artifact shuffle-in — each card's off-screen origin and landed position */
const ARTIFACT_POSITIONS = [
  {
    // Jira — enters from left, lands upper-left
    fromX: -120,
    fromY: 20,
    fromRotation: -18,
    toX: 6,
    toY: 30,
    toRotation: -3.5,
    width: "max(440px, 28vw)",
  },
  {
    // Sentry — enters from right, lands upper-right
    fromX: 120,
    fromY: 15,
    fromRotation: 12,
    toX: 58,
    toY: 26,
    toRotation: 2.5,
    width: "max(420px, 26vw)",
  },
  {
    // Slack — enters from bottom, lands bottom-center-right
    fromX: 30,
    fromY: 120,
    fromRotation: -6,
    toX: 38,
    toY: 62,
    toRotation: -1.5,
    width: "max(460px, 30vw)",
  },
] as const;

/** Scroll progress budget for each artifact's entrance (staggered) */
const ARTIFACT_SHUFFLE = {
  stagger: 0.02,          // delay between each card's entrance start
  entranceDuration: 0.06, // how long each card takes to slide in
  opacityRamp: 3,         // multiplier for quick fade-in (1 = linear, higher = faster)
} as const;

/** Subtitle timing — offsets from ARTIFACT_SHUFFLE_START */
const SUBTITLE = {
  fadeInDelay: 0.01,    // scroll progress after shuffle start
  fadeInDuration: 0.02, // scroll progress for full fade
  fontSize: "clamp(0.75rem, 1.2vw, 1rem)",
} as const;

/** Curtain edge decoration */
const CURTAIN_EDGE = {
  accentLineHeight: 1,     // px
  gradientOvershoot: 20,   // px above curtain leading edge
} as const;

/** Card shadows for dark background */
const CARD_SHADOWS = {
  light: "0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
  dark: "0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(225,86,124,0.08)",
} as const;

/* ── Derived timing ── */

const thesisData = CONTENT.thesis;
const KEYWORD_COUNT = thesisData.keywords.length;

const KEYWORD_REVEAL_START =
  THESIS_PHASE_START + THESIS_PHASE_DURATION * EC_THESIS.wordZoneFrac;

const KEYWORD_STAGGER = EC_THESIS.wordStagger * EC_TO_LOCAL_SCALE;
const KEYWORD_REVEAL_DURATION = EC_THESIS.wordRevealDur * EC_TO_LOCAL_SCALE;

const FINAL_KEYWORD_END =
  KEYWORD_REVEAL_START +
  (KEYWORD_COUNT - 1) * KEYWORD_STAGGER +
  KEYWORD_REVEAL_DURATION;

const SCROLL = {
  thesisStart: THESIS_PHASE_START,
  thesisDuration: THESIS_PHASE_DURATION,
  curtainStart: FINAL_KEYWORD_END + CURTAIN_THESIS.pauseAfterWords,
  curtainEnd:
    FINAL_KEYWORD_END +
    CURTAIN_THESIS.pauseAfterWords +
    CURTAIN_THESIS.sweepDuration,
} as const;

/** Where artifact shuffle begins — right after "users" appears */
const ARTIFACT_SHUFFLE_START =
  SCROLL.curtainEnd +
  POST_CURTAIN.appearDuration; // no delay, cards come in immediately

/* ── Hook ── */

/**
 * Curtain-thesis hook — owns thesis entrance, curtain sweep,
 * prefix dissolution, post-curtain keyword reveal, and artifact shuffle-in.
 * Called per-frame from the parent scroll callback via `update()`.
 *
 * Returns `{ update, jsx }` — same pattern as useConvergence.
 */
export function useCurtainThesis() {
  /* ---- Refs ---- */
  const thesisSentenceRef = useRef<HTMLDivElement>(null);
  const prefixSpanRef = useRef<HTMLSpanElement>(null);
  const keywordSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const curtainOverlayRef = useRef<HTMLDivElement>(null);
  const curtainAccentLineRef = useRef<HTMLDivElement>(null);
  const curtainGradientRef = useRef<HTMLDivElement>(null);
  const postCurtainRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const artifactRefs = useRef<(HTMLDivElement | null)[]>([]);
  const surfaceGlowRef = useRef<HTMLDivElement>(null);

  /* ---- Scroll update ---- */
  function update(
    progress: number,
    viewportRef: React.RefObject<HTMLDivElement | null>,
  ) {
    /* ═══ Phase 1: Thesis entrance — identical to EC logic ═══ */

    if (thesisSentenceRef.current) {
      const fadeInEnd =
        SCROLL.thesisStart + SCROLL.thesisDuration * EC_THESIS.fadeInFrac;
      const fadeInProgress = smoothstep(
        SCROLL.thesisStart,
        fadeInEnd,
        progress,
      );

      const fastDrift = smoothstep(
        SCROLL.thesisStart,
        KEYWORD_REVEAL_START,
        progress,
      );
      const slowDrift = smoothstep(
        KEYWORD_REVEAL_START,
        FINAL_KEYWORD_END,
        progress,
      );
      const combinedDrift =
        fastDrift * EC_THESIS.driftFastWeight +
        slowDrift * EC_THESIS.driftSlowWeight;
      const verticalOffset = lerp(
        EC_THESIS.yStartLg,
        EC_THESIS.yEndLg,
        combinedDrift,
      );

      const entranceBlur = lerp(EC_THESIS.initialBlur, 0, fadeInProgress);

      thesisSentenceRef.current.style.opacity = String(fadeInProgress);
      thesisSentenceRef.current.style.transform = `translate(-50%, calc(-50% + ${verticalOffset}vh))`;
      thesisSentenceRef.current.style.filter =
        entranceBlur > 0.1 ? `blur(${entranceBlur}px)` : "none";

      for (let i = 0; i < KEYWORD_COUNT; i++) {
        const keywordSpan = keywordSpanRefs.current[i];
        if (!keywordSpan) continue;
        const thisKeywordStart = KEYWORD_REVEAL_START + i * KEYWORD_STAGGER;
        const keywordRevealProgress = smoothstep(
          thisKeywordStart,
          thisKeywordStart + KEYWORD_REVEAL_DURATION,
          progress,
        );
        keywordSpan.style.opacity = String(keywordRevealProgress);
        keywordSpan.style.transform = `translateY(${lerp(EC_THESIS.wordDropPx, 0, keywordRevealProgress)}px)`;
        keywordSpan.style.display = "inline-block";
      }
    }

    /* ═══ Phase 2: Curtain — opaque overlay grows upward from bottom ═══ */

    if (curtainOverlayRef.current) {
      const curtainProgress = clamp(
        (progress - SCROLL.curtainStart) /
          (SCROLL.curtainEnd - SCROLL.curtainStart),
        0,
        1,
      );
      curtainOverlayRef.current.style.height = `${curtainProgress * 100}%`;

      const curtainIsMoving = curtainProgress > 0 && curtainProgress < 1;
      if (curtainAccentLineRef.current) {
        curtainAccentLineRef.current.style.opacity = curtainIsMoving
          ? "0.7"
          : "0";
      }
      if (curtainGradientRef.current) {
        curtainGradientRef.current.style.opacity = curtainIsMoving ? "1" : "0";
      }

      /* ═══ Phase 3: Prefix dissolution ═══ */

      if (
        prefixSpanRef.current &&
        viewportRef.current &&
        curtainProgress > 0
      ) {
        const viewportRect = viewportRef.current.getBoundingClientRect();
        const viewportHeight = viewportRect.height;
        const curtainLineY = viewportHeight * (1 - curtainProgress);
        const prefixRect = prefixSpanRef.current.getBoundingClientRect();
        const prefixBottomRelative = prefixRect.bottom - viewportRect.top;

        const lookaheadPx = viewportHeight * PREFIX_DISSOLVE.lookaheadFrac;
        const distanceFromLineToText = curtainLineY - prefixBottomRelative;

        if (distanceFromLineToText < lookaheadPx) {
          const dissolveAmount = clamp(
            1 - distanceFromLineToText / lookaheadPx,
            0,
            1,
          );
          const blurPx = dissolveAmount * PREFIX_DISSOLVE.fullBlurPx;
          const dimmedOpacity = lerp(
            1,
            PREFIX_DISSOLVE.minOpacity,
            dissolveAmount,
          );
          prefixSpanRef.current.style.filter =
            blurPx > 0.1 ? `blur(${blurPx}px)` : "none";
          prefixSpanRef.current.style.opacity = String(dimmedOpacity);
        } else {
          prefixSpanRef.current.style.filter = "none";
          prefixSpanRef.current.style.opacity = "1";
        }
      }

      /* ═══ Phase 4: Post-curtain — "users" appears big center, then shrinks to top ═══ */

      if (postCurtainRef.current) {
        const appearStart = SCROLL.curtainEnd;
        const appearEnd = appearStart + POST_CURTAIN.appearDuration;

        const appearProgress = smoothstep(appearStart, appearEnd, progress);

        // Shrink slightly as cards arrive — stays centered
        const shrinkProgress = smoothstep(
          ARTIFACT_SHUFFLE_START,
          ARTIFACT_SHUFFLE_START + ARTIFACT_SHUFFLE.entranceDuration,
          progress,
        );

        postCurtainRef.current.style.opacity = String(appearProgress);
        // Stay at 50% vertical, just shrink from 5vw → 3.5vw
        postCurtainRef.current.style.fontSize = `${lerp(POST_CURTAIN.startFontSizeVw, POST_CURTAIN.endFontSizeVw, shrinkProgress)}vw`;

        // Subtitle fades in as cards arrive
        if (subtitleRef.current) {
          const subtitleProgress = smoothstep(
            ARTIFACT_SHUFFLE_START + SUBTITLE.fadeInDelay,
            ARTIFACT_SHUFFLE_START + SUBTITLE.fadeInDelay + SUBTITLE.fadeInDuration,
            progress,
          );
          subtitleRef.current.style.opacity = String(subtitleProgress);
        }
      }

      /* ═══ Phase 5: Artifact shuffle-in — cards slide from off-screen edges ═══ */

      for (let i = 0; i < ARTIFACT_POSITIONS.length; i++) {
        const el = artifactRefs.current[i];
        if (!el) continue;

        const pos = ARTIFACT_POSITIONS[i];
        const cardStart = ARTIFACT_SHUFFLE_START + i * ARTIFACT_SHUFFLE.stagger;
        const cardEnd = cardStart + ARTIFACT_SHUFFLE.entranceDuration;
        const slideProgress = smoothstep(cardStart, cardEnd, progress);

        const currentX = lerp(pos.fromX, pos.toX, slideProgress);
        const currentY = lerp(pos.fromY, pos.toY, slideProgress);
        const currentRotation = lerp(pos.fromRotation, pos.toRotation, slideProgress);

        el.style.opacity = String(clamp(slideProgress * ARTIFACT_SHUFFLE.opacityRamp, 0, 1));
        el.style.left = `${currentX}%`;
        el.style.top = `${currentY}%`;
        el.style.transform = `rotate(${currentRotation}deg)`;
      }

      // Surface glow fades in with first artifact
      if (surfaceGlowRef.current) {
        const glowProgress = smoothstep(
          ARTIFACT_SHUFFLE_START,
          ARTIFACT_SHUFFLE_START + ARTIFACT_SHUFFLE.entranceDuration,
          progress,
        );
        surfaceGlowRef.current.style.opacity = String(glowProgress);
      }

    }
  }

  /* ---- JSX ---- */
  const jsx = (
    <>
      {/* Thesis sentence — renders identically to EC */}
      <div
        ref={thesisSentenceRef}
        className="absolute left-1/2 top-1/2 text-center select-none pointer-events-none"
        style={{
          opacity: 0,
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
          color: "var(--cream)",
          fontWeight: 400,
          maxWidth: EC_THESIS.maxWidthLg,
          lineHeight: 1.5,
          willChange: "transform, opacity, filter",
          zIndex: 1,
        }}>
        <span ref={prefixSpanRef} style={{ willChange: "filter, opacity" }}>
          {thesisData.prefix}
        </span>
        <span style={{ whiteSpace: "nowrap" }}>
          {thesisData.keywords.map((word, i) => (
            <span key={word}>
              <span
                ref={(el) => {
                  keywordSpanRefs.current[i] = el;
                }}
                style={{
                  opacity: 0,
                  willChange: "opacity, transform",
                  marginRight:
                    i < thesisData.keywords.length - 1
                      ? "0.3em"
                      : undefined,
                }}>
                {i === thesisData.keywords.length - 1
                  ? `${thesisData.conjunction}${word}.`
                  : `${word},`}
              </span>
            </span>
          ))}
        </span>
      </div>

      {/* Curtain overlay — anchored at bottom, grows upward to erase */}
      <div
        ref={curtainOverlayRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "0%",
          zIndex: 2,
          background: "var(--bg, #07070A)",
          pointerEvents: "none",
        }}>
        <div
          ref={curtainAccentLineRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: CURTAIN_EDGE.accentLineHeight,
            background: CURTAIN_THESIS.accentColor,
            opacity: 0,
          }}
        />
        <div
          ref={curtainGradientRef}
          style={{
            position: "absolute",
            top: -CURTAIN_EDGE.gradientOvershoot,
            left: 0,
            right: 0,
            height: CURTAIN_EDGE.gradientOvershoot,
            background: `linear-gradient(to bottom, transparent, var(--bg, #07070A))`,
            opacity: 0,
          }}
        />
      </div>

      {/* Post-curtain "users" word — appears center, drifts to top-left */}
      <div
        ref={postCurtainRef}
        className="absolute select-none pointer-events-none"
        style={{
          opacity: 0,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-serif)",
          fontSize: `${POST_CURTAIN.startFontSizeVw}vw`,
          fontWeight: 400,
          color: POST_CURTAIN.color,
          letterSpacing: "0.06em",
          textAlign: "center",
          zIndex: 10,
          willChange: "opacity, font-size",
        }}>
        users
        <div
          ref={subtitleRef}
          style={{
            opacity: 0,
            fontSize: SUBTITLE.fontSize,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--cream-muted)",
            fontWeight: 400,
            letterSpacing: "0.01em",
            marginTop: "0.5em",
            whiteSpace: "nowrap",
          }}>
          What people actually experience.
        </div>
      </div>

      {/* Warm surface glow — grounds light cards on dark bg */}
      <div
        ref={surfaceGlowRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          zIndex: 3,
          background: [
            "radial-gradient(ellipse 80% 70% at 50% 55%, rgba(240,230,208,0.06) 0%, transparent 70%)",
            "radial-gradient(ellipse 50% 40% at 35% 45%, rgba(201,168,76,0.03) 0%, transparent 60%)",
          ].join(", "),
          willChange: "opacity",
        }}
      />

      {/* Artifact cards — shuffle in from off-screen edges */}
      {ARTIFACT_POSITIONS.map((pos, i) => (
        <div
          key={i}
          ref={(el) => {
            artifactRefs.current[i] = el;
          }}
          className="absolute pointer-events-none"
          style={{
            opacity: 0,
            left: `${pos.fromX}%`,
            top: `${pos.fromY}%`,
            transform: `rotate(${pos.fromRotation}deg)`,
            width: pos.width,
            zIndex: 4 + i,
            willChange: "opacity, left, top, transform",
          }}>
          {i === 0 && <JiraCard style={{ boxShadow: CARD_SHADOWS.light }} />}
          {i === 1 && <SentryCard style={{ boxShadow: CARD_SHADOWS.dark }} />}
          {i === 2 && <SlackCard style={{ boxShadow: CARD_SHADOWS.light }} />}
        </div>
      ))}

    </>
  );

  return { update, jsx };
}
