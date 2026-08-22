import {
  matrix2,
  matrix3,
  matrix4
} from "./create";

import type {
  Matrix2,
  Matrix3,
  Matrix4
} from "./types";

/**
 * The six independent coordinate planes available for simple
 * rotations in four-dimensional Euclidean space.
 *
 * Positive rotation convention:
 *
 * XY : +X -> +Y
 * XZ : +X -> +Z
 * XW : +X -> +W
 * YZ : +Y -> +Z
 * YW : +Y -> +W
 * ZW : +Z -> +W
 *
 * Matrices are row-major and act on column vectors through the
 * existing multiplyMatrixNVectorN functions.
 */
export const RotationPlane4 = {
  XY: "XY",
  XZ: "XZ",
  XW: "XW",
  YZ: "YZ",
  YW: "YW",
  ZW: "ZW"
} as const;

export type RotationPlane4 =
  (typeof RotationPlane4)[keyof typeof RotationPlane4];

/**
 * Canonical ordered collection of all six independent 4D
 * coordinate rotation planes.
 */
export const ROTATION_PLANES_4 = [
  RotationPlane4.XY,
  RotationPlane4.XZ,
  RotationPlane4.XW,
  RotationPlane4.YZ,
  RotationPlane4.YW,
  RotationPlane4.ZW
] as const;

function validateAngle(
  angleRadians: number
): void {
  if (!Number.isFinite(angleRadians)) {
    throw new RangeError(
      `Rotation angle must be finite. Received: ${angleRadians}`
    );
  }
}

function sineCosine(
  angleRadians: number
): readonly [
  cosine: number,
  sine: number
] {
  validateAngle(angleRadians);

  return [
    Math.cos(angleRadians),
    Math.sin(angleRadians)
  ];
}

/**
 * Standard counter-clockwise 2D active rotation.
 *
 * Positive angle maps +X toward +Y.
 */
export function rotationMatrix2(
  angleRadians: number
): Matrix2 {
  const [c, s] =
    sineCosine(angleRadians);

  return matrix2(
     c, -s,
     s,  c
  );
}

/**
 * Right-handed 3D active rotation around the X axis.
 *
 * Positive angle maps +Y toward +Z.
 */
export function rotationMatrix3X(
  angleRadians: number
): Matrix3 {
  const [c, s] =
    sineCosine(angleRadians);

  return matrix3(
    1, 0,  0,
    0, c, -s,
    0, s,  c
  );
}

/**
 * Right-handed 3D active rotation around the Y axis.
 *
 * Positive angle maps +Z toward +X.
 */
export function rotationMatrix3Y(
  angleRadians: number
): Matrix3 {
  const [c, s] =
    sineCosine(angleRadians);

  return matrix3(
     c, 0, s,
     0, 1, 0,
    -s, 0, c
  );
}

/**
 * Right-handed 3D active rotation around the Z axis.
 *
 * Positive angle maps +X toward +Y.
 */
export function rotationMatrix3Z(
  angleRadians: number
): Matrix3 {
  const [c, s] =
    sineCosine(angleRadians);

  return matrix3(
    c, -s, 0,
    s,  c, 0,
    0,  0, 1
  );
}

/**
 * Creates a simple rotation in one of the six independent
 * coordinate planes of 4D Euclidean space.
 *
 * Unlike ordinary 3D language, a 4D simple rotation is naturally
 * identified by its plane rather than by a single perpendicular axis.
 */
export function rotationMatrix4(
  plane: RotationPlane4,
  angleRadians: number
): Matrix4 {
  const [c, s] =
    sineCosine(angleRadians);

  switch (plane) {
    case RotationPlane4.XY:
      return matrix4(
         c, -s, 0, 0,
         s,  c, 0, 0,
         0,  0, 1, 0,
         0,  0, 0, 1
      );

    case RotationPlane4.XZ:
      return matrix4(
         c, 0, -s, 0,
         0, 1,  0, 0,
         s, 0,  c, 0,
         0, 0,  0, 1
      );

    case RotationPlane4.XW:
      return matrix4(
         c, 0, 0, -s,
         0, 1, 0,  0,
         0, 0, 1,  0,
         s, 0, 0,  c
      );

    case RotationPlane4.YZ:
      return matrix4(
        1,  0,  0, 0,
        0,  c, -s, 0,
        0,  s,  c, 0,
        0,  0,  0, 1
      );

    case RotationPlane4.YW:
      return matrix4(
        1, 0,  0,  0,
        0, c,  0, -s,
        0, 0,  1,  0,
        0, s,  0,  c
      );

    case RotationPlane4.ZW:
      return matrix4(
        1, 0, 0,  0,
        0, 1, 0,  0,
        0, 0, c, -s,
        0, 0, s,  c
      );
  }
}
