import {
  createTesseract,
  projectTesseractOrthographic
} from "@cosmos/geometry-4d";

import {
  classifyTesseractEdgeAxis,
  createAxisEncodedProjectedTesseractRenderMesh,
  planeContainsAxis,
  TESSERACT_AXIS_COLORS
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity tesseract axis visualization", () => {
  test("classifies exactly eight edges along each 4D axis", () => {
    const tesseract =
      createTesseract(2);

    const counts = {
      X: 0,
      Y: 0,
      Z: 0,
      W: 0
    };

    for (
      let edgeIndex = 0;
      edgeIndex <
      tesseract.edges.length;
      edgeIndex += 1
    ) {
      const axis =
        classifyTesseractEdgeAxis(
          tesseract,
          edgeIndex
        );

      counts[axis] += 1;
    }

    expect(counts).toEqual({
      X: 8,
      Y: 8,
      Z: 8,
      W: 8
    });
  });

  test("correctly identifies axes belonging to a rotation plane", () => {
    expect(
      planeContainsAxis(
        "XW",
        "X"
      )
    ).toBe(true);

    expect(
      planeContainsAxis(
        "XW",
        "W"
      )
    ).toBe(true);

    expect(
      planeContainsAxis(
        "XW",
        "Y"
      )
    ).toBe(false);

    expect(
      planeContainsAxis(
        "XW",
        "Z"
      )
    ).toBe(false);
  });

  test("creates one categorical color per tesseract edge", () => {
    const source =
      createTesseract(2);

    const projected =
      projectTesseractOrthographic(
        source
      );

    const mesh =
      createAxisEncodedProjectedTesseractRenderMesh(
        source,
        projected
      );

    expect(
      mesh.edgeColors
    ).toHaveLength(32);
  });

  test("XW focus keeps X and W bright while dimming Y and Z", () => {
    const source =
      createTesseract(2);

    const projected =
      projectTesseractOrthographic(
        source
      );

    const mesh =
      createAxisEncodedProjectedTesseractRenderMesh(
        source,
        projected,
        "XW"
      );

    const colors =
      mesh.edgeColors!;

    for (
      let edgeIndex = 0;
      edgeIndex <
      source.edges.length;
      edgeIndex += 1
    ) {
      const axis =
        classifyTesseractEdgeAxis(
          source,
          edgeIndex
        );

      const color =
        colors[
          edgeIndex
        ]!;

      const base =
        TESSERACT_AXIS_COLORS[
          axis
        ];

      if (
        axis === "X" ||
        axis === "W"
      ) {
        expect(color).toEqual(
          base
        );
      } else {
        expect(color.r).toBeLessThan(
          base.r
        );

        expect(color.g).toBeLessThan(
          base.g
        );

        expect(color.b).toBeLessThan(
          base.b
        );
      }
    }
  });
});
