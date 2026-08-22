import type { Dimension } from "./dimensions";

/**
 * A physical quantity represented internally in canonical SI units.
 *
 * Examples:
 *
 * Length:
 *   siValue = meters
 *
 * Time:
 *   siValue = seconds
 *
 * Mass:
 *   siValue = kilograms
 *
 * A Quantity is deliberately an object instead of a branded number.
 * This prevents accidental arithmetic such as:
 *
 *   length + time
 *
 * through JavaScript's native numeric operators.
 */
export interface Quantity<D extends Dimension> {
  readonly siValue: number;
  readonly dimension: D;
}

/**
 * Internal constructor shared by the units package.
 *
 * Non-finite physical quantities are rejected at the boundary instead
 * of being allowed to silently propagate NaN or Infinity.
 */
export function createQuantity<D extends Dimension>(
  siValue: number,
  dimension: D
): Quantity<D> {
  if (!Number.isFinite(siValue)) {
    throw new RangeError(
      `Physical quantity must be finite. Received: ${siValue}`
    );
  }

  return Object.freeze({
    siValue,
    dimension
  });
}
