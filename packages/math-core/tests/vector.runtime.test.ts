import {
  addVector2,
  addVector3,
  addVector4,
  crossVector3,
  dotVector2,
  dotVector3,
  dotVector4,
  magnitudeVector2,
  magnitudeVector3,
  magnitudeVector4,
  normalizeVector2,
  normalizeVector3,
  normalizeVector4,
  squaredMagnitudeVector2,
  squaredMagnitudeVector3,
  squaredMagnitudeVector4,
  vector2,
  vector3,
  vector4
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity vector mathematics", () => {
  test("creates immutable vectors", () => {
    expect(
      Object.isFrozen(vector2(1, 2))
    ).toBe(true);

    expect(
      Object.isFrozen(vector3(1, 2, 3))
    ).toBe(true);

    expect(
      Object.isFrozen(vector4(1, 2, 3, 4))
    ).toBe(true);
  });

  test("rejects non-finite vector components", () => {
    expect(() =>
      vector3(
        Number.NaN,
        0,
        0
      )
    ).toThrow(RangeError);

    expect(() =>
      vector4(
        0,
        0,
        0,
        Number.POSITIVE_INFINITY
      )
    ).toThrow(RangeError);
  });

  test("adds Vector2 values correctly", () => {
    expect(
      addVector2(
        vector2(1, 2),
        vector2(3, 4)
      )
    ).toEqual({
      x: 4,
      y: 6
    });
  });

  test("adds Vector3 values correctly", () => {
    expect(
      addVector3(
        vector3(1, 2, 3),
        vector3(4, 5, 6)
      )
    ).toEqual({
      x: 5,
      y: 7,
      z: 9
    });
  });

  test("adds Vector4 values correctly", () => {
    expect(
      addVector4(
        vector4(1, 2, 3, 4),
        vector4(5, 6, 7, 8)
      )
    ).toEqual({
      x: 6,
      y: 8,
      z: 10,
      w: 12
    });
  });

  test("dot product with itself equals squared magnitude", () => {
    const v2 = vector2(3, 4);
    const v3 = vector3(2, -3, 6);
    const v4 = vector4(1, 2, 3, 4);

    expect(dotVector2(v2, v2))
      .toBe(squaredMagnitudeVector2(v2));

    expect(dotVector3(v3, v3))
      .toBe(squaredMagnitudeVector3(v3));

    expect(dotVector4(v4, v4))
      .toBe(squaredMagnitudeVector4(v4));
  });

  test("computes familiar Euclidean magnitudes", () => {
    expect(
      magnitudeVector2(
        vector2(3, 4)
      )
    ).toBe(5);

    expect(
      magnitudeVector3(
        vector3(2, 3, 6)
      )
    ).toBe(7);

    expect(
      magnitudeVector4(
        vector4(1, 2, 2, 4)
      )
    ).toBe(5);
  });

  test("normalization produces unit vectors", () => {
    expect(
      magnitudeVector2(
        normalizeVector2(
          vector2(3, 4)
        )
      )
    ).toBeCloseTo(1, 14);

    expect(
      magnitudeVector3(
        normalizeVector3(
          vector3(2, 3, 6)
        )
      )
    ).toBeCloseTo(1, 14);

    expect(
      magnitudeVector4(
        normalizeVector4(
          vector4(1, 2, 2, 4)
        )
      )
    ).toBeCloseTo(1, 14);
  });

  test("rejects zero-vector normalization", () => {
    expect(() =>
      normalizeVector2(
        vector2(0, 0)
      )
    ).toThrow(RangeError);

    expect(() =>
      normalizeVector3(
        vector3(0, 0, 0)
      )
    ).toThrow(RangeError);

    expect(() =>
      normalizeVector4(
        vector4(0, 0, 0, 0)
      )
    ).toThrow(RangeError);
  });

  test("3D cross product is perpendicular to both inputs", () => {
    const a = vector3(
      2,
      3,
      4
    );

    const b = vector3(
      5,
      6,
      7
    );

    const cross =
      crossVector3(a, b);

    expect(
      dotVector3(cross, a)
    ).toBeCloseTo(0, 14);

    expect(
      dotVector3(cross, b)
    ).toBeCloseTo(0, 14);
  });

  test("standard basis cross product obeys right-hand orientation", () => {
    const x = vector3(1, 0, 0);
    const y = vector3(0, 1, 0);

    expect(
      crossVector3(x, y)
    ).toEqual({
      x: 0,
      y: 0,
      z: 1
    });
  });
});
