import type {
  RenderColor3,
  RenderLineMesh3
} from "../types";

const DEFAULT_COLOR:
  RenderColor3 = {
    r: 1,
    g: 1,
    b: 1
  };

function validateComponent(
  component: number
): void {
  if (
    !Number.isFinite(component) ||
    component < 0 ||
    component > 1
  ) {
    throw new RangeError(
      `GPU color component must lie in [0, 1]. Received: ${component}`
    );
  }
}

function writeColor(
  output: Float32Array,
  offset: number,
  color: RenderColor3
): void {
  validateComponent(color.r);
  validateComponent(color.g);
  validateComponent(color.b);

  output[offset] =
    color.r;

  output[offset + 1] =
    color.g;

  output[offset + 2] =
    color.b;
}

/**
 * Expands renderer-neutral color data into the non-indexed color stream
 * used by THREE.LineSegments.
 *
 * Precedence:
 *
 *   1. edgeColors
 *   2. vertexColors
 *   3. neutral white
 *
 * edgeColors are useful for categorical geometry such as X/Y/Z/W
 * tesseract edge directions.
 *
 * vertexColors remain useful for continuous quantities such as the
 * hidden W-coordinate gradient.
 */
export function buildLineSegmentColors(
  mesh: RenderLineMesh3
): Float32Array {
  const colors =
    new Float32Array(
      mesh.edges.length * 6
    );

  let offset = 0;

  for (
    let edgeIndex = 0;
    edgeIndex <
    mesh.edges.length;
    edgeIndex += 1
  ) {
    const edge =
      mesh.edges[
        edgeIndex
      ]!;

    const [
      startIndex,
      endIndex
    ] = edge;

    const edgeColor =
      mesh.edgeColors?.[
        edgeIndex
      ];

    if (
      edgeColor !== undefined
    ) {
      writeColor(
        colors,
        offset,
        edgeColor
      );

      writeColor(
        colors,
        offset + 3,
        edgeColor
      );

      offset += 6;

      continue;
    }

    const startColor =
      mesh.vertexColors?.[
        startIndex
      ] ??
      DEFAULT_COLOR;

    const endColor =
      mesh.vertexColors?.[
        endIndex
      ] ??
      DEFAULT_COLOR;

    writeColor(
      colors,
      offset,
      startColor
    );

    writeColor(
      colors,
      offset + 3,
      endColor
    );

    offset += 6;
  }

  return colors;
}
