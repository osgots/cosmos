import type {
  Vector3,
  Vector4
} from "@cosmos/math-core";

/**
 * A tesseract edge stores indices into the tesseract vertex array.
 */
export type TesseractEdge = readonly [
  startVertex: number,
  endVertex: number
];

export interface Tesseract {
  readonly edgeLength: number;
  readonly vertices: readonly Vector4[];
  readonly edges: readonly TesseractEdge[];
}

/**
 * Renderer-neutral 3D result of projecting a 4D tesseract.
 *
 * The topology remains identical to the source tesseract:
 *
 * 16 vertices
 * 32 edges
 *
 * Only the vertex coordinates have changed from Vector4 to Vector3.
 */
export interface ProjectedTesseract3 {
  readonly vertices: readonly Vector3[];
  readonly edges: readonly TesseractEdge[];
}
