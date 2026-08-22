import { vector3 } from "./create";
import type { Vector3 } from "./types";

export function addVector3(
  a: Vector3,
  b: Vector3
): Vector3 {
  return vector3(
    a.x + b.x,
    a.y + b.y,
    a.z + b.z
  );
}

export function subtractVector3(
  a: Vector3,
  b: Vector3
): Vector3 {
  return vector3(
    a.x - b.x,
    a.y - b.y,
    a.z - b.z
  );
}

export function scaleVector3(
  vector: Vector3,
  scalar: number
): Vector3 {
  if (!Number.isFinite(scalar)) {
    throw new RangeError(
      `Scalar must be finite. Received: ${scalar}`
    );
  }

  return vector3(
    vector.x * scalar,
    vector.y * scalar,
    vector.z * scalar
  );
}

export function dotVector3(
  a: Vector3,
  b: Vector3
): number {
  return (
    a.x * b.x +
    a.y * b.y +
    a.z * b.z
  );
}

export function crossVector3(
  a: Vector3,
  b: Vector3
): Vector3 {
  return vector3(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}

export function squaredMagnitudeVector3(
  vector: Vector3
): number {
  return dotVector3(vector, vector);
}

export function magnitudeVector3(
  vector: Vector3
): number {
  return Math.hypot(
    vector.x,
    vector.y,
    vector.z
  );
}

export function normalizeVector3(
  vector: Vector3
): Vector3 {
  const magnitude =
    magnitudeVector3(vector);

  if (magnitude === 0) {
    throw new RangeError(
      "Cannot normalize the zero Vector3."
    );
  }

  return scaleVector3(
    vector,
    1 / magnitude
  );
}
