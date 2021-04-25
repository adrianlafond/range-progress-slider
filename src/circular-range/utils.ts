/**
 * Normalizes the minDegrees and maxDegrees props and returns the value
 * converted to a number between 0 and 360 and also and also converted to radians.
 */
export function normalizeDegrees(propDegrees?: number) {
  const modulo360 = (propDegrees != null ? propDegrees : 0) % 360;
  const degrees: number = modulo360 < 0 ? modulo360 + 360 : modulo360;

  // Convert to radians while keeping 0 at 12:00.
  let radians: number = degrees / 180 * Math.PI - Math.PI * 0.5;
  if (radians < 0) {
    radians += Math.PI * 2;
  }

  return { degrees, radians };
}

/**
 * Get the center of an element (specifically the circular track) in order to
 * measure angles against it for the mouse and knobs.
 */
export function getCenterCoordinates(el?: HTMLElement): [number, number] | undefined {
  if (el) {
    const rootRect = el.getBoundingClientRect();
    return [rootRect.width / 2 + rootRect.x, rootRect.height / 2 + rootRect.y];
  }
}

/**
 * Given a value, min, and max, returns the percent of the value relative to the
 * min and the max.
 */
export function getPercentForValue(value: number, { min, max }: { min: number, max: number }) {
  return (value - min) / (max - min);
}

export function getRadiansForPercent({ percent, counterClockwise, minRadians, maxRadians }: {
  percent: number;
  counterClockwise?: boolean;
  minRadians: number;
  maxRadians: number;
}) {
  // Convert percent to radians and offset by zeroAtRadians.
  let radians = percent * (Math.PI * 2);
  if (counterClockwise) {
    radians = Math.PI * 2 - radians;
  }
  radians += minRadians;
  // console.log(radians.toFixed(2), minRadians.toFixed(2), maxRadians.toFixed(2));
  return radians;
}

/**
 * Given a center (x and y is assumed to be the same) and a radius for a track
 * and the radians of a knob, returns a CSS transform value that can be applied
 * via an inline style.
 */
export function getKnobTransform({ center, radius, radians }: {
  center: number;
  radius: number;
  radians: number;
}) {
  const pt1x = center + Math.cos(radians) * radius;
  const pt1y = center + Math.sin(radians) * radius;
  return `translate(
      ${pt1x}px,
      ${pt1y}px
    ) rotate(${radians + Math.PI * 0.5}rad)`;
}

/**
 * Converts the angle of the mouse from the center into a value between the
 * input's min and max.
 */
export function getValueFromPointer({
  event,
  centerCoords,
  min,
  max,
  counterClockwise,
  minRadians,
  maxRadians,
  currentValue,
}: {
  event: MouseTouchEvent
  centerCoords?: [number, number];
  min: number;
  max: number;
  counterClockwise: boolean;
  minRadians: number;
  maxRadians: number;
  currentValue: number;
}) {
  if (centerCoords) {
    // Get radians between mouse and center of track:
    const [cx, cy] = centerCoords;

    const { clientX, clientY } = getClientCoordinates(event);
    let radians = Math.atan2(clientY - cy, clientX - cx);

    // Set radians back to 0 or 12:00:
    // radians += Math.PI * 0.5;

    if (radians < 0) {
      // Ensure 0 <= radians <= 6.28:
      radians += Math.PI * 2;
    }

    if (counterClockwise) {
      // "Flip" the radians to get counter-clockwise values:
      radians = Math.PI * 2 - radians;
    }

    const normMaxRadians = maxRadians < minRadians ? maxRadians + Math.PI * 2 : maxRadians;
    const highRadians = radians + Math.PI * 2;

    let normRadians = radians;
    if (radians >= minRadians && radians <= normMaxRadians) {
      // fine
    } else if (highRadians >= minRadians && highRadians <= normMaxRadians) {
      // fine
    } else {
      const d1 = radians < minRadians ? minRadians - radians : Number.MAX_VALUE;
      const d2 = highRadians > normMaxRadians ? highRadians - normMaxRadians : Number.MAX_VALUE;
      if (d1 < d2) {
        normRadians = minRadians;
      } else {
        normRadians = normMaxRadians;
      }
    }

    // Convert the radians to a percent:
    let percent = normRadians / (Math.PI * 2);

    // Account for prop zeroAtDegrees:
    percent -= (counterClockwise ? -1 : 1) * (minRadians / (Math.PI * 2));
    percent %= 1;
    if (percent < 0) {
      percent += 1;
    }

    const value = min + percent * (max - min);
    if (isNaN(currentValue)) {
      return value;
    }
    if (currentValue - value >= 50) {
      return Math.min(currentValue, 100);
    } else if (currentValue - value <= -50) {
      return Math.max(currentValue, 0);
    }
    return value;
  }
  return 0;
}

export interface MouseTouchEvent {
  touches?: TouchList;
  clientX?: number;
  clientY?: number;
}

function getClientCoordinates(event: MouseTouchEvent) {
  if (event.touches) {
    return { clientX: event.touches[0].clientX, clientY: event.touches[0].clientY };
  }
  return { clientX: event.clientX || 0, clientY: event.clientY || 0 };
}