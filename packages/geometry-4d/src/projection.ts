import {
  vector3
} from "@cosmos/math-core";

import type {
  Vector3,
  Vector4
} from "@cosmos/math-core";

import type {
  ProjectedTesseract3,
  Tesseract
} from "./types";

/**
 * Orthographic projection from 4D Euclidean space into 3D.
 *
 * The W coordinate is discarded:
 *
 *   (x, y, z, w) -> (x, y, z)
 *
 * This projection does not create perspective depth from the
 * fourth spatial dimension.
 */
export function projectVector4Orthographic(
  vector: Vector4
): Vector3 {
  return vector3(
    vector.x,
    vector.y,
    vector.z
  );
}

/**
 * Perspective projection from 4D Euclidean space into the W = 0
 * three-dimensional projection hyperplane.
 *
 * The projection center is:
 *
 *   (0, 0, 0, projectionDistance)
 *
 * and:
 *
 *   scale = projectionDistance
 *           ------------------
 *           projectionDistance - w
 *
 * therefore:
 *
 *   x' = x * scale
 *   y' = y * scale
 *   z' = z * scale
 *
 * For this first visual projection model we accept only points in
 * front of the projection center:
 *
 *   w < projectionDistance
 *
 * Points at or beyond the W projection singularity are rejected.
 */
export function projectVector4Perspective(
  vector: Vector4,
  projectionDistance: number
): Vector3 {
  if (
    !Number.isFinite(
      projectionDistance
    ) ||
    projectionDistance <= 0
  ) {
    throw new RangeError(
      "Projection distance must be a positive finite number."
    );
  }

  const denominator =
    projectionDistance -
    vector.w;

  if (denominator <= 0) {
    throw new RangeError(
      "4D point lies on or behind the perspective projection singularity."
    );
  }

  const scale =
    projectionDistance /
    denominator;

  if (!Number.isFinite(scale)) {
    throw new RangeError(
      "Perspective projection produced a non-finite scale."
    );
  }

  return vector3(
    vector.x * scale,
    vector.y * scale,
    vector.z * scale
  );
}

/**
 * Orthographically projects all tesseract vertices into 3D while
 * preserving the original edge topology.
 */
export function projectTesseractOrthographic(
  tesseract: Tesseract
): ProjectedTesseract3 {
  const vertices =
    tesseract.vertices.map(
      projectVector4Orthographic
    );

  return Object.freeze({
    vertices:
      Object.freeze(vertices),

    edges:
      tesseract.edges
  });
}

/**
 * Perspective-projects all tesseract vertices from 4D into 3D.
 *
 * Connectivity is unchanged because projection changes geometry,
 * not topology.
 */
export function projectTesseractPerspective(
  tesseract: Tesseract,
  projectionDistance: number
): ProjectedTesseract3 {
  const vertices =
    tesseract.vertices.map(
      (vertex) =>
        projectVector4Perspective(
          vertex,
          projectionDistance
        )
    );

  return Object.freeze({
    vertices:
      Object.freeze(vertices),

    edges:
      tesseract.edges
  });
}
