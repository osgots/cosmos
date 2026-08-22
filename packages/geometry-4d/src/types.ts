import type {
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
