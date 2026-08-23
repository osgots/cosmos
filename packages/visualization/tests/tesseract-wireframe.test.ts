import {
  RotationPlane4,
  rotationMatrix4
} from "@cosmos/math-core";

import {
  createTesseract,
  projectTesseractPerspective,
  sliceTesseractAtW,
  transformTesseract
} from "@cosmos/geometry-4d";

import {
  createProjectedTesseractRenderMesh,
  createTesseractSliceRenderMesh
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity tesseract visualization bridge", () => {
  test("converts a perspective-projected tesseract into render geometry", () => {
    const projected =
      projectTesseractPerspective(
        createTesseract(),
        4
      );

    const mesh =
      createProjectedTesseractRenderMesh(
        projected
      );

    expect(
      mesh.vertices
    ).toHaveLength(16);

    expect(
      mesh.edges
    ).toHaveLength(32);
  });

  test("converts a central tesseract slice into cube render geometry", () => {
    const slice =
      sliceTesseractAtW(
        createTesseract(),
        0
      );

    const mesh =
      createTesseractSliceRenderMesh(
        slice
      );

    expect(
      mesh.vertices
    ).toHaveLength(8);

    expect(
      mesh.edges
    ).toHaveLength(12);
  });

  test("visualization output is immutable", () => {
    const projected =
      projectTesseractPerspective(
        createTesseract(),
        4
      );

    const mesh =
      createProjectedTesseractRenderMesh(
        projected
      );

    expect(
      Object.isFrozen(mesh)
    ).toBe(true);

    expect(
      Object.isFrozen(
        mesh.vertices
      )
    ).toBe(true);

    expect(
      Object.isFrozen(
        mesh.edges
      )
    ).toBe(true);
  });

  test("visualization copies geometry rather than leaking source objects", () => {
    const projected =
      projectTesseractPerspective(
        createTesseract(),
        4
      );

    const mesh =
      createProjectedTesseractRenderMesh(
        projected
      );

    expect(
      mesh.vertices[0]
    ).not.toBe(
      projected.vertices[0]
    );

    expect(
      mesh.edges[0]
    ).not.toBe(
      projected.edges[0]
    );

    expect(
      mesh.vertices[0]
    ).toEqual(
      projected.vertices[0]
    );

    expect(
      mesh.edges[0]
    ).toEqual(
      projected.edges[0]
    );
  });

  test("true 4D rotation can flow through projection into render geometry", () => {
    const rotated =
      transformTesseract(
        createTesseract(),
        rotationMatrix4(
          RotationPlane4.XW,
          0.73
        )
      );

    const projected =
      projectTesseractPerspective(
        rotated,
        4
      );

    const mesh =
      createProjectedTesseractRenderMesh(
        projected
      );

    expect(
      mesh.vertices
    ).toHaveLength(16);

    expect(
      mesh.edges
    ).toHaveLength(32);

    for (
      const vertex of
        mesh.vertices
    ) {
      expect(
        Number.isFinite(vertex.x)
      ).toBe(true);

      expect(
        Number.isFinite(vertex.y)
      ).toBe(true);

      expect(
        Number.isFinite(vertex.z)
      ).toBe(true);
    }
  });

  test("true 4D rotation can flow through slicing into render geometry", () => {
    const rotated =
      transformTesseract(
        createTesseract(),
        rotationMatrix4(
          RotationPlane4.XW,
          0.37
        )
      );

    const slice =
      sliceTesseractAtW(
        rotated,
        0
      );

    const mesh =
      createTesseractSliceRenderMesh(
        slice
      );

    expect(
      mesh.vertices.length
    ).toBeGreaterThan(0);

    expect(
      mesh.edges.length
    ).toBeGreaterThan(0);

    for (
      const vertex of
        mesh.vertices
    ) {
      expect(
        Number.isFinite(vertex.x)
      ).toBe(true);

      expect(
        Number.isFinite(vertex.y)
      ).toBe(true);

      expect(
        Number.isFinite(vertex.z)
      ).toBe(true);
    }
  });
});
