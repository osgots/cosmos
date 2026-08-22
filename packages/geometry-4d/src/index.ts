export type {
  Tesseract,
  TesseractEdge,
  ProjectedTesseract3
} from "./types";

export {
  createTesseract
} from "./tesseract";

export {
  transformTesseract
} from "./transform";

export {
  projectVector4Orthographic,
  projectVector4Perspective,
  projectTesseractOrthographic,
  projectTesseractPerspective
} from "./projection";
