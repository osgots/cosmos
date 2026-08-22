import {
  addVector3,
  addVector4,
  crossVector3,
  dotVector3,
  magnitudeVector3,
  magnitudeVector4,
  normalizeVector3,
  normalizeVector4,
  scaleVector3,
  vector3,
  vector4
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity vector invariants", () => {
  test("Vector4 addition is commutative", () => {
    const a = vector4(1, -2, 3, 4);
    const b = vector4(5, 6, -7, 8);

    expect(
      addVector4(a, b)
    ).toEqual(
      addVector4(b, a)
    );
  });

  test("Vector3 dot product is symmetric", () => {
    const a = vector3(2, -4, 7);
    const b = vector3(-3, 5, 11);

    expect(
      dotVector3(a, b)
    ).toBe(
      dotVector3(b, a)
    );
  });

  test("scalar multiplication distributes over vector addition", () => {
    const a = vector3(1, 2, 3);
    const b = vector3(4, -5, 6);

    const left = scaleVector3(
      addVector3(a, b),
      3
    );

    const right = addVector3(
      scaleVector3(a, 3),
      scaleVector3(b, 3)
    );

    expect(left).toEqual(right);
  });

  test("3D cross product is anti-commutative", () => {
    const a = vector3(2, 3, 5);
    const b = vector3(7, 11, 13);

    const ab = crossVector3(a, b);
    const ba = crossVector3(b, a);

    expect(ab).toEqual(
      scaleVector3(ba, -1)
    );
  });

  test("normalizes extremely large Vector3 values without overflow", () => {
    const huge = vector3(
      1e308,
      1e308,
      0
    );

    const normalized =
      normalizeVector3(huge);

    expect(
      Number.isFinite(normalized.x)
    ).toBe(true);

    expect(
      Number.isFinite(normalized.y)
    ).toBe(true);

    expect(
      magnitudeVector3(normalized)
    ).toBeCloseTo(1, 14);
  });

  test("normalizes extremely small Vector4 values without underflow collapse", () => {
    const tiny = vector4(
      1e-300,
      -1e-300,
      1e-300,
      -1e-300
    );

    const normalized =
      normalizeVector4(tiny);

    expect(
      magnitudeVector4(normalized)
    ).toBeCloseTo(1, 14);
  });

  test("rejects non-finite scalar multiplication", () => {
    expect(() =>
      scaleVector3(
        vector3(1, 2, 3),
        Number.POSITIVE_INFINITY
      )
    ).toThrow(RangeError);

    expect(() =>
      scaleVector3(
        vector3(1, 2, 3),
        Number.NaN
      )
    ).toThrow(RangeError);
  });

  test("orthogonal basis vectors have zero dot product", () => {
    const x = vector3(1, 0, 0);
    const y = vector3(0, 1, 0);
    const z = vector3(0, 0, 1);

    expect(dotVector3(x, y)).toBe(0);
    expect(dotVector3(y, z)).toBe(0);
    expect(dotVector3(z, x)).toBe(0);
  });
});
