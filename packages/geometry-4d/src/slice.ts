import {
  vector3
} from "@cosmos/math-core";

import type {
  Vector3,
  Vector4
} from "@cosmos/math-core";

import {
  TESSERACT_FACES
} from "./topology";

import type {
  Tesseract,
  TesseractFace,
  TesseractSlice3,
  TesseractSliceEdge3
} from "./types";

type FaceBoundaryIntersection =
  | {
      readonly kind: "none";
    }
  | {
      readonly kind: "point";
      readonly sliceVertexIndex: number;
    }
  | {
      readonly kind: "coplanar-edge";
      readonly startSliceVertexIndex: number;
      readonly endSliceVertexIndex: number;
    };

function squaredDistance3(
  a: Vector3,
  b: Vector3
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

/**
 * Computes the true 3D intersection between a tesseract and a
 * constant-W hyperplane.
 *
 * The slicing hyperplane is:
 *
 *   w = sliceW
 *
 * The source tesseract may already have undergone arbitrary 4D
 * rotations before slicing.
 */
export function sliceTesseractAtW(
  tesseract: Tesseract,
  sliceW: number,
  epsilon = 1e-10
): TesseractSlice3 {
  if (!Number.isFinite(sliceW)) {
    throw new RangeError(
      "Slice W coordinate must be finite."
    );
  }

  if (
    !Number.isFinite(epsilon) ||
    epsilon <= 0
  ) {
    throw new RangeError(
      "Slice epsilon must be a positive finite number."
    );
  }

  const sliceVertices:
    Vector3[] = [];

  const sliceEdges:
    TesseractSliceEdge3[] = [];

  /**
   * Exact topology-based keys avoid fuzzy coordinate-based
   * deduplication.
   *
   * Examples:
   *
   *   v:7
   *
   * represents an original tesseract vertex lying directly on the
   * slicing hyperplane.
   *
   *   e:3:11
   *
   * represents an interpolated intersection along original edge
   * (3, 11).
   */
  const vertexIndexByKey =
    new Map<string, number>();

  const edgeKeys =
    new Set<string>();

  function isOnSlice(
    vertex: Vector4
  ): boolean {
    return (
      Math.abs(
        vertex.w -
        sliceW
      ) <= epsilon
    );
  }

  function createSliceVertex(
    key: string,
    point: Vector3
  ): number {
    const existing =
      vertexIndexByKey.get(key);

    if (existing !== undefined) {
      return existing;
    }

    const index =
      sliceVertices.length;

    sliceVertices.push(point);

    vertexIndexByKey.set(
      key,
      index
    );

    return index;
  }

  function getSourceVertex(
    sourceVertexIndex: number
  ): number {
    const vertex =
      tesseract.vertices[
        sourceVertexIndex
      ]!;

    return createSliceVertex(
      `v:${sourceVertexIndex}`,
      vector3(
        vertex.x,
        vertex.y,
        vertex.z
      )
    );
  }

  function getCrossingVertex(
    firstVertexIndex: number,
    secondVertexIndex: number
  ): number {
    const first =
      tesseract.vertices[
        firstVertexIndex
      ]!;

    const second =
      tesseract.vertices[
        secondVertexIndex
      ]!;

    const lowIndex =
      Math.min(
        firstVertexIndex,
        secondVertexIndex
      );

    const highIndex =
      Math.max(
        firstVertexIndex,
        secondVertexIndex
      );

    const key =
      `e:${lowIndex}:${highIndex}`;

    const existing =
      vertexIndexByKey.get(key);

    if (existing !== undefined) {
      return existing;
    }

    const denominator =
      second.w -
      first.w;

    if (
      denominator === 0 ||
      !Number.isFinite(denominator)
    ) {
      throw new RangeError(
        "Cannot interpolate a degenerate tesseract edge during slicing."
      );
    }

    const interpolation =
      (
        sliceW -
        first.w
      ) /
      denominator;

    if (
      !Number.isFinite(
        interpolation
      )
    ) {
      throw new RangeError(
        "Tesseract slicing produced a non-finite interpolation factor."
      );
    }

    const point =
      vector3(
        first.x +
          (
            second.x -
            first.x
          ) *
          interpolation,

        first.y +
          (
            second.y -
            first.y
          ) *
          interpolation,

        first.z +
          (
            second.z -
            first.z
          ) *
          interpolation
      );

    return createSliceVertex(
      key,
      point
    );
  }

  function addSliceEdge(
    firstIndex: number,
    secondIndex: number
  ): void {
    if (
      firstIndex === secondIndex
    ) {
      return;
    }

    const lowIndex =
      Math.min(
        firstIndex,
        secondIndex
      );

    const highIndex =
      Math.max(
        firstIndex,
        secondIndex
      );

    const key =
      `${lowIndex}:${highIndex}`;

    if (edgeKeys.has(key)) {
      return;
    }

    edgeKeys.add(key);

    sliceEdges.push(
      Object.freeze([
        lowIndex,
        highIndex
      ]) as TesseractSliceEdge3
    );
  }

  function intersectBoundaryEdge(
    firstVertexIndex: number,
    secondVertexIndex: number
  ): FaceBoundaryIntersection {
    const first =
      tesseract.vertices[
        firstVertexIndex
      ]!;

    const second =
      tesseract.vertices[
        secondVertexIndex
      ]!;

    const firstDelta =
      first.w -
      sliceW;

    const secondDelta =
      second.w -
      sliceW;

    const firstOn =
      Math.abs(firstDelta) <=
      epsilon;

    const secondOn =
      Math.abs(secondDelta) <=
      epsilon;

    if (
      firstOn &&
      secondOn
    ) {
      return {
        kind:
          "coplanar-edge",

        startSliceVertexIndex:
          getSourceVertex(
            firstVertexIndex
          ),

        endSliceVertexIndex:
          getSourceVertex(
            secondVertexIndex
          )
      };
    }

    if (firstOn) {
      return {
        kind: "point",
        sliceVertexIndex:
          getSourceVertex(
            firstVertexIndex
          )
      };
    }

    if (secondOn) {
      return {
        kind: "point",
        sliceVertexIndex:
          getSourceVertex(
            secondVertexIndex
          )
      };
    }

    const crosses =
      (
        firstDelta < 0 &&
        secondDelta > 0
      ) ||
      (
        firstDelta > 0 &&
        secondDelta < 0
      );

    if (!crosses) {
      return {
        kind: "none"
      };
    }

    return {
      kind: "point",
      sliceVertexIndex:
        getCrossingVertex(
          firstVertexIndex,
          secondVertexIndex
        )
    };
  }

  function addFarthestPair(
    indices: readonly number[]
  ): void {
    let bestFirst = -1;
    let bestSecond = -1;
    let bestDistance = -1;

    for (
      let first = 0;
      first <
        indices.length;
      first += 1
    ) {
      for (
        let second =
          first + 1;
        second <
          indices.length;
        second += 1
      ) {
        const firstIndex =
          indices[first]!;

        const secondIndex =
          indices[second]!;

        const distance =
          squaredDistance3(
            sliceVertices[
              firstIndex
            ]!,
            sliceVertices[
              secondIndex
            ]!
          );

        if (
          distance >
          bestDistance
        ) {
          bestDistance =
            distance;

          bestFirst =
            firstIndex;

          bestSecond =
            secondIndex;
        }
      }
    }

    if (
      bestFirst >= 0 &&
      bestSecond >= 0
    ) {
      addSliceEdge(
        bestFirst,
        bestSecond
      );
    }
  }

  function processFace(
    face: TesseractFace
  ): void {
    const allVerticesOnSlice =
      face.every(
        (vertexIndex) =>
          isOnSlice(
            tesseract.vertices[
              vertexIndex
            ]!
          )
      );

    /**
     * The entire square face lies inside the slicing hyperplane.
     */
    if (
      allVerticesOnSlice
    ) {
      for (
        let index = 0;
        index < 4;
        index += 1
      ) {
        const nextIndex =
          (index + 1) % 4;

        addSliceEdge(
          getSourceVertex(
            face[index]!
          ),
          getSourceVertex(
            face[nextIndex]!
          )
        );
      }

      return;
    }

    const intersectionPoints:
      number[] = [];

    let foundCoplanarEdge =
      false;

    for (
      let index = 0;
      index < 4;
      index += 1
    ) {
      const nextIndex =
        (index + 1) % 4;

      const intersection =
        intersectBoundaryEdge(
          face[index]!,
          face[nextIndex]!
        );

      switch (
        intersection.kind
      ) {
        case "none":
          break;

        case "point":
          intersectionPoints.push(
            intersection
              .sliceVertexIndex
          );
          break;

        case "coplanar-edge":
          foundCoplanarEdge =
            true;

          addSliceEdge(
            intersection
              .startSliceVertexIndex,

            intersection
              .endSliceVertexIndex
          );
          break;
      }
    }

    /**
     * For a non-coplanar convex square, the level set of W is a
     * single line segment. If an entire boundary edge lies on the
     * plane, that edge is already the complete intersection.
     */
    if (foundCoplanarEdge) {
      return;
    }

    const uniquePoints =
      Array.from(
        new Set(
          intersectionPoints
        )
      );

    if (
      uniquePoints.length === 2
    ) {
      addSliceEdge(
        uniquePoints[0]!,
        uniquePoints[1]!
      );

      return;
    }

    /**
     * Numerical epsilon classification can occasionally produce more
     * than two candidates near a degenerate configuration. Since the
     * intersection of a convex square with a hyperplane is still a
     * line segment, retain its two farthest endpoints.
     */
    if (
      uniquePoints.length > 2
    ) {
      addFarthestPair(
        uniquePoints
      );
    }
  }

  for (
    const face of
      TESSERACT_FACES
  ) {
    processFace(face);
  }

  return Object.freeze({
    sliceW,

    vertices:
      Object.freeze(
        sliceVertices
      ),

    edges:
      Object.freeze(
        sliceEdges
      )
  });
}
