import { useEffect, type RefObject } from "react";
import { backdropFactor, shouldCloseOnRelease } from "../components/swipeClose";

const PHONE_QUERY = "(max-width: 699.98px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
/** Movement (px) before a touch counts as a drag. */
const SLOP = 8;
const ANIMATION_MS = 200;
const BACKDROP_ALPHA = 0.5;
/** Window (ms) over which the release speed is measured. */
const VELOCITY_WINDOW = 100;

/**
 * Bottom-sheet gesture on phones: dragging down from anywhere on the sheet moves it with the finger.
 * It only takes over when the sheet content is scrolled to the top, otherwise the content scrolls.
 * Past a threshold (distance or flick) `onClose` is called after a short slide-out, else the sheet snaps back.
 * Not active from tablet width (centered dialog) and not for multi-touch.
 */
export function useSwipeToClose(
  sheet: RefObject<HTMLElement | null>,
  backdrop: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    const el = sheet.current;
    const back = backdrop.current;
    if (!el) return;

    let startY = 0;
    let atTop = false;
    let tracking = false;
    let dragging = false;
    let closing = false;
    let dragOrigin = 0;
    let dy = 0;
    let samples: { y: number; t: number }[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;

    const animated = () => !window.matchMedia(REDUCED_MOTION_QUERY).matches;

    function setBackdrop(factor: number) {
      if (back)
        back.style.backgroundColor = `rgb(0 0 0 / ${BACKDROP_ALPHA * factor})`;
    }

    function reset() {
      if (!el) return;
      el.style.transition = "";
      el.style.transform = "";
      if (back) {
        back.style.transition = "";
        back.style.backgroundColor = "";
      }
    }

    function glideTo(offset: string, factor: number, done: () => void) {
      if (!el) return;
      if (!animated()) {
        done();
        return;
      }
      el.style.transition = `transform ${ANIMATION_MS}ms ease-out`;
      el.style.transform = offset;
      if (back) back.style.transition = `background-color ${ANIMATION_MS}ms`;
      setBackdrop(factor);
      timer = setTimeout(done, ANIMATION_MS);
    }

    function onStart(e: TouchEvent) {
      if (closing || e.touches.length !== 1) {
        tracking = false;
        return;
      }
      if (!window.matchMedia(PHONE_QUERY).matches) return;
      clearTimeout(timer);
      reset();
      tracking = true;
      dragging = false;
      startY = e.touches[0].clientY;
      atTop = (el?.scrollTop ?? 0) <= 0;
      dy = 0;
      samples = [];
    }

    function onMove(e: TouchEvent) {
      if (!tracking || closing || !el) return;
      if (e.touches.length !== 1) {
        cancel();
        return;
      }
      const y = e.touches[0].clientY;
      if (!dragging) {
        // Only a downward pull from the top of the content starts the gesture.
        if (!atTop) return;
        if (y - startY < SLOP) return;
        dragging = true;
        dragOrigin = y;
      }
      if (e.cancelable) e.preventDefault();
      const now = performance.now();
      samples.push({ y, t: now });
      samples = samples.filter((s) => now - s.t <= VELOCITY_WINDOW);
      dy = Math.max(0, y - dragOrigin);
      el.style.transition = "none";
      el.style.transform = `translateY(${dy}px)`;
      if (back) back.style.transition = "none";
      setBackdrop(backdropFactor(dy, el.offsetHeight));
    }

    function onEnd() {
      if (!tracking || !el) return;
      tracking = false;
      if (!dragging) return;
      dragging = false;
      const first = samples[0];
      const last = samples[samples.length - 1];
      const velocity =
        first && last && last.t > first.t
          ? (last.y - first.y) / (last.t - first.t)
          : 0;
      const height = el.offsetHeight;
      if (shouldCloseOnRelease(dy, height, velocity)) {
        closing = true;
        glideTo("translateY(100%)", 0, () => onClose());
      } else {
        glideTo("translateY(0)", 1, reset);
      }
    }

    function cancel() {
      if (!tracking) return;
      tracking = false;
      if (dragging) {
        dragging = false;
        glideTo("translateY(0)", 1, reset);
      }
    }

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", cancel);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", cancel);
    };
  }, [sheet, backdrop, onClose]);
}
