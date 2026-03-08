"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import {
  C,
  SNAP_START,
  SNAP_END,
  STACK_START,
  FOCUS_START,
  NARRATOR_CHAOS,
  NARRATOR_ORDER_BEFORE,
  NARRATOR_ORDER_SKILLS,
  NARRATOR_ORDER_AFTER,
} from "./chaos-to-order.constants";

const NARRATOR_BG = `radial-gradient(ellipse, ${C.narratorBgCenter} 0%, ${C.narratorBgEdge} 50%, transparent 100%)`;
const NARRATOR_BG_MOBILE =
  "radial-gradient(ellipse 70% 55%, rgba(7,7,10,0.88) 0%, rgba(7,7,10,0.6) 40%, transparent 100%)";

const FONT_CLASS =
  "font-[family-name:var(--font-spectral)] italic leading-relaxed";
const FONT_DESKTOP = `${FONT_CLASS} text-[clamp(16px,1.6vw,22px)]`;
const FONT_MOBILE = `${FONT_CLASS} text-[clamp(18px,2.8vw,22px)]`;

// ─── Shared narrator block ──────────────────────────────────────────────────

function OrderSentence({ lingerOnly }: { lingerOnly?: boolean }) {
  return (
    <p
      className={FONT_DESKTOP}
      style={{ color: lingerOnly ? "transparent" : C.narrator }}>
      {NARRATOR_ORDER_BEFORE}{" "}
      <span className="whitespace-nowrap" style={{ color: C.narrator }}>{NARRATOR_ORDER_SKILLS}</span>{" "}
      {NARRATOR_ORDER_AFTER}
    </p>
  );
}

function OrderSentenceMobile({ lingerOnly }: { lingerOnly?: boolean }) {
  return (
    <p
      className={FONT_MOBILE}
      style={{ color: lingerOnly ? "transparent" : C.narrator }}>
      {NARRATOR_ORDER_BEFORE}{" "}
      <span className="whitespace-nowrap" style={{ color: C.narrator }}>{NARRATOR_ORDER_SKILLS}</span>{" "}
      {NARRATOR_ORDER_AFTER}
    </p>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function NarrativeText({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const chaosOpacity = useTransform(
    scrollProgress,
    [0.06, 0.12, SNAP_START - 0.06, SNAP_START - 0.02],
    [0, 1, 1, 0],
  );
  const orderOpacity = useTransform(
    scrollProgress,
    [SNAP_END, SNAP_END + 0.04, STACK_START - 0.04, STACK_START],
    [0, 1, 1, 0],
  );
  // "my skills" lingers until just before the first capability reveals
  const skillsLingerOpacity = useTransform(
    scrollProgress,
    [SNAP_END, SNAP_END + 0.04, STACK_START - 0.04, STACK_START, FOCUS_START, FOCUS_START + 0.03],
    [0, 1, 1, 1, 1, 0],
  );

  const narratorTop = useTransform(
    scrollProgress,
    [SNAP_START, SNAP_END],
    [50, 48],
  );
  const narratorTopStr = useTransform(narratorTop, (v) => `${v}%`);

  return (
    <>
      {/* ─── Desktop ─────────────────────────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute left-1/2 z-20 hidden w-72 -translate-x-1/2 -translate-y-1/2 text-center lg:block"
        style={{ top: narratorTopStr }}>
        {/* Chaos narrator */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <motion.div
            className="rounded-lg px-6 py-4"
            style={{ opacity: chaosOpacity, background: NARRATOR_BG }}>
            <p className={FONT_DESKTOP} style={{ color: C.narrator }}>
              {NARRATOR_CHAOS}
            </p>
          </motion.div>
        </div>

        {/* Order narrator */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <motion.div
            className="rounded-lg px-6 py-4"
            style={{ opacity: orderOpacity, background: NARRATOR_BG }}>
            <OrderSentence />
          </motion.div>
        </div>

        {/* "my skills" linger */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <motion.div
            className="rounded-lg px-6 py-4"
            style={{ opacity: skillsLingerOpacity }}>
            <OrderSentence lingerOnly />
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Mobile / tablet ─────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute left-1/2 top-[54%] z-20 w-screen -translate-x-1/2 -translate-y-1/2 text-center lg:hidden"
        style={{ padding: "2rem 0" }}>
        <div className="relative mx-auto w-[80vw]">
          {/* Chaos narrator */}
          <motion.div
            className="rounded-lg px-6 py-4"
            style={{ opacity: chaosOpacity, background: NARRATOR_BG_MOBILE }}>
            <p className={FONT_MOBILE} style={{ color: C.narrator }}>
              {NARRATOR_CHAOS}
            </p>
          </motion.div>

          {/* Order narrator */}
          <div className="absolute inset-0">
            <motion.div
              className="rounded-lg px-6 py-4"
              style={{ opacity: orderOpacity, background: NARRATOR_BG_MOBILE }}>
              <OrderSentenceMobile />
            </motion.div>
          </div>

          {/* "my skills" linger */}
          <div className="absolute inset-0">
            <motion.div
              className="rounded-lg px-6 py-4"
              style={{ opacity: skillsLingerOpacity }}>
              <OrderSentenceMobile lingerOnly />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
