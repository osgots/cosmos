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
 * Expands indexed per-vertex colors into the non-indexed color stream
 * required by THREE.LineSegments.
 *
 * Every edge contributes two RGB colors:
 *
 *   start.r, start.g, start.b,
 *   end.r,   end.g,   end.b
 *
 * Meshes without explicit colors receive neutral white.
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
    const [
      startIndex,
      endIndex
    ] of mesh.edges
  ) {
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
