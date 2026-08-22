import {
  IDENTITY_MATRIX2,
  IDENTITY_MATRIX3,
  IDENTITY_MATRIX4,
  matrix2,
  matrix3,
  matrix4,
  multiplyMatrix2Vector2,
  multiplyMatrix3Vector3,
  multiplyMatrix4,
  multiplyMatrix4Vector4,
  transposeMatrix2,
  transposeMatrix3,
  transposeMatrix4,
  vector2,
  vector3,
  vector4
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity matrix mathematics", () => {
  test("creates immutable matrices", () => {
    expect(
      Object.isFrozen(
        matrix2(
          1, 2,
          3, 4
        )
      )
    ).toBe(true);

    expect(
      Object.isFrozen(
        matrix4(
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1
        )
      )
    ).toBe(true);
  });

  test("rejects non-finite matrix components", () => {
    expect(() =>
      matrix3(
        1, 0, 0,
        0, Number.NaN, 0,
        0, 0, 1
      )
    ).toThrow(RangeError);
  });

  test("Matrix2 identity preserves Vector2", () => {
    const vector = vector2(3, -7);

    expect(
      multiplyMatrix2Vector2(
        IDENTITY_MATRIX2,
        vector
      )
    ).toEqual(vector);
  });

  test("Matrix3 identity preserves Vector3", () => {
    const vector = vector3(
      3,
      -7,
      11
    );

    expect(
      multiplyMatrix3Vector3(
        IDENTITY_MATRIX3,
        vector
      )
    ).toEqual(vector);
  });

  test("Matrix4 identity preserves Vector4", () => {
    const vector = vector4(
      2,
      3,
      5,
      7
    );

    expect(
      multiplyMatrix4Vector4(
        IDENTITY_MATRIX4,
        vector
      )
    ).toEqual(vector);
  });

  test("Matrix2 multiplication follows row-major convention", () => {
    const matrix =
      matrix2(
        1, 2,
        3, 4
      );

    expect(
      multiplyMatrix2Vector2(
        matrix,
        vector2(5, 6)
      )
    ).toEqual({
      x: 17,
      y: 39
    });
  });

  test("Matrix4 multiplication with identity preserves the matrix", () => {
    const matrix =
      matrix4(
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      );

    expect(
      multiplyMatrix4(
        matrix,
        IDENTITY_MATRIX4
      )
    ).toEqual(matrix);

    expect(
      multiplyMatrix4(
        IDENTITY_MATRIX4,
        matrix
      )
    ).toEqual(matrix);
  });

  test("Matrix2 transpose swaps rows and columns", () => {
    expect(
      transposeMatrix2(
        matrix2(
          1, 2,
          3, 4
        )
      )
    ).toEqual([
      1, 3,
      2, 4
    ]);
  });

  test("Matrix3 transpose swaps rows and columns", () => {
    expect(
      transposeMatrix3(
        matrix3(
          1, 2, 3,
          4, 5, 6,
          7, 8, 9
        )
      )
    ).toEqual([
      1, 4, 7,
      2, 5, 8,
      3, 6, 9
    ]);
  });

  test("Matrix4 double transpose returns the original matrix", () => {
    const matrix =
      matrix4(
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      );

    expect(
      transposeMatrix4(
        transposeMatrix4(matrix)
      )
    ).toEqual(matrix);
  });
});
