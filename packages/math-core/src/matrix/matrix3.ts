import { matrix3 } from "./create";
import type { Matrix3 } from "./types";

import { vector3 } from "../vector/create";
import type { Vector3 } from "../vector/types";

export const IDENTITY_MATRIX3: Matrix3 =
  matrix3(
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  );

export function multiplyMatrix3Vector3(
  matrix: Matrix3,
  vector: Vector3
): Vector3 {
  return vector3(
    matrix[0] * vector.x +
      matrix[1] * vector.y +
      matrix[2] * vector.z,

    matrix[3] * vector.x +
      matrix[4] * vector.y +
      matrix[5] * vector.z,

    matrix[6] * vector.x +
      matrix[7] * vector.y +
      matrix[8] * vector.z
  );
}

export function multiplyMatrix3(
  a: Matrix3,
  b: Matrix3
): Matrix3 {
  return matrix3(
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],

    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],

    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8]
  );
}

export function transposeMatrix3(
  matrix: Matrix3
): Matrix3 {
  return matrix3(
    matrix[0], matrix[3], matrix[6],
    matrix[1], matrix[4], matrix[7],
    matrix[2], matrix[5], matrix[8]
  );
}
