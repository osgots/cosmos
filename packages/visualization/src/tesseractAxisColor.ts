import type {
  ProjectedTesseract3,
  Tesseract
} from "@cosmos/geometry-4d";

import {
  createRenderLineMesh3
} from "@cosmos/renderer";

import type {
  RenderColor3,
  RenderLineMesh3
} from "@cosmos/renderer";

export type TesseractAxis =
  | "X"
  | "Y"
  | "Z"
  | "W";

export type TesseractPlane =
  | "XY"
  | "XZ"
  | "XW"
  | "YZ"
  | "YW"
  | "ZW";

export const TESSERACT_AXIS_COLORS:
  Readonly<Record<
    TesseractAxis,
    RenderColor3
  >> =
    Object.freeze({
      X: Object.freeze({
        r: 0.05,
        g: 0.85,
        b: 1
      }),

      Y: Object.freeze({
        r: 0.28,
        g: 1,
        b: 0.38
      }),

      Z: Object.freeze({
        r: 0.64,
        g: 0.32,
        b: 1
      }),

      W: Object.freeze({
        r: 1,
        g: 0.38,
        b: 0.08
      })
    });

const DIM_FACTOR = 0.08;

function scaleColor(
  color: RenderColor3,
  factor: number
): RenderColor3 {
  return Object.freeze({
    r: color.r * factor,
    g: color.g * factor,
    b: color.b * factor
  });
}

function coordinateDifferences(
  source: Tesseract,
  startIndex: number,
  endIndex: number
): readonly TesseractAxis[] {
  const start =
    source.vertices[
      startIndex
    ];

  const end =
    source.vertices[
      endIndex
    ];

  if (
    start === undefined ||
    end === undefined
  ) {
    throw new RangeError(
      "Tesseract edge references an invalid source vertex."
    );
  }

  const differences:
    TesseractAxis[] = [];

  if (start.x !== end.x) {
    differences.push("X");
  }

  if (start.y !== end.y) {
    differences.push("Y");
  }

  if (start.z !== end.z) {
    differences.push("Z");
  }

  if (start.w !== end.w) {
    differences.push("W");
  }

  return differences;
}

/**
 * Determines the canonical axis associated with one tesseract edge.
 *
 * Every valid hypercube edge changes exactly one coordinate.
 */
export function classifyTesseractEdgeAxis(
  source: Tesseract,
  edgeIndex: number
): TesseractAxis {
  if (
    !Number.isSafeInteger(
      edgeIndex
    ) ||
    edgeIndex < 0 ||
    edgeIndex >=
      source.edges.length
  ) {
    throw new RangeError(
      "Tesseract edge index is invalid."
    );
  }

  const edge =
    source.edges[
      edgeIndex
    ];

  if (edge === undefined) {
    throw new RangeError(
      "Tesseract edge could not be resolved."
    );
  }

  const [
    startIndex,
    endIndex
  ] = edge;

  const differences =
    coordinateDifferences(
      source,
      startIndex,
      endIndex
    );

  if (
    differences.length !== 1
  ) {
    throw new RangeError(
      "A valid tesseract edge must change exactly one coordinate."
    );
  }

  return differences[0]!;
}

export function planeContainsAxis(
  plane: TesseractPlane,
  axis: TesseractAxis
): boolean {
  return plane.includes(
    axis
  );
}

function validateMatchingTopology(
  source: Tesseract,
  projected: ProjectedTesseract3
): void {
  if (
    source.vertices.length !==
    projected.vertices.length
  ) {
    throw new RangeError(
      "Source and projected tesseracts must contain the same vertex count."
    );
  }

  if (
    source.edges.length !==
    projected.edges.length
  ) {
    throw new RangeError(
      "Source and projected tesseracts must contain the same edge count."
    );
  }

  for (
    let edgeIndex = 0;
    edgeIndex <
    source.edges.length;
    edgeIndex += 1
  ) {
    const sourceEdge =
      source.edges[
        edgeIndex
      ];

    const projectedEdge =
      projected.edges[
        edgeIndex
      ];

    if (
      sourceEdge === undefined ||
      projectedEdge === undefined ||
      sourceEdge[0] !==
        projectedEdge[0] ||
      sourceEdge[1] !==
        projectedEdge[1]
    ) {
      throw new RangeError(
        "Projected tesseract topology must preserve source edge ordering."
      );
    }
  }
}

/**
 * Creates renderer geometry with scientifically meaningful categorical
 * colors for the four canonical hypercube edge directions.
 *
 * Edge identity is taken from the unrotated reference tesseract.
 * Therefore X/Y/Z/W classifications remain stable even after arbitrary
 * rotations in R^4.
 *
 * focusedPlane is optional.
 *
 * Example:
 *
 *   focusedPlane = "XW"
 *
 * X and W edges remain bright.
 * Y and Z edges are deliberately dimmed.
 */
export function createAxisEncodedProjectedTesseractRenderMesh(
  referenceTesseract: Tesseract,
  projected: ProjectedTesseract3,
  focusedPlane?: TesseractPlane
): RenderLineMesh3 {
  validateMatchingTopology(
    referenceTesseract,
    projected
  );

  const edgeColors =
    projected.edges.map(
      (
        _edge,
        edgeIndex
      ) => {
        const axis =
          classifyTesseractEdgeAxis(
            referenceTesseract,
            edgeIndex
          );

        const baseColor =
          TESSERACT_AXIS_COLORS[
            axis
          ];

        if (
          focusedPlane === undefined ||
          planeContainsAxis(
            focusedPlane,
            axis
          )
        ) {
          return baseColor;
        }

        return scaleColor(
          baseColor,
          DIM_FACTOR
        );
      }
    );

  return createRenderLineMesh3(
    projected.vertices,
    projected.edges,
    undefined,
    edgeColors
  );
}
