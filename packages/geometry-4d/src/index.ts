export type {
  Tesseract,
  TesseractEdge,
  TesseractFace,
  ProjectedTesseract3,
  TesseractSlice3,
  TesseractSliceEdge3
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

export {
  TESSERACT_FACES
} from "./topology";

export {
  sliceTesseractAtW
} from "./slice";
