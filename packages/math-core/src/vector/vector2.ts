import { vector2 } from "./create";
import type { Vector2 } from "./types";

export function addVector2(
  a: Vector2,
  b: Vector2
): Vector2 {
  return vector2(
    a.x + b.x,
    a.y + b.y
  );
}

export function subtractVector2(
  a: Vector2,
  b: Vector2
): Vector2 {
  return vector2(
    a.x - b.x,
    a.y - b.y
  );
}

export function scaleVector2(
  vector: Vector2,
  scalar: number
): Vector2 {
  if (!Number.isFinite(scalar)) {
    throw new RangeError(
      `Scalar must be finite. Received: ${scalar}`
    );
  }

  return vector2(
    vector.x * scalar,
    vector.y * scalar
  );
}

export function dotVector2(
  a: Vector2,
  b: Vector2
): number {
  return a.x * b.x + a.y * b.y;
}

export function squaredMagnitudeVector2(
  vector: Vector2
): number {
  return dotVector2(vector, vector);
}

export function magnitudeVector2(
  vector: Vector2
): number {
  return Math.hypot(
    vector.x,
    vector.y
  );
}

export function normalizeVector2(
  vector: Vector2
): Vector2 {
  const magnitude =
    magnitudeVector2(vector);

  if (magnitude === 0) {
    throw new RangeError(
      "Cannot normalize the zero Vector2."
    );
  }

  return scaleVector2(
    vector,
    1 / magnitude
  );
}
