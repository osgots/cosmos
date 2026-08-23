import {
  TESSERACT_FACES,
  createTesseract,
  sliceTesseractAtW
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

function canonicalEdgeKey(
  first: number,
  second: number
): string {
  return `${Math.min(first, second)}:${Math.max(first, second)}`;
}

function squaredDistance3(
  a: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  },
  b: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  }
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;

  return (
    dx * dx +
    dy * dy +
    dz * dz
  );
}

describe("COSMOS Infinity slicing invariants", () => {
  test("canonical tesseract contains exactly 24 unique square faces", () => {
    expect(
      TESSERACT_FACES
    ).toHaveLength(24);

    const uniqueFaces =
      new Set(
        TESSERACT_FACES.map(
          (face) =>
            [...face]
              .sort(
                (a, b) =>
                  a - b
              )
              .join(":")
        )
      );

    expect(
      uniqueFaces.size
    ).toBe(24);

    for (
      const face of
        TESSERACT_FACES
    ) {
      expect(
        new Set(face).size
      ).toBe(4);
    }
  });

  test("every tesseract edge belongs to exactly three square faces", () => {
    const edgeIncidence =
      new Map<
        string,
        number
      >();

    for (
      const face of
        TESSERACT_FACES
    ) {
      for (
        let index = 0;
        index < 4;
        index += 1
      ) {
        const nextIndex =
          (index + 1) % 4;

        const key =
          canonicalEdgeKey(
            face[index]!,
            face[nextIndex]!
          );

        edgeIncidence.set(
          key,
          (
            edgeIncidence.get(
              key
            ) ?? 0
          ) + 1
        );
      }
    }

    expect(
      edgeIncidence.size
    ).toBe(32);

    for (
      const incidence of
        edgeIncidence.values()
    ) {
      expect(
        incidence
      ).toBe(3);
    }
  });

  test("central slice contains twelve unique valid edges", () => {
    const slice =
      sliceTesseractAtW(
        createTesseract(),
        0
      );

    const uniqueEdges =
      new Set<string>();

    for (
      const [first, second]
      of slice.edges
    ) {
      expect(first)
        .toBeGreaterThanOrEqual(0);

      expect(second)
        .toBeGreaterThanOrEqual(0);

      expect(first)
        .toBeLessThan(
          slice.vertices.length
        );

      expect(second)
        .toBeLessThan(
          slice.vertices.length
        );

      expect(first)
        .not.toBe(second);

      uniqueEdges.add(
        canonicalEdgeKey(
          first,
          second
        )
      );
    }

    expect(
      uniqueEdges.size
    ).toBe(12);
  });

  test("central slice edges retain the tesseract edge length", () => {
    const edgeLength =
      6;

    const slice =
      sliceTesseractAtW(
        createTesseract(
          edgeLength
        ),
        0
      );

    const expectedSquared =
      edgeLength *
      edgeLength;

    for (
      const [first, second]
      of slice.edges
    ) {
      expect(
        squaredDistance3(
          slice.vertices[
            first
          ]!,
          slice.vertices[
            second
          ]!
        )
      ).toBeCloseTo(
        expectedSquared,
        13
      );
    }
  });

  test("slicing does not mutate the original tesseract", () => {
    const tesseract =
      createTesseract();

    const before =
      tesseract.vertices.map(
        (vertex) => ({
          x: vertex.x,
          y: vertex.y,
          z: vertex.z,
          w: vertex.w
        })
      );

    sliceTesseractAtW(
      tesseract,
      0.25
    );

    expect(
      tesseract.vertices
    ).toEqual(before);
  });

  test("slice results are immutable", () => {
    const slice =
      sliceTesseractAtW(
        createTesseract(),
        0
      );

    expect(
      Object.isFrozen(slice)
    ).toBe(true);

    expect(
      Object.isFrozen(
        slice.vertices
      )
    ).toBe(true);

    expect(
      Object.isFrozen(
        slice.edges
      )
    ).toBe(true);

    for (
      const edge of
        slice.edges
    ) {
      expect(
        Object.isFrozen(edge)
      ).toBe(true);
    }
  });
});
