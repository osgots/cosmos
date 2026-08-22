import {
  matrix4,
  multiplyMatrix4,
  multiplyMatrix4Vector4,
  vector4
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity matrix invariants", () => {
  test("Matrix4 multiplication is associative for representative matrices", () => {
    const a = matrix4(
      1, 2, 0, 0,
      0, 1, 3, 0,
      0, 0, 1, 4,
      5, 0, 0, 1
    );

    const b = matrix4(
      2, 0, 1, 0,
      0, 3, 0, 1,
      1, 0, 4, 0,
      0, 1, 0, 5
    );

    const c = matrix4(
      1, 1, 0, 0,
      0, 1, 1, 0,
      0, 0, 1, 1,
      1, 0, 0, 1
    );

    const left =
      multiplyMatrix4(
        multiplyMatrix4(a, b),
        c
      );

    const right =
      multiplyMatrix4(
        a,
        multiplyMatrix4(b, c)
      );

    expect(left).toEqual(right);
  });

  test("matrix composition agrees with sequential vector transformation", () => {
    const a = matrix4(
      1, 2, 0, 0,
      0, 1, 3, 0,
      0, 0, 1, 4,
      0, 0, 0, 1
    );

    const b = matrix4(
      2, 0, 0, 0,
      0, 3, 0, 0,
      0, 0, 4, 0,
      0, 0, 0, 5
    );

    const vector =
      vector4(
        1,
        2,
        3,
        4
      );

    const composed =
      multiplyMatrix4Vector4(
        multiplyMatrix4(a, b),
        vector
      );

    const sequential =
      multiplyMatrix4Vector4(
        a,
        multiplyMatrix4Vector4(
          b,
          vector
        )
      );

    expect(composed).toEqual(sequential);
  });

  test("matrix multiplication is not generally commutative", () => {
    const a = matrix4(
      1, 1, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );

    const b = matrix4(
      2, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );

    expect(
      multiplyMatrix4(a, b)
    ).not.toEqual(
      multiplyMatrix4(b, a)
    );
  });
});
