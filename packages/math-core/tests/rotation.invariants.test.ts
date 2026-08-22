import {
  IDENTITY_MATRIX4,
  ROTATION_PLANES_4,
  RotationPlane4,
  magnitudeVector4,
  matrix4,
  multiplyMatrix4,
  multiplyMatrix4Vector4,
  rotationMatrix4,
  transposeMatrix4,
  vector4
} from "../src/index";

import type {
  Matrix4
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

function expectMatrix4Close(
  actual: Matrix4,
  expected: Matrix4,
  precision = 13
): void {
  for (
    let index = 0;
    index < 16;
    index += 1
  ) {
    expect(actual[index])
      .toBeCloseTo(
        expected[index]!,
        precision
      );
  }
}

describe("COSMOS Infinity rotation invariants", () => {
  test("zero-angle rotation is identity in every 4D plane", () => {
    for (
      const plane of ROTATION_PLANES_4
    ) {
      expectMatrix4Close(
        rotationMatrix4(
          plane,
          0
        ),
        IDENTITY_MATRIX4
      );
    }
  });

  test("every 4D coordinate-plane rotation preserves Euclidean magnitude", () => {
    const vector =
      vector4(
        2.5,
        -7.25,
        11.5,
        3.75
      );

    const originalMagnitude =
      magnitudeVector4(vector);

    for (
      const plane of ROTATION_PLANES_4
    ) {
      const rotated =
        multiplyMatrix4Vector4(
          rotationMatrix4(
            plane,
            1.23456789
          ),
          vector
        );

      expect(
        magnitudeVector4(rotated)
      ).toBeCloseTo(
        originalMagnitude,
        13
      );
    }
  });

  test("transpose is the inverse of every 4D simple rotation", () => {
    for (
      const plane of ROTATION_PLANES_4
    ) {
      const rotation =
        rotationMatrix4(
          plane,
          0.731
        );

      const inverseProduct =
        multiplyMatrix4(
          transposeMatrix4(rotation),
          rotation
        );

      expectMatrix4Close(
        inverseProduct,
        IDENTITY_MATRIX4
      );
    }
  });

  test("four quarter-turns return to the original 4D orientation", () => {
    for (
      const plane of ROTATION_PLANES_4
    ) {
      const quarter =
        rotationMatrix4(
          plane,
          Math.PI / 2
        );

      const half =
        multiplyMatrix4(
          quarter,
          quarter
        );

      const full =
        multiplyMatrix4(
          half,
          half
        );

      expectMatrix4Close(
        full,
        IDENTITY_MATRIX4
      );
    }
  });

  test("rotations in disjoint 4D planes commute", () => {
    const xy =
      rotationMatrix4(
        RotationPlane4.XY,
        0.72
      );

    const zw =
      rotationMatrix4(
        RotationPlane4.ZW,
        -1.11
      );

    expectMatrix4Close(
      multiplyMatrix4(xy, zw),
      multiplyMatrix4(zw, xy)
    );
  });

  test("rotations sharing a 4D coordinate generally do not commute", () => {
    const xy =
      rotationMatrix4(
        RotationPlane4.XY,
        0.6
      );

    const xw =
      rotationMatrix4(
        RotationPlane4.XW,
        0.9
      );

    const left =
      multiplyMatrix4(
        xy,
        xw
      );

    const right =
      multiplyMatrix4(
        xw,
        xy
      );

    expect(left)
      .not.toEqual(right);
  });

  test("representative composed 4D rotation remains orthogonal", () => {
    const xy =
      rotationMatrix4(
        RotationPlane4.XY,
        0.4
      );

    const xw =
      rotationMatrix4(
        RotationPlane4.XW,
        -0.8
      );

    const yz =
      rotationMatrix4(
        RotationPlane4.YZ,
        1.2
      );

    const composed =
      multiplyMatrix4(
        xy,
        multiplyMatrix4(
          xw,
          yz
        )
      );

    const orthogonalityCheck =
      multiplyMatrix4(
        transposeMatrix4(composed),
        composed
      );

    expectMatrix4Close(
      orthogonalityCheck,
      IDENTITY_MATRIX4,
      12
    );
  });

  test("known matrix layout remains row-major after rotation work", () => {
    const known =
      matrix4(
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      );

    expect(known[0]).toBe(1);
    expect(known[3]).toBe(4);
    expect(known[4]).toBe(5);
    expect(known[15]).toBe(16);
  });
});
