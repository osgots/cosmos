/**
 * High-precision local coordinate inside a universe sector.
 *
 * Local coordinates intentionally remain JavaScript numbers because
 * rendering and ordinary local physics benefit from fast IEEE-754
 * floating-point arithmetic.
 */
export interface LocalCoordinate3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export function localCoordinate3(
  x: number,
  y: number,
  z: number
): LocalCoordinate3 {
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(z)
  ) {
    throw new RangeError(
      "Local coordinates must contain only finite values."
    );
  }

  return Object.freeze({
    x,
    y,
    z
  });
}
