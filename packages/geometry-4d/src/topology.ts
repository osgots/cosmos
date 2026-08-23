import type {
  TesseractFace
} from "./types";

/**
 * Generates all 24 square faces of a 4D hypercube.
 *
 * A square face is created by:
 *
 * - choosing two of the four dimensions to vary;
 * - fixing the remaining two dimensions.
 *
 * Number of faces:
 *
 *   C(4, 2) * 2^(4 - 2)
 *   = 6 * 4
 *   = 24
 *
 * Vertex indices follow the same four-bit convention used by
 * createTesseract().
 */
function createTesseractFaces():
  readonly TesseractFace[] {
  const faces:
    TesseractFace[] = [];

  for (
    let firstDimension = 0;
    firstDimension < 4;
    firstDimension += 1
  ) {
    for (
      let secondDimension =
        firstDimension + 1;
      secondDimension < 4;
      secondDimension += 1
    ) {
      const firstMask =
        1 << firstDimension;

      const secondMask =
        1 << secondDimension;

      for (
        let baseVertex = 0;
        baseVertex < 16;
        baseVertex += 1
      ) {
        /**
         * Only generate a face from a base vertex where both
         * varying-dimension bits are zero. This prevents duplicates.
         */
        if (
          (baseVertex & firstMask) !== 0 ||
          (baseVertex & secondMask) !== 0
        ) {
          continue;
        }

        const v00 =
          baseVertex;

        const v10 =
          baseVertex |
          firstMask;

        const v11 =
          baseVertex |
          firstMask |
          secondMask;

        const v01 =
          baseVertex |
          secondMask;

        faces.push(
          Object.freeze([
            v00,
            v10,
            v11,
            v01
          ]) as TesseractFace
        );
      }
    }
  }

  return Object.freeze(faces);
}

/**
 * Canonical square-face topology for a tesseract.
 */
export const TESSERACT_FACES =
  createTesseractFaces();
