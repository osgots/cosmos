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
 * Each component is constrained to:
 *
 *   0 <= component <= 1
 *
 * Scientific meaning belongs to the visualization layer. The renderer
 * merely transports these values to the GPU.
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
 * vertexColors is optional. When omitted, the concrete renderer must
 * render the geometry using its neutral/default appearance.
 *
 * When supplied, there must be exactly one color per vertex.
 */
export interface RenderLineMesh3 {
  readonly vertices: readonly RenderPosition3[];
  readonly edges: readonly RenderEdge[];

  readonly vertexColors?:
    readonly RenderColor3[];
}
