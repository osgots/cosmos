import {
  ROTATION_PLANES_4,
  RotationPlane4,
  multiplyMatrix4,
  rotationMatrix4
} from "@cosmos/math-core";

import {
  createTesseract,
  transformTesseract
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

function squaredDistance4(
  a: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
  },
  b: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
  }
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  const dw = a.w - b.w;

  return (
    dx * dx +
    dy * dy +
    dz * dz +
    dw * dw
  );
}

function expectAllEdgesToHaveLength(
  edgeLength: number,
  tesseract: ReturnType<typeof createTesseract>
): void {
  const expectedSquaredLength =
    edgeLength *
    edgeLength;

  for (
    const [startIndex, endIndex]
    of tesseract.edges
  ) {
    const start =
      tesseract.vertices[startIndex]!;

    const end =
      tesseract.vertices[endIndex]!;

    expect(
      squaredDistance4(
        start,
        end
      )
    ).toBeCloseTo(
      expectedSquaredLength,
      12
    );
  }
}

describe("COSMOS Infinity rotated tesseract", () => {
  test("identity-equivalent zero rotation preserves every vertex", () => {
    const original =
      createTesseract();

    const rotated =
      transformTesseract(
        original,
        rotationMatrix4(
          RotationPlane4.XW,
          0
        )
      );

    expect(
      rotated.vertices
    ).toEqual(
      original.vertices
    );
  });

  test("preserves topology after rotation", () => {
    const original =
      createTesseract();

    const rotated =
      transformTesseract(
        original,
        rotationMatrix4(
          RotationPlane4.XW,
          0.83
        )
      );

    expect(
      rotated.vertices
    ).toHaveLength(16);

    expect(
      rotated.edges
    ).toHaveLength(32);

    expect(
      rotated.edges
    ).toBe(
      original.edges
    );
  });

  test("every simple 4D rotation preserves all 32 edge lengths", () => {
    const edgeLength =
      3.75;

    const original =
      createTesseract(
        edgeLength
      );

    for (
      const plane of
        ROTATION_PLANES_4
    ) {
      const rotated =
        transformTesseract(
          original,
          rotationMatrix4(
            plane,
            1.173
          )
        );

      expectAllEdgesToHaveLength(
        edgeLength,
        rotated
      );
    }
  });

  test("composed 4D rotations preserve all edge lengths", () => {
    const edgeLength =
      5;

    const original =
      createTesseract(
        edgeLength
      );

    const xy =
      rotationMatrix4(
        RotationPlane4.XY,
        0.37
      );

    const xw =
      rotationMatrix4(
        RotationPlane4.XW,
        -0.91
      );

    const yz =
      rotationMatrix4(
        RotationPlane4.YZ,
        1.41
      );

    const zw =
      rotationMatrix4(
        RotationPlane4.ZW,
        0.58
      );

    const composed =
      multiplyMatrix4(
        zw,
        multiplyMatrix4(
          yz,
          multiplyMatrix4(
            xw,
            xy
          )
        )
      );

    const rotated =
      transformTesseract(
        original,
        composed
      );

    expectAllEdgesToHaveLength(
      edgeLength,
      rotated
    );
  });

  test("XW quarter-turn genuinely moves X coordinates into W", () => {
    const original =
      createTesseract(2);

    const rotated =
      transformTesseract(
        original,
        rotationMatrix4(
          RotationPlane4.XW,
          Math.PI / 2
        )
      );

    for (
      let index = 0;
      index <
        original.vertices.length;
      index += 1
    ) {
      const before =
        original.vertices[index]!;

      const after =
        rotated.vertices[index]!;

      expect(after.x)
        .toBeCloseTo(
          -before.w,
          14
        );

      expect(after.y)
        .toBeCloseTo(
          before.y,
          14
        );

      expect(after.z)
        .toBeCloseTo(
          before.z,
          14
        );

      expect(after.w)
        .toBeCloseTo(
          before.x,
          14
        );
    }
  });

  test("four quarter-turns restore the tesseract orientation", () => {
    const original =
      createTesseract();

    const quarter =
      rotationMatrix4(
        RotationPlane4.YW,
        Math.PI / 2
      );

    const half =
      multiplyMatrix4(
        quarter,
        quarter
      );

    const full =
      multiplyMatrix4(
        half,
        half
      );

    const rotated =
      transformTesseract(
        original,
        full
      );

    for (
      let index = 0;
      index <
        original.vertices.length;
      index += 1
    ) {
      const before =
        original.vertices[index]!;

      const after =
        rotated.vertices[index]!;

      expect(after.x)
        .toBeCloseTo(
          before.x,
          13
        );

      expect(after.y)
        .toBeCloseTo(
          before.y,
          13
        );

      expect(after.z)
        .toBeCloseTo(
          before.z,
          13
        );

      expect(after.w)
        .toBeCloseTo(
          before.w,
          13
        );
    }
  });

  test("rotation does not mutate the original tesseract", () => {
    const original =
      createTesseract();

    const snapshot =
      original.vertices.map(
        (vertex) => ({
          x: vertex.x,
          y: vertex.y,
          z: vertex.z,
          w: vertex.w
        })
      );

    transformTesseract(
      original,
      rotationMatrix4(
        RotationPlane4.XZ,
        1.2
      )
    );

    expect(
      original.vertices
    ).toEqual(snapshot);
  });
});
