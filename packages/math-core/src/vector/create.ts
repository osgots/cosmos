import type {
  Vector2,
  Vector3,
  Vector4
} from "./types";

function assertFiniteComponents(
  components: readonly number[]
): void {
  for (const component of components) {
    if (!Number.isFinite(component)) {
      throw new RangeError(
        `Vector components must be finite. Received: ${component}`
      );
    }
  }
}

export function vector2(
  x: number,
  y: number
): Vector2 {
  assertFiniteComponents([x, y]);

  return Object.freeze({
    x,
    y
  });
}

export function vector3(
  x: number,
  y: number,
  z: number
): Vector3 {
  assertFiniteComponents([x, y, z]);

  return Object.freeze({
    x,
    y,
    z
  });
}

export function vector4(
  x: number,
  y: number,
  z: number,
  w: number
): Vector4 {
  assertFiniteComponents([x, y, z, w]);

  return Object.freeze({
    x,
    y,
    z,
    w
  });
}
