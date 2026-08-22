/**
 * Immutable row-major matrices.
 *
 * Matrix2:
 *
 * [ m00 m01 ]
 * [ m10 m11 ]
 *
 * Matrix3 and Matrix4 follow the same row-major convention.
 */

export type Matrix2 = readonly [
  number, number,
  number, number
];

export type Matrix3 = readonly [
  number, number, number,
  number, number, number,
  number, number, number
];

export type Matrix4 = readonly [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];
