import {
  multiplyMatrix4Vector4
} from "@cosmos/math-core";

import type {
  Matrix4
} from "@cosmos/math-core";

import type {
  Tesseract
} from "./types";

/**
 * Applies a 4x4 transformation matrix to every tesseract vertex.
 *
 * Topology is preserved:
 *
 * - same 16 vertices by index
 * - same 32 edges
 *
 * Only the vertex positions are transformed.
 *
 * For a proper 4D rotation matrix, all distances and edge lengths
 * remain unchanged.
 */
export function transformTesseract(
  tesseract: Tesseract,
  matrix: Matrix4
): Tesseract {
  const transformedVertices =
    tesseract.vertices.map(
      (vertex) =>
        multiplyMatrix4Vector4(
          matrix,
          vertex
        )
    );

  return Object.freeze({
    edgeLength:
      tesseract.edgeLength,

    vertices:
      Object.freeze(
        transformedVertices
      ),

    /**
     * Edge indices are topology, not geometry.
     * A linear transformation does not change connectivity.
     */
    edges:
      tesseract.edges
  });
}
