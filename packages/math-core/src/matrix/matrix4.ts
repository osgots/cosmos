import { matrix4 } from "./create";
import type { Matrix4 } from "./types";

import { vector4 } from "../vector/create";
import type { Vector4 } from "../vector/types";

export const IDENTITY_MATRIX4: Matrix4 =
  matrix4(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  );

export function multiplyMatrix4Vector4(
  matrix: Matrix4,
  vector: Vector4
): Vector4 {
  return vector4(
    matrix[0] * vector.x +
      matrix[1] * vector.y +
      matrix[2] * vector.z +
      matrix[3] * vector.w,

    matrix[4] * vector.x +
      matrix[5] * vector.y +
      matrix[6] * vector.z +
      matrix[7] * vector.w,

    matrix[8] * vector.x +
      matrix[9] * vector.y +
      matrix[10] * vector.z +
      matrix[11] * vector.w,

    matrix[12] * vector.x +
      matrix[13] * vector.y +
      matrix[14] * vector.z +
      matrix[15] * vector.w
  );
}

export function multiplyMatrix4(
  a: Matrix4,
  b: Matrix4
): Matrix4 {
  return matrix4(
    a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
    a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
    a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
    a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],

    a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
    a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
    a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
    a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],

    a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12],
    a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13],
    a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
    a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],

    a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12],
    a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13],
    a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14],
    a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]
  );
}

export function transposeMatrix4(
  matrix: Matrix4
): Matrix4 {
  return matrix4(
    matrix[0], matrix[4], matrix[8], matrix[12],
    matrix[1], matrix[5], matrix[9], matrix[13],
    matrix[2], matrix[6], matrix[10], matrix[14],
    matrix[3], matrix[7], matrix[11], matrix[15]
  );
}
