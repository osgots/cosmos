import type {
  ProjectedTesseract3,
  Tesseract,
  TesseractSlice3
} from "@cosmos/geometry-4d";

import {
  createRenderLineMesh3
} from "@cosmos/renderer";

import type {
  RenderLineMesh3
} from "@cosmos/renderer";

import {
  colorFromNormalizedW
} from "./wCoordinateColor";

/**
 * Converts a projected 4D tesseract into neutral renderer geometry.
 */
export function createProjectedTesseractRenderMesh(
  projected: ProjectedTesseract3
): RenderLineMesh3 {
  return createRenderLineMesh3(
    projected.vertices,
    projected.edges
  );
}

/**
 * Creates a projected tesseract render mesh whose vertex colors encode
 * the original rotated fourth-dimensional coordinate.
 *
 * Color meaning:
 *
 *   negative W -> cool
 *   W = 0      -> white
 *   positive W -> warm
 *
 * The scale is normalized using the tesseract edge length.
 *
 * For a centered 4D hypercube under Euclidean rotation, every vertex
 * coordinate satisfies:
 *
 *   |w| <= edgeLength
 *
 * so the mapping remains stable while the object rotates.
 *
 * This is ARTISTIC / SCIENTIFIC VISUALIZATION, not physical color.
 */
export function createWEncodedProjectedTesseractRenderMesh(
  source4D: Tesseract,
  projected: ProjectedTesseract3
): RenderLineMesh3 {
  if (
    source4D.vertices.length !==
    projected.vertices.length
  ) {
    throw new RangeError(
      "4D source and projected geometry must contain the same number of vertices."
    );
  }

  if (
    !Number.isFinite(
      source4D.edgeLength
    ) ||
    source4D.edgeLength <= 0
  ) {
    throw new RangeError(
      "Tesseract edge length must be a positive finite value."
    );
  }

  const vertexColors =
    source4D.vertices.map(
      (vertex) =>
        colorFromNormalizedW(
          vertex.w /
          source4D.edgeLength
        )
    );

  return createRenderLineMesh3(
    projected.vertices,
    projected.edges,
    vertexColors
  );
}

/**
 * Converts a true 3D cross-section into neutral renderer geometry.
 *
 * Slice mode intentionally remains neutral because every point of a
 * w = constant slice shares the same fourth-coordinate value.
 */
export function createTesseractSliceRenderMesh(
  slice: TesseractSlice3
): RenderLineMesh3 {
  return createRenderLineMesh3(
    slice.vertices,
    slice.edges
  );
}
