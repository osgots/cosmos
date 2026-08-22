import {
  createTesseract
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity tesseract geometry", () => {
  test("contains exactly 16 vertices", () => {
    const tesseract =
      createTesseract();

    expect(
      tesseract.vertices
    ).toHaveLength(16);
  });

  test("contains exactly 32 unique edges", () => {
    const tesseract =
      createTesseract();

    expect(
      tesseract.edges
    ).toHaveLength(32);

    const uniqueEdges =
      new Set(
        tesseract.edges.map(
          ([a, b]) =>
            `${Math.min(a, b)}:${Math.max(a, b)}`
        )
      );

    expect(
      uniqueEdges.size
    ).toBe(32);
  });

  test("default vertices lie at every ±1 coordinate combination", () => {
    const tesseract =
      createTesseract();

    for (
      const vertex of
        tesseract.vertices
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

      expect(
        Math.abs(vertex.w)
      ).toBe(1);
    }
  });

  test("custom edge length scales the tesseract correctly", () => {
    const tesseract =
      createTesseract(10);

    expect(
      tesseract.edgeLength
    ).toBe(10);

    for (
      const vertex of
        tesseract.vertices
    ) {
      expect(
        Math.abs(vertex.x)
      ).toBe(5);

      expect(
        Math.abs(vertex.y)
      ).toBe(5);

      expect(
        Math.abs(vertex.z)
      ).toBe(5);

      expect(
        Math.abs(vertex.w)
      ).toBe(5);
    }
  });

  test("rejects invalid edge lengths", () => {
    expect(() =>
      createTesseract(0)
    ).toThrow(RangeError);

    expect(() =>
      createTesseract(-1)
    ).toThrow(RangeError);

    expect(() =>
      createTesseract(
        Number.NaN
      )
    ).toThrow(RangeError);

    expect(() =>
      createTesseract(
        Number.POSITIVE_INFINITY
      )
    ).toThrow(RangeError);
  });

  test("tesseract structure is immutable", () => {
    const tesseract =
      createTesseract();

    expect(
      Object.isFrozen(tesseract)
    ).toBe(true);

    expect(
      Object.isFrozen(
        tesseract.vertices
      )
    ).toBe(true);

    expect(
      Object.isFrozen(
        tesseract.edges
      )
    ).toBe(true);

    for (
      const edge of
        tesseract.edges
    ) {
      expect(
        Object.isFrozen(edge)
      ).toBe(true);
    }
  });
});
