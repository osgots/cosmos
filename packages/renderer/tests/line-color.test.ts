import {
  createRenderLineMesh3
} from "../src/index";

import {
  buildLineSegmentColors
} from "../src/three/buildLineSegmentColors";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity renderer color pipeline", () => {
  test("uncolored meshes generate neutral white GPU colors", () => {
    const mesh =
      createRenderLineMesh3(
        [
          {
            x: 0,
            y: 0,
            z: 0
          },
          {
            x: 1,
            y: 0,
            z: 0
          }
        ],
        [
          [0, 1]
        ]
      );

    expect(
      Array.from(
        buildLineSegmentColors(
          mesh
        )
      )
    ).toEqual([
      1, 1, 1,
      1, 1, 1
    ]);
  });

  test("expands per-vertex colors into edge endpoint colors", () => {
    const mesh =
      createRenderLineMesh3(
        [
          {
            x: 0,
            y: 0,
            z: 0
          },
          {
            x: 1,
            y: 0,
            z: 0
          }
        ],
        [
          [0, 1]
        ],
        [
          {
            r: 1,
            g: 0,
            b: 0
          },
          {
            r: 0,
            g: 0,
            b: 1
          }
        ]
      );

    expect(
      Array.from(
        buildLineSegmentColors(
          mesh
        )
      )
    ).toEqual([
      1, 0, 0,
      0, 0, 1
    ]);
  });

  test("rejects a color count that does not match the vertex count", () => {
    expect(() =>
      createRenderLineMesh3(
        [
          {
            x: 0,
            y: 0,
            z: 0
          },
          {
            x: 1,
            y: 0,
            z: 0
          }
        ],
        [
          [0, 1]
        ],
        [
          {
            r: 1,
            g: 1,
            b: 1
          }
        ]
      )
    ).toThrow(RangeError);
  });

  test("rejects color components outside the normalized range", () => {
    expect(() =>
      createRenderLineMesh3(
        [
          {
            x: 0,
            y: 0,
            z: 0
          },
          {
            x: 1,
            y: 0,
            z: 0
          }
        ],
        [
          [0, 1]
        ],
        [
          {
            r: 2,
            g: 0,
            b: 0
          },
          {
            r: 0,
            g: 0,
            b: 1
          }
        ]
      )
    ).toThrow(RangeError);
  });
});
