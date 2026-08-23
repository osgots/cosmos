import {
  RotationPlane4,
  multiplyMatrix4,
  rotationMatrix4
} from "@cosmos/math-core";

import {
  createTesseract,
  sliceTesseractAtW,
  transformTesseract
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity true 4D slicing", () => {
  test("central slice of the default tesseract is a cube", () => {
    const slice =
      sliceTesseractAtW(
        createTesseract(),
        0
      );

    expect(
      slice.vertices
    ).toHaveLength(8);

    expect(
      slice.edges
    ).toHaveLength(12);
  });

  test("central unrotated slice has coordinates at ±1", () => {
    const slice =
      sliceTesseractAtW(
        createTesseract(),
        0
      );

    for (
      const vertex of
        slice.vertices
    ) {
      expect(
        Math.abs(vertex.x)
      ).toBe(1);

      expect(
        Math.abs(vertex.y)
      ).toBe(1);

      expect(
        Math.abs(vertex.z)
      ).toBe(1);
    }
  });

  test("interior W slice remains a cube", () => {
    const slice =
      sliceTesseractAtW(
        createTesseract(),
        0.5
      );

    expect(
      slice.vertices
    ).toHaveLength(8);

    expect(
      slice.edges
    ).toHaveLength(12);
  });

  test("boundary slice at W = 1 produces the boundary cube", () => {
    const slice =
      sliceTesseractAtW(
        createTesseract(),
        1
      );

    expect(
      slice.vertices
    ).toHaveLength(8);

    expect(
      slice.edges
    ).toHaveLength(12);
  });

  test("slice outside the tesseract is empty", () => {
    const slice =
      sliceTesseractAtW(
        createTesseract(),
        2
      );

    expect(
      slice.vertices
    ).toHaveLength(0);

    expect(
      slice.edges
    ).toHaveLength(0);
  });

  test("rejects invalid slicing parameters", () => {
    const tesseract =
      createTesseract();

    expect(() =>
      sliceTesseractAtW(
        tesseract,
        Number.NaN
      )
    ).toThrow(RangeError);

    expect(() =>
      sliceTesseractAtW(
        tesseract,
        Number.POSITIVE_INFINITY
      )
    ).toThrow(RangeError);

    expect(() =>
      sliceTesseractAtW(
        tesseract,
        0,
        0
      )
    ).toThrow(RangeError);

    expect(() =>
      sliceTesseractAtW(
        tesseract,
        0,
        Number.NaN
      )
    ).toThrow(RangeError);
  });

  test("rotated tesseract can be sliced after a true XW rotation", () => {
    const rotated =
      transformTesseract(
        createTesseract(),
        rotationMatrix4(
          RotationPlane4.XW,
          0.37
        )
      );

    const slice =
      sliceTesseractAtW(
        rotated,
        0
      );

    expect(
      slice.vertices.length
    ).toBeGreaterThan(0);

    expect(
      slice.edges.length
    ).toBeGreaterThan(0);

    for (
      const vertex of
        slice.vertices
    ) {
      expect(
        Number.isFinite(vertex.x)
      ).toBe(true);

      expect(
        Number.isFinite(vertex.y)
      ).toBe(true);

      expect(
        Number.isFinite(vertex.z)
      ).toBe(true);
    }
  });

  test("composed 4D rotations can be sliced", () => {
    const xy =
      rotationMatrix4(
        RotationPlane4.XY,
        0.41
      );

    const xw =
      rotationMatrix4(
        RotationPlane4.XW,
        -0.73
      );

    const yz =
      rotationMatrix4(
        RotationPlane4.YZ,
        1.08
      );

    const transform =
      multiplyMatrix4(
        yz,
        multiplyMatrix4(
          xw,
          xy
        )
      );

    const rotated =
      transformTesseract(
        createTesseract(),
        transform
      );

    const slice =
      sliceTesseractAtW(
        rotated,
        0
      );

    expect(
      slice.vertices.length
    ).toBeGreaterThan(0);

    expect(
      slice.edges.length
    ).toBeGreaterThan(0);
  });
});
