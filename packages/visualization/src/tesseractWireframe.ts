import type {
  ProjectedTesseract3,
  TesseractSlice3
} from "@cosmos/geometry-4d";

import {
  createRenderLineMesh3
} from "@cosmos/renderer";

import type {
  RenderLineMesh3
} from "@cosmos/renderer";

/**
 * Converts a projected 4D tesseract into renderer-neutral wire geometry.
 *
 * At this point all 4D mathematics has already happened.
 *
 * The renderer receives only:
 *
 *   3D local positions
 *   +
 *   edge connectivity
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
 * Converts a true 3D cross-section of a 4D tesseract into
 * renderer-neutral wire geometry.
 *
 * Projection and slicing therefore feed the same renderer interface even
 * though they represent fundamentally different mathematical operations.
 */
export function createTesseractSliceRenderMesh(
  slice: TesseractSlice3
): RenderLineMesh3 {
  return createRenderLineMesh3(
    slice.vertices,
    slice.edges
  );
}
