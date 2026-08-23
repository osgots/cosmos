export {
  colorFromNormalizedW
} from "./wCoordinateColor";

export {
  createProjectedTesseractRenderMesh,
  createWEncodedProjectedTesseractRenderMesh,
  createTesseractSliceRenderMesh
} from "./tesseractWireframe";

export {
  classifyTesseractEdgeAxis,
  createAxisEncodedProjectedTesseractRenderMesh,
  planeContainsAxis,
  TESSERACT_AXIS_COLORS
} from "./tesseractAxisColor";

export type {
  TesseractAxis,
  TesseractPlane
} from "./tesseractAxisColor";
