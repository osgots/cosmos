import {
  vector4
} from "@cosmos/math-core";

import type {
  Tesseract,
  TesseractEdge
} from "./types";

/**
 * Creates a tesseract centered at the 4D origin.
 *
 * Its vertices are every possible sign combination:
 *
 *   (±h, ±h, ±h, ±h)
 *
 * where:
 *
 *   h = edgeLength / 2
 *
 * Vertex indices use four binary bits:
 *
 *   bit 0 -> X
 *   bit 1 -> Y
 *   bit 2 -> Z
 *   bit 3 -> W
 *
 * Two vertices share an edge exactly when their bit patterns differ
 * in one and only one bit.
 */
export function createTesseract(
  edgeLength = 2
): Tesseract {
  if (
    !Number.isFinite(edgeLength) ||
    edgeLength <= 0
  ) {
    throw new RangeError(
      "Tesseract edge length must be a positive finite number."
    );
  }

  const half =
    edgeLength / 2;

  const vertices = Array.from(
    {
      length: 16
    },
    (_, index) =>
      vector4(
        (index & 0b0001) === 0
          ? -half
          : half,

        (index & 0b0010) === 0
          ? -half
          : half,

        (index & 0b0100) === 0
          ? -half
          : half,

        (index & 0b1000) === 0
          ? -half
          : half
      )
  );

  const edges: TesseractEdge[] = [];

  for (
    let vertexIndex = 0;
    vertexIndex < 16;
    vertexIndex += 1
  ) {
    for (
      let dimensionBit = 0;
      dimensionBit < 4;
      dimensionBit += 1
    ) {
      const neighborIndex =
        vertexIndex ^
        (1 << dimensionBit);

      /**
       * Each undirected edge would otherwise be generated twice.
       */
      if (
        vertexIndex <
        neighborIndex
      ) {
        edges.push(
          Object.freeze([
            vertexIndex,
            neighborIndex
          ]) as TesseractEdge
        );
      }
    }
  }

  return Object.freeze({
    edgeLength,
    vertices: Object.freeze(vertices),
    edges: Object.freeze(edges)
  });
}
