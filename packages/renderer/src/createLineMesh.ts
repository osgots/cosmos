import type {
  RenderColor3,
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

function validateColorComponent(
  component: number
): void {
  if (
    !Number.isFinite(component) ||
    component < 0 ||
    component > 1
  ) {
    throw new RangeError(
      `Render color components must be finite values in [0, 1]. Received: ${component}`
    );
  }
}

function cloneColor(
  color: RenderColor3
): RenderColor3 {
  validateColorComponent(color.r);
  validateColorComponent(color.g);
  validateColorComponent(color.b);

  return Object.freeze({
    r: color.r,
    g: color.g,
    b: color.b
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

function cloneColors(
  colors: readonly RenderColor3[],
  expectedCount: number,
  kind: "vertex" | "edge"
): readonly RenderColor3[] {
  if (
    colors.length !==
    expectedCount
  ) {
    throw new RangeError(
      `Render ${kind} color count must exactly match render ${kind} count.`
    );
  }

  return Object.freeze(
    colors.map(
      cloneColor
    )
  );
}

/**
 * Creates immutable renderer-neutral line geometry.
 *
 * Arrays and objects are copied so callers cannot mutate data that has
 * already crossed the renderer boundary.
 */
export function createRenderLineMesh3(
  vertices:
    readonly RenderPosition3[],

  edges:
    readonly RenderEdge[],

  vertexColors?:
    readonly RenderColor3[],

  edgeColors?:
    readonly RenderColor3[]
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

  const frozenVertices =
    Object.freeze(
      safeVertices
    );

  const frozenEdges =
    Object.freeze(
      safeEdges
    );

  const safeVertexColors =
    vertexColors === undefined
      ? undefined
      : cloneColors(
          vertexColors,
          safeVertices.length,
          "vertex"
        );

  const safeEdgeColors =
    edgeColors === undefined
      ? undefined
      : cloneColors(
          edgeColors,
          safeEdges.length,
          "edge"
        );

  return Object.freeze({
    vertices:
      frozenVertices,

    edges:
      frozenEdges,

    ...(
      safeVertexColors === undefined
        ? {}
        : {
            vertexColors:
              safeVertexColors
          }
    ),

    ...(
      safeEdgeColors === undefined
        ? {}
        : {
            edgeColors:
              safeEdgeColors
          }
    )
  });
}
