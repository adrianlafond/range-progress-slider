import React, { TouchEvent } from "react";

/**
 * Normalizes the zeroAtDegrees prop and returns the value converted to a number
 * between 0 and 360 and also and also converted to radians.
 */
export function normalizeZeroAtDegrees(zeroAtDegrees?: number) {
  const zeroProp = zeroAtDegrees != null ? zeroAtDegrees : 0;
  const modulo360 = zeroProp % 360;
  const degrees: number = modulo360 < 0 ? modulo360 + 360 : modulo360;

  // Convert to radians while keeping 0 at 12:00.
  const radians: number = degrees / 180 * Math.PI - Math.PI * 0.5;

  return { zeroAtDegrees: degrees, zeroAtRadians: radians };
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
 * Converts the angle of the mouse from the center into a value between the
 * input's min and max.
 */
export function getValueFromMouse({
  event,
  centerCoords,
  min,
  max,
  counterClockwise,
  zeroAtDegrees,
  currentValue,
}: {
  event: MouseEvent | TouchEvent;
  centerCoords?: [number, number];
  min: number;
  max: number;
  counterClockwise: boolean;
  zeroAtDegrees: number;
  currentValue: number;
}) {
  if (centerCoords) {
    // Get radians between mouse and center of track:
    const [cx, cy] = centerCoords;

    const { clientX, clientY } = getClientCoordinates(event);
    let radians = Math.atan2(clientY - cy, clientX - cx);

    // Set radians back to 0 or 12:00:
    radians += Math.PI * 0.5;

    if (radians < 0) {
      // Ensure 0 <= radians <= 6.28:
      radians += Math.PI * 2;
    }

    if (counterClockwise) {
      // "Flip" the radians to get counter-clockwise values:
      radians = Math.PI * 2 - radians;
    }

    // Convert the radians to a percent:
    let percent = radians / (Math.PI * 2);

    // Account for prop zeroAtDegrees:
    percent -= (counterClockwise ? -1 : 1) * (zeroAtDegrees / 360);
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

function getClientCoordinates(event: MouseEvent | TouchEvent) {
  if ('touches' in event) {
    return { clientX: event.touches[0].clientX, clientY: event.touches[0].clientY };
  }
  return { clientX: event.clientX, clientY: event.clientY };
}