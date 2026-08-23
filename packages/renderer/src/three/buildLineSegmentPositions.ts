import type {
  RenderLineMesh3
} from "../types";

/**
 * Largest finite IEEE-754 binary32 value.
 *
 * GPU vertex buffers normally store our local render coordinates as
 * Float32 values. A finite JavaScript number can still overflow when
 * converted to Float32, so we guard that boundary explicitly.
 */
export const GPU_FLOAT32_MAX =
  3.4028234663852886e38;

function validateGpuCoordinate(
  value: number
): void {
  if (
    !Number.isFinite(value) ||
    Math.abs(value) >
      GPU_FLOAT32_MAX
  ) {
    throw new RangeError(
      `Render coordinate cannot be represented safely as Float32: ${value}`
    );
  }
}

/**
 * Converts indexed renderer-neutral wire geometry into the non-indexed
 * position stream required by THREE.LineSegments.
 *
 * Every edge contributes:
 *
 *   start.x, start.y, start.z,
 *   end.x,   end.y,   end.z
 */
export function buildLineSegmentPositions(
  mesh: RenderLineMesh3
): Float32Array {
  const positions =
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
    const start =
      mesh.vertices[startIndex];

    const end =
      mesh.vertices[endIndex];

    if (
      start === undefined ||
      end === undefined
    ) {
      throw new RangeError(
        "Render edge references a missing vertex."
      );
    }

    validateGpuCoordinate(start.x);
    validateGpuCoordinate(start.y);
    validateGpuCoordinate(start.z);

    validateGpuCoordinate(end.x);
    validateGpuCoordinate(end.y);
    validateGpuCoordinate(end.z);

    positions[offset] =
      start.x;

    positions[offset + 1] =
      start.y;

    positions[offset + 2] =
      start.z;

    positions[offset + 3] =
      end.x;

    positions[offset + 4] =
      end.y;

    positions[offset + 5] =
      end.z;

    offset += 6;
  }

  return positions;
}
