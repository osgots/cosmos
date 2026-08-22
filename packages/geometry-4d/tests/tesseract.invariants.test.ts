import {
  createTesseract
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

function squaredDistance4(
  a: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
  },
  b: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
  }
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  const dw = a.w - b.w;

  return (
    dx * dx +
    dy * dy +
    dz * dz +
    dw * dw
  );
}

describe("COSMOS Infinity tesseract invariants", () => {
  test("every vertex has degree four", () => {
    const tesseract =
      createTesseract();

    const degree =
      Array<number>(16)
        .fill(0);

    for (
      const [a, b] of
        tesseract.edges
    ) {
      degree[a]! += 1;
      degree[b]! += 1;
    }

    expect(
      degree
    ).toEqual(
      Array<number>(16)
        .fill(4)
    );
  });

  test("every edge has exactly the requested 4D length", () => {
    const edgeLength =
      7.5;

    const tesseract =
      createTesseract(
        edgeLength
      );

    const expectedSquaredLength =
      edgeLength *
      edgeLength;

    for (
      const [a, b] of
        tesseract.edges
    ) {
      const start =
        tesseract.vertices[a]!;

      const end =
        tesseract.vertices[b]!;

      expect(
        squaredDistance4(
          start,
          end
        )
      ).toBeCloseTo(
        expectedSquaredLength,
        14
      );
    }
  });

  test("every edge changes exactly one coordinate", () => {
    const tesseract =
      createTesseract();

    for (
      const [a, b] of
        tesseract.edges
    ) {
      const start =
        tesseract.vertices[a]!;

      const end =
        tesseract.vertices[b]!;

      const changedCoordinates = [
        start.x !== end.x,
        start.y !== end.y,
        start.z !== end.z,
        start.w !== end.w
      ].filter(Boolean);

      expect(
        changedCoordinates
      ).toHaveLength(1);
    }
  });

  test("the tesseract is centered on the 4D origin", () => {
    const tesseract =
      createTesseract();

    const sum =
      tesseract.vertices.reduce(
        (accumulator, vertex) => ({
          x:
            accumulator.x +
            vertex.x,

          y:
            accumulator.y +
            vertex.y,

          z:
            accumulator.z +
            vertex.z,

          w:
            accumulator.w +
            vertex.w
        }),
        {
          x: 0,
          y: 0,
          z: 0,
          w: 0
        }
      );

    expect(sum).toEqual({
      x: 0,
      y: 0,
      z: 0,
      w: 0
    });
  });

  test("all 16 vertex coordinate combinations are unique", () => {
    const tesseract =
      createTesseract();

    const coordinates =
      new Set(
        tesseract.vertices.map(
          (vertex) =>
            `${vertex.x},${vertex.y},${vertex.z},${vertex.w}`
        )
      );

    expect(
      coordinates.size
    ).toBe(16);
  });
});
