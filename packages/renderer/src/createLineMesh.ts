import type {
  RenderEdge,
  RenderLineMesh3,
  RenderPosition3
} from "./types";

function validatePosition(
  position: RenderPosition3
): void {
  if (
    !Number.isFinite(position.x) ||
    !Number.isFinite(position.y) ||
    !Number.isFinite(position.z)
  ) {
    throw new RangeError(
      "Render positions must contain only finite coordinates."
    );
  }
}

function clonePosition(
  position: RenderPosition3
): RenderPosition3 {
  validatePosition(position);

  return Object.freeze({
    x: position.x,
    y: position.y,
    z: position.z
  });
}

function validateEdge(
  edge: RenderEdge,
  vertexCount: number
): void {
  const [
    startVertex,
    endVertex
  ] = edge;

  if (
    !Number.isSafeInteger(startVertex) ||
    !Number.isSafeInteger(endVertex)
  ) {
    throw new RangeError(
      "Render edge indices must be safe integers."
    );
  }

  if (
    startVertex < 0 ||
    endVertex < 0 ||
    startVertex >= vertexCount ||
    endVertex >= vertexCount
  ) {
    throw new RangeError(
      "Render edge references a vertex outside the render mesh."
    );
  }

  if (
    startVertex === endVertex
  ) {
    throw new RangeError(
      "Render edges cannot connect a vertex to itself."
    );
  }
}

/**
 * Creates immutable renderer-neutral line geometry.
 *
 * Incoming arrays and objects are copied so external callers cannot mutate
 * an already-submitted render mesh after construction.
 */
export function createRenderLineMesh3(
  vertices: readonly RenderPosition3[],
  edges: readonly RenderEdge[]
): RenderLineMesh3 {
  const safeVertices =
    vertices.map(
      clonePosition
    );

  const safeEdges =
    edges.map(
      (edge) => {
        validateEdge(
          edge,
          safeVertices.length
        );

        return Object.freeze([
          edge[0],
          edge[1]
        ]) as RenderEdge;
      }
    );

  return Object.freeze({
    vertices:
      Object.freeze(
        safeVertices
      ),

    edges:
      Object.freeze(
        safeEdges
      )
  });
}
