/** Share of the sheet height after which a downward drag closes the sheet. */
export const CLOSE_FRACTION = 0.3;
/** Speed (px/ms) from which a short downward flick closes the sheet. */
export const FLICK_VELOCITY = 0.5;
/** Minimum drag distance (px) for a flick, so a twitch does not close the sheet. */
export const FLICK_MIN_DISTANCE = 24;

/**
 * Decides whether releasing a downward drag closes the sheet.
 * `dy` is the drag distance in px, `height` the sheet height, `velocity` the downward speed in px/ms.
 */
export function shouldCloseOnRelease(
  dy: number,
  height: number,
  velocity: number,
): boolean {
  if (dy <= 0 || height <= 0) return false;
  if (dy >= height * CLOSE_FRACTION) return true;
  return velocity >= FLICK_VELOCITY && dy >= FLICK_MIN_DISTANCE;
}

/** Backdrop opacity factor (1 = full, 0 = gone) while the sheet is dragged down by `dy`. */
export function backdropFactor(dy: number, height: number): number {
  if (height <= 0) return 1;
  return 1 - Math.min(Math.max(dy / height, 0), 1);
}
