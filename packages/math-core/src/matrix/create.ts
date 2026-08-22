import type {
  Matrix2,
  Matrix3,
  Matrix4
} from "./types";

function assertFiniteMatrix(
  values: readonly number[]
): void {
  for (const value of values) {
    if (!Number.isFinite(value)) {
      throw new RangeError(
        `Matrix components must be finite. Received: ${value}`
      );
    }
  }
}

export function matrix2(
  m00: number,
  m01: number,
  m10: number,
  m11: number
): Matrix2 {
  const values = [
    m00, m01,
    m10, m11
  ] as const;

  assertFiniteMatrix(values);

  return Object.freeze(values);
}

export function matrix3(
  m00: number,
  m01: number,
  m02: number,

  m10: number,
  m11: number,
  m12: number,

  m20: number,
  m21: number,
  m22: number
): Matrix3 {
  const values = [
    m00, m01, m02,
    m10, m11, m12,
    m20, m21, m22
  ] as const;

  assertFiniteMatrix(values);

  return Object.freeze(values);
}

export function matrix4(
  m00: number,
  m01: number,
  m02: number,
  m03: number,

  m10: number,
  m11: number,
  m12: number,
  m13: number,

  m20: number,
  m21: number,
  m22: number,
  m23: number,

  m30: number,
  m31: number,
  m32: number,
  m33: number
): Matrix4 {
  const values = [
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33
  ] as const;

  assertFiniteMatrix(values);

  return Object.freeze(values);
}
