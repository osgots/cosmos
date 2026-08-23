import {
  createTesseract,
  projectTesseractOrthographic
} from "@cosmos/geometry-4d";

import {
  colorFromNormalizedW,
  createWEncodedProjectedTesseractRenderMesh
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity W-coordinate visualization", () => {
  test("W = 0 maps to neutral white", () => {
    expect(
      colorFromNormalizedW(0)
    ).toEqual({
      r: 1,
      g: 1,
      b: 1
    });
  });

  test("negative and positive W map to opposite visual endpoints", () => {
    expect(
      colorFromNormalizedW(-1)
    ).toEqual({
      r: 0.18,
      g: 0.62,
      b: 1
    });

    expect(
      colorFromNormalizedW(1)
    ).toEqual({
      r: 1,
      g: 0.42,
      b: 0.12
    });
  });

  test("values outside the display range are clamped safely", () => {
    expect(
      colorFromNormalizedW(-100)
    ).toEqual(
      colorFromNormalizedW(-1)
    );

    expect(
      colorFromNormalizedW(100)
    ).toEqual(
      colorFromNormalizedW(1)
    );
  });

  test("rejects non-finite W values", () => {
    expect(() =>
      colorFromNormalizedW(
        Number.NaN
      )
    ).toThrow(RangeError);

    expect(() =>
      colorFromNormalizedW(
        Number.POSITIVE_INFINITY
      )
    ).toThrow(RangeError);
  });

  test("creates exactly one scientific color per projected tesseract vertex", () => {
    const tesseract =
      createTesseract();

    const projected =
      projectTesseractOrthographic(
        tesseract
      );

    const mesh =
      createWEncodedProjectedTesseractRenderMesh(
        tesseract,
        projected
      );

    expect(
      mesh.vertexColors
    ).toHaveLength(16);

    expect(
      mesh.vertices
    ).toHaveLength(16);

    expect(
      mesh.edges
    ).toHaveLength(32);
  });

  test("unrotated tesseract separates negative-W and positive-W vertices", () => {
    const tesseract =
      createTesseract();

    const projected =
      projectTesseractOrthographic(
        tesseract
      );

    const mesh =
      createWEncodedProjectedTesseractRenderMesh(
        tesseract,
        projected
      );

    const colors =
      mesh.vertexColors!;

    for (
      let index = 0;
      index < 8;
      index += 1
    ) {
      expect(
        colors[index]!.b
      ).toBeGreaterThan(
        colors[index]!.r
      );
    }

    for (
      let index = 8;
      index < 16;
      index += 1
    ) {
      expect(
        colors[index]!.r
      ).toBeGreaterThan(
        colors[index]!.b
      );
    }
  });
});
