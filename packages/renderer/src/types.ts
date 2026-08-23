/**
 * Renderer-facing local 3D position.
 *
 * These coordinates are deliberately plain numbers because the renderer
 * receives already-resolved local/floating-origin coordinates.
 *
 * BigInt universe coordinates must never reach the GPU directly.
 */
export interface RenderPosition3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
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
 * The renderer does not know whether this came from:
 *
 * - a tesseract,
 * - an orbit,
 * - a spacetime diagram,
 * - a molecular bond graph,
 * - a cosmic-web filament,
 * - or another visualization.
 */
export interface RenderLineMesh3 {
  readonly vertices: readonly RenderPosition3[];
  readonly edges: readonly RenderEdge[];
}
