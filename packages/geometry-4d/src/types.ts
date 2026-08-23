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

/**
 * Four vertex indices forming one square face of a tesseract.
 *
 * Vertices are stored in cyclic boundary order.
 */
export type TesseractFace = readonly [
  number,
  number,
  number,
  number
];

export interface Tesseract {
  readonly edgeLength: number;
  readonly vertices: readonly Vector4[];
  readonly edges: readonly TesseractEdge[];
}

/**
 * Renderer-neutral 3D result of projecting a 4D tesseract.
 */
export interface ProjectedTesseract3 {
  readonly vertices: readonly Vector3[];
  readonly edges: readonly TesseractEdge[];
}

/**
 * Edge belonging to a true 3D cross-section of a tesseract.
 *
 * These indices refer to TesseractSlice3.vertices rather than the
 * original 16 tesseract vertices.
 */
export type TesseractSliceEdge3 = readonly [
  startVertex: number,
  endVertex: number
];

/**
 * True intersection between a 4D tesseract and the hyperplane:
 *
 *   w = sliceW
 *
 * This is not a projection. It is the actual 3D cross-section.
 */
export interface TesseractSlice3 {
  readonly sliceW: number;
  readonly vertices: readonly Vector3[];
  readonly edges: readonly TesseractSliceEdge3[];
}
