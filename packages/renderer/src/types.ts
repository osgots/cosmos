/**
 * Renderer-facing local 3D position.
 *
 * BigInt universe coordinates must never reach the GPU directly.
 */
export interface RenderPosition3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * Linear RGB renderer color.
 *
 * Every component must lie in:
 *
 *   0 <= component <= 1
 */
export interface RenderColor3 {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/**
 * Undirected connection between two entries in a render vertex array.
 */
export type RenderEdge = readonly [
  startVertex: number,
  endVertex: number
];

/**
 * Generic renderer-neutral wire geometry.
 *
 * vertexColors:
 *   One color per logical vertex. This allows a color gradient along
 *   an edge because each endpoint may have a different color.
 *
 * edgeColors:
 *   One color per logical edge. Both endpoints of that edge use the
 *   same color.
 *
 * If both are supplied, edgeColors intentionally takes precedence
 * during line-buffer construction.
 */
export interface RenderLineMesh3 {
  readonly vertices:
    readonly RenderPosition3[];

  readonly edges:
    readonly RenderEdge[];

  readonly vertexColors?:
    readonly RenderColor3[];

  readonly edgeColors?:
    readonly RenderColor3[];
}
