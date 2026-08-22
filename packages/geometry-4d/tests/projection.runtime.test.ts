import {
  vector4
} from "@cosmos/math-core";

import {
  createTesseract,
  projectTesseractOrthographic,
  projectTesseractPerspective,
  projectVector4Orthographic,
  projectVector4Perspective
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity 4D to 3D projection", () => {
  test("orthographic projection discards only W", () => {
    expect(
      projectVector4Orthographic(
        vector4(
          2,
          -3,
          5,
          999
        )
      )
    ).toEqual({
      x: 2,
      y: -3,
      z: 5
    });
  });

  test("perspective projection leaves W = 0 points unchanged", () => {
    expect(
      projectVector4Perspective(
        vector4(
          2,
          -3,
          5,
          0
        ),
        4
      )
    ).toEqual({
      x: 2,
      y: -3,
      z: 5
    });
  });

  test("positive W makes a point appear larger", () => {
    const result =
      projectVector4Perspective(
        vector4(
          1,
          2,
          3,
          2
        ),
        4
      );

    expect(result).toEqual({
      x: 2,
      y: 4,
      z: 6
    });
  });

  test("negative W makes a point appear smaller", () => {
    const result =
      projectVector4Perspective(
        vector4(
          2,
          4,
          6,
          -4
        ),
        4
      );

    expect(result).toEqual({
      x: 1,
      y: 2,
      z: 3
    });
  });

  test("rejects invalid projection distances", () => {
    const point =
      vector4(
        1,
        2,
        3,
        0
      );

    expect(() =>
      projectVector4Perspective(
        point,
        0
      )
    ).toThrow(RangeError);

    expect(() =>
      projectVector4Perspective(
        point,
        -1
      )
    ).toThrow(RangeError);

    expect(() =>
      projectVector4Perspective(
        point,
        Number.NaN
      )
    ).toThrow(RangeError);

    expect(() =>
      projectVector4Perspective(
        point,
        Number.POSITIVE_INFINITY
      )
    ).toThrow(RangeError);
  });

  test("rejects a point on the W projection singularity", () => {
    expect(() =>
      projectVector4Perspective(
        vector4(
          1,
          1,
          1,
          4
        ),
        4
      )
    ).toThrow(RangeError);
  });

  test("rejects points behind the projection center", () => {
    expect(() =>
      projectVector4Perspective(
        vector4(
          1,
          1,
          1,
          5
        ),
        4
      )
    ).toThrow(RangeError);
  });

  test("orthographic tesseract projection preserves topology", () => {
    const tesseract =
      createTesseract();

    const projected =
      projectTesseractOrthographic(
        tesseract
      );

    expect(
      projected.vertices
    ).toHaveLength(16);

    expect(
      projected.edges
    ).toHaveLength(32);

    expect(
      projected.edges
    ).toBe(
      tesseract.edges
    );
  });

  test("perspective tesseract projection preserves topology", () => {
    const tesseract =
      createTesseract();

    const projected =
      projectTesseractPerspective(
        tesseract,
        4
      );

    expect(
      projected.vertices
    ).toHaveLength(16);

    expect(
      projected.edges
    ).toHaveLength(32);

    expect(
      projected.edges
    ).toBe(
      tesseract.edges
    );
  });

  test("projected tesseract coordinates remain finite", () => {
    const projected =
      projectTesseractPerspective(
        createTesseract(),
        4
      );

    for (
      const vertex of
        projected.vertices
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
});
