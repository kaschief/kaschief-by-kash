/**
 * Fade-jump-slide transition — shared by nav scroll and zone skip.
 *
 * Fades out the scroll container, instantly jumps to a position,
 * waits for scroll-driven animations to settle, then fades back in
 * and smooth-slides to the final target.
 */

import type Lenis from "lenis";
import { SCROLL_NAV } from "@utilities";

/** Easing: fast start, smooth deceleration. */
const EASE_OUT_QUART = (t: number) => 1 - Math.pow(1 - t, 4);

/** Resolve the scroll container for fade transitions. */
function getScrollContainer(): HTMLElement {
  return document.getElementById("journey") ?? document.documentElement;
}

/**
 * Fade out → instant jump → fade in + smooth slide to target.
 *
 * `slideTo` can be a number or a callback that returns a number.
 * When a callback is provided it runs after the jump, so the slide
 * target reflects post-jump layout (pin spacers may shift positions).
 */
export function fadeJumpSlide(
  lenis: Lenis,
  jumpTo: number,
  slideTo: number | (() => number),
  slideDuration: number,
  onDone: () => void,
): void {
  const container = getScrollContainer();
  container.style.transition = `opacity ${SCROLL_NAV.fadeOutMs}ms ease-out`;
  container.style.opacity = "0";

  setTimeout(() => {
    // Hide completely during jump — prevents any intermediate scroll state from painting
    container.style.visibility = "hidden";
    lenis.scrollTo(jumpTo, { immediate: true, force: true });

    // Wait 3 frames for all scroll-driven animations to settle:
    //   Frame 1: scroll events fire, raw progress refs update
    //   Frame 2: RAF loops (e.g. lenses LERP) snap to new raw values
    //   Frame 3: DOM mutations from frame-2 updates are committed
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          container.style.visibility = "";
          container.style.transition = `opacity ${SCROLL_NAV.fadeInMs}ms ease-in`;
          container.style.opacity = "1";

          const resolvedTarget =
            typeof slideTo === "function" ? slideTo() : slideTo;

          lenis.scrollTo(resolvedTarget, {
            duration: slideDuration,
            easing: EASE_OUT_QUART,
            lock: true,
            force: true,
            onComplete: () => {
              container.style.transition = "";
              onDone();
            },
          });
        });
      });
    });
  }, SCROLL_NAV.fadeOutMs);
}
