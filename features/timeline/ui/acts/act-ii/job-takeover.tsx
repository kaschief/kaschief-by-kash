"use client";

import { useEffect } from "react";
import { useTakeover, TakeoverNavigation, TakeoverContent } from "@components";
import { TOKENS, Z_INDEX, KEYBOARD_EVENT, TAKEOVER_NAV_LABEL } from "@utilities";
import type { JobTakeoverProps } from "./act-ii.types";
const { KEY: { ARROW_LEFT, ARROW_RIGHT }, TYPE: { KEY_DOWN } } = KEYBOARD_EVENT;
const { bg, cream, creamMuted, fontMono, fontSerif, textDim, textFaint } = TOKENS;
const { takeover } = Z_INDEX;
const { NEXT_JOB, PREVIOUS_JOB } = TAKEOVER_NAV_LABEL;

export function JobTakeover({
  job,
  actLabel,
  color,
  onClose,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: JobTakeoverProps) {
  const { item } = useTakeover(onClose);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ARROW_LEFT && canGoPrev) {
        e.preventDefault();
        onPrev();
      }
      if (e.key === ARROW_RIGHT && canGoNext) {
        e.preventDefault();
        onNext();
      }
    };

    document.addEventListener(KEY_DOWN, handleKey);
    return () =>
      document.removeEventListener(KEY_DOWN, handleKey);
  }, [canGoNext, canGoPrev, onNext, onPrev]);

  return (
    <div
      onClick={() => history.back()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: takeover,
        background: bg,
        overflowY: "auto",
      }}>
      <TakeoverNavigation
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={onPrev}
        onNext={onNext}
        prevLabel={PREVIOUS_JOB}
        nextLabel={NEXT_JOB}
        zIndex={takeover + 1}
      />
      <TakeoverContent onClick={(e) => e.stopPropagation()}>
        <p
          style={{
            fontFamily: fontMono,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color,
            marginBottom: 32,
            ...item(0.08),
          }}>
          {actLabel}
        </p>

        <h2
          style={{
            fontFamily: fontSerif,
            fontWeight: 400,
            fontSize: "clamp(44px, 7vw, 96px)",
            color: cream,
            lineHeight: 1,
            marginBottom: 16,
            ...item(0.04),
          }}>
          {job.company}
        </h2>

        <p
          style={{
            fontSize: 17,
            color: creamMuted,
            marginBottom: 8,
            ...item(0.1),
          }}>
          {job.role}
        </p>

        <p
          style={{
            fontFamily: fontMono,
            fontSize: 10,
            color: textFaint,
            marginBottom: 40,
            ...item(0.12),
          }}>
          {job.period} · {job.location}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 52,
            ...item(0.16),
          }}>
          {job.tech.map((t) => (
            <span
              key={t}
              style={{
                fontFamily: fontMono,
                fontSize: 10,
                color,
                border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
                borderRadius: 999,
                padding: "4px 12px",
              }}>
              {t}
            </span>
          ))}
        </div>

        <div style={{ maxWidth: 580, ...item(0.2) }}>
          <p
            style={{
              fontSize: 17,
              fontWeight: 300,
              lineHeight: 1.85,
              color: textDim,
              marginBottom: 24,
            }}>
            {job.deepDive.context}
          </p>
          <p
            style={{
              fontSize: 17,
              fontWeight: 300,
              lineHeight: 1.85,
              color: textDim,
              marginBottom: 24,
            }}>
            {job.deepDive.contribution}
          </p>
          <p
            style={{
              fontSize: 17,
              fontWeight: 300,
              lineHeight: 1.85,
              color: cream,
            }}>
            {job.deepDive.outcome}
          </p>
        </div>

        <div style={{ marginTop: 48, ...item(0.24) }}>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: fontMono,
              fontSize: 11,
              color,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}>
            {job.url.replace("https://", "")}
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5">
              <path d="M3 9l6-6M4 3h5v5" />
            </svg>
          </a>
        </div>
      </TakeoverContent>
    </div>
  );
}
