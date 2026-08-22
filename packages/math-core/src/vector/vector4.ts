import { vector4 } from "./create";
import type { Vector4 } from "./types";

export function addVector4(
  a: Vector4,
  b: Vector4
): Vector4 {
  return vector4(
    a.x + b.x,
    a.y + b.y,
    a.z + b.z,
    a.w + b.w
  );
}

export function subtractVector4(
  a: Vector4,
  b: Vector4
): Vector4 {
  return vector4(
    a.x - b.x,
    a.y - b.y,
    a.z - b.z,
    a.w - b.w
  );
}

export function scaleVector4(
  vector: Vector4,
  scalar: number
): Vector4 {
  if (!Number.isFinite(scalar)) {
    throw new RangeError(
      `Scalar must be finite. Received: ${scalar}`
    );
  }

  return vector4(
    vector.x * scalar,
    vector.y * scalar,
    vector.z * scalar,
    vector.w * scalar
  );
}

export function dotVector4(
  a: Vector4,
  b: Vector4
): number {
  return (
    a.x * b.x +
    a.y * b.y +
    a.z * b.z +
    a.w * b.w
  );
}

export function squaredMagnitudeVector4(
  vector: Vector4
): number {
  return dotVector4(
    vector,
    vector
  );
}

export function magnitudeVector4(
  vector: Vector4
): number {
  return Math.hypot(
    vector.x,
    vector.y,
    vector.z,
    vector.w
  );
}

export function normalizeVector4(
  vector: Vector4
): Vector4 {
  const magnitude =
    magnitudeVector4(vector);

  if (magnitude === 0) {
    throw new RangeError(
      "Cannot normalize the zero Vector4."
    );
  }

  return scaleVector4(
    vector,
    1 / magnitude
  );
}
