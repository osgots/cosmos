import { matrix2 } from "./create";
import type { Matrix2 } from "./types";

import { vector2 } from "../vector/create";
import type { Vector2 } from "../vector/types";

export const IDENTITY_MATRIX2: Matrix2 =
  matrix2(
    1, 0,
    0, 1
  );

export function multiplyMatrix2Vector2(
  matrix: Matrix2,
  vector: Vector2
): Vector2 {
  return vector2(
    matrix[0] * vector.x +
      matrix[1] * vector.y,

    matrix[2] * vector.x +
      matrix[3] * vector.y
  );
}

export function multiplyMatrix2(
  a: Matrix2,
  b: Matrix2
): Matrix2 {
  return matrix2(
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],

    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3]
  );
}

export function transposeMatrix2(
  matrix: Matrix2
): Matrix2 {
  return matrix2(
    matrix[0], matrix[2],
    matrix[1], matrix[3]
  );
}
