import {
  RotationPlane4,
  multiplyMatrix2Vector2,
  multiplyMatrix3Vector3,
  multiplyMatrix4Vector4,
  rotationMatrix2,
  rotationMatrix3X,
  rotationMatrix3Y,
  rotationMatrix3Z,
  rotationMatrix4,
  vector2,
  vector3,
  vector4
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

function expectVector4Close(
  actual: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
  },
  expected: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
  }
): void {
  expect(actual.x)
    .toBeCloseTo(expected.x, 14);

  expect(actual.y)
    .toBeCloseTo(expected.y, 14);

  expect(actual.z)
    .toBeCloseTo(expected.z, 14);

  expect(actual.w)
    .toBeCloseTo(expected.w, 14);
}

describe("COSMOS Infinity rotation matrices", () => {
  const quarterTurn =
    Math.PI / 2;

  test("2D positive quarter-turn maps +X to +Y", () => {
    const result =
      multiplyMatrix2Vector2(
        rotationMatrix2(
          quarterTurn
        ),
        vector2(1, 0)
      );

    expect(result.x)
      .toBeCloseTo(0, 14);

    expect(result.y)
      .toBeCloseTo(1, 14);
  });

  test("3D X rotation maps +Y toward +Z", () => {
    const result =
      multiplyMatrix3Vector3(
        rotationMatrix3X(
          quarterTurn
        ),
        vector3(0, 1, 0)
      );

    expect(result.x)
      .toBeCloseTo(0, 14);

    expect(result.y)
      .toBeCloseTo(0, 14);

    expect(result.z)
      .toBeCloseTo(1, 14);
  });

  test("3D Y rotation maps +Z toward +X", () => {
    const result =
      multiplyMatrix3Vector3(
        rotationMatrix3Y(
          quarterTurn
        ),
        vector3(0, 0, 1)
      );

    expect(result.x)
      .toBeCloseTo(1, 14);

    expect(result.y)
      .toBeCloseTo(0, 14);

    expect(result.z)
      .toBeCloseTo(0, 14);
  });

  test("3D Z rotation maps +X toward +Y", () => {
    const result =
      multiplyMatrix3Vector3(
        rotationMatrix3Z(
          quarterTurn
        ),
        vector3(1, 0, 0)
      );

    expect(result.x)
      .toBeCloseTo(0, 14);

    expect(result.y)
      .toBeCloseTo(1, 14);

    expect(result.z)
      .toBeCloseTo(0, 14);
  });

  test("4D XY rotation maps +X toward +Y", () => {
    const result =
      multiplyMatrix4Vector4(
        rotationMatrix4(
          RotationPlane4.XY,
          quarterTurn
        ),
        vector4(1, 0, 0, 0)
      );

    expectVector4Close(
      result,
      vector4(0, 1, 0, 0)
    );
  });

  test("4D XZ rotation maps +X toward +Z", () => {
    const result =
      multiplyMatrix4Vector4(
        rotationMatrix4(
          RotationPlane4.XZ,
          quarterTurn
        ),
        vector4(1, 0, 0, 0)
      );

    expectVector4Close(
      result,
      vector4(0, 0, 1, 0)
    );
  });

  test("4D XW rotation maps +X toward +W", () => {
    const result =
      multiplyMatrix4Vector4(
        rotationMatrix4(
          RotationPlane4.XW,
          quarterTurn
        ),
        vector4(1, 0, 0, 0)
      );

    expectVector4Close(
      result,
      vector4(0, 0, 0, 1)
    );
  });

  test("4D YZ rotation maps +Y toward +Z", () => {
    const result =
      multiplyMatrix4Vector4(
        rotationMatrix4(
          RotationPlane4.YZ,
          quarterTurn
        ),
        vector4(0, 1, 0, 0)
      );

    expectVector4Close(
      result,
      vector4(0, 0, 1, 0)
    );
  });

  test("4D YW rotation maps +Y toward +W", () => {
    const result =
      multiplyMatrix4Vector4(
        rotationMatrix4(
          RotationPlane4.YW,
          quarterTurn
        ),
        vector4(0, 1, 0, 0)
      );

    expectVector4Close(
      result,
      vector4(0, 0, 0, 1)
    );
  });

  test("4D ZW rotation maps +Z toward +W", () => {
    const result =
      multiplyMatrix4Vector4(
        rotationMatrix4(
          RotationPlane4.ZW,
          quarterTurn
        ),
        vector4(0, 0, 1, 0)
      );

    expectVector4Close(
      result,
      vector4(0, 0, 0, 1)
    );
  });

  test("rejects non-finite rotation angles", () => {
    expect(() =>
      rotationMatrix4(
        RotationPlane4.XW,
        Number.NaN
      )
    ).toThrow(RangeError);

    expect(() =>
      rotationMatrix2(
        Number.POSITIVE_INFINITY
      )
    ).toThrow(RangeError);
  });
});
