import {
  RotationPlane4,
  rotationMatrix4
} from "@cosmos/math-core";

import {
  createTesseract,
  projectTesseractPerspective,
  projectVector4Orthographic,
  projectVector4Perspective,
  transformTesseract
} from "../src/index";

import {
  vector4
} from "@cosmos/math-core";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity projection invariants", () => {
  test("perspective equals orthographic on W = 0", () => {
    const point =
      vector4(
        7,
        -11,
        13,
        0
      );

    expect(
      projectVector4Perspective(
        point,
        10
      )
    ).toEqual(
      projectVector4Orthographic(
        point
      )
    );
  });

  test("very distant 4D observer approaches orthographic projection", () => {
    const point =
      vector4(
        3,
        -4,
        5,
        2
      );

    const perspective =
      projectVector4Perspective(
        point,
        1e12
      );

    const orthographic =
      projectVector4Orthographic(
        point
      );

    expect(
      perspective.x
    ).toBeCloseTo(
      orthographic.x,
      10
    );

    expect(
      perspective.y
    ).toBeCloseTo(
      orthographic.y,
      10
    );

    expect(
      perspective.z
    ).toBeCloseTo(
      orthographic.z,
      10
    );
  });

  test("projection does not mutate the source tesseract", () => {
    const tesseract =
      createTesseract();

    const snapshot =
      tesseract.vertices.map(
        (vertex) => ({
          x: vertex.x,
          y: vertex.y,
          z: vertex.z,
          w: vertex.w
        })
      );

    projectTesseractPerspective(
      tesseract,
      4
    );

    expect(
      tesseract.vertices
    ).toEqual(snapshot);
  });

  test("a rotated tesseract can be perspective projected", () => {
    const original =
      createTesseract();

    const rotated =
      transformTesseract(
        original,
        rotationMatrix4(
          RotationPlane4.XW,
          0.61
        )
      );

    const projected =
      projectTesseractPerspective(
        rotated,
        4
      );

    expect(
      projected.vertices
    ).toHaveLength(16);

    expect(
      projected.edges
    ).toHaveLength(32);

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

  test("projection preserves every edge index exactly", () => {
    const tesseract =
      createTesseract();

    const projected =
      projectTesseractPerspective(
        tesseract,
        5
      );

    expect(
      projected.edges
    ).toEqual(
      tesseract.edges
    );

    for (
      let index = 0;
      index <
        tesseract.edges.length;
      index += 1
    ) {
      expect(
        projected.edges[index]
      ).toBe(
        tesseract.edges[index]
      );
    }
  });
});
