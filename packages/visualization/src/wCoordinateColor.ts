import type {
  RenderColor3
} from "@cosmos/renderer";

const NEGATIVE_W_COLOR:
  RenderColor3 =
    Object.freeze({
      r: 0.18,
      g: 0.62,
      b: 1
    });

const ZERO_W_COLOR:
  RenderColor3 =
    Object.freeze({
      r: 1,
      g: 1,
      b: 1
    });

const POSITIVE_W_COLOR:
  RenderColor3 =
    Object.freeze({
      r: 1,
      g: 0.42,
      b: 0.12
    });

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}

function interpolate(
  start: number,
  end: number,
  amount: number
): number {
  return (
    start +
    (
      end -
      start
    ) *
    amount
  );
}

function interpolateColor(
  start: RenderColor3,
  end: RenderColor3,
  amount: number
): RenderColor3 {
  const safeAmount =
    clamp(
      amount,
      0,
      1
    );

  return Object.freeze({
    r:
      interpolate(
        start.r,
        end.r,
        safeAmount
      ),

    g:
      interpolate(
        start.g,
        end.g,
        safeAmount
      ),

    b:
      interpolate(
        start.b,
        end.b,
        safeAmount
      )
  });
}

/**
 * Encodes a fourth-dimensional W coordinate as a renderer color.
 *
 * This is a visualization aid only.
 *
 * It does NOT represent an intrinsic physical color or measured
 * property of the tesseract.
 *
 * Mapping:
 *
 *   normalizedW = -1 -> cool endpoint
 *   normalizedW =  0 -> neutral white
 *   normalizedW = +1 -> warm endpoint
 *
 * Values outside [-1, 1] are clamped.
 */
export function colorFromNormalizedW(
  normalizedW: number
): RenderColor3 {
  if (
    !Number.isFinite(
      normalizedW
    )
  ) {
    throw new RangeError(
      "Normalized W coordinate must be finite."
    );
  }

  const w =
    clamp(
      normalizedW,
      -1,
      1
    );

  /**
   * Return canonical endpoint values directly.
   *
   * Besides documenting the exact semantics of the visualization
   * scale, this prevents endpoint values from accumulating tiny
   * IEEE-754 interpolation-rounding differences.
   */
  if (w === -1) {
    return NEGATIVE_W_COLOR;
  }

  if (w === 0) {
    return ZERO_W_COLOR;
  }

  if (w === 1) {
    return POSITIVE_W_COLOR;
  }

  if (w < 0) {
    return interpolateColor(
      NEGATIVE_W_COLOR,
      ZERO_W_COLOR,
      w + 1
    );
  }

  return interpolateColor(
    ZERO_W_COLOR,
    POSITIVE_W_COLOR,
    w
  );
}
