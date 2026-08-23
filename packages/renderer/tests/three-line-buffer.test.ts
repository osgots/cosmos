import {
  createRenderLineMesh3
} from "../src/index";

import {
  GPU_FLOAT32_MAX,
  buildLineSegmentPositions
} from "../src/three/buildLineSegmentPositions";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity Three.js line-buffer adapter", () => {
  test("converts one render edge into two GPU vertices", () => {
    const mesh =
      createRenderLineMesh3(
        [
          {
            x: 1,
            y: 2,
            z: 3
          },
          {
            x: 4,
            y: 5,
            z: 6
          }
        ],
        [
          [0, 1]
        ]
      );

    expect(
      Array.from(
        buildLineSegmentPositions(
          mesh
        )
      )
    ).toEqual([
      1, 2, 3,
      4, 5, 6
    ]);
  });

  test("preserves edge ordering for multiple segments", () => {
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
          },
          {
            x: 1,
            y: 1,
            z: 0
          }
        ],
        [
          [0, 1],
          [1, 2]
        ]
      );

    expect(
      Array.from(
        buildLineSegmentPositions(
          mesh
        )
      )
    ).toEqual([
      0, 0, 0,
      1, 0, 0,

      1, 0, 0,
      1, 1, 0
    ]);
  });

  test("supports an empty wire mesh", () => {
    const mesh =
      createRenderLineMesh3(
        [],
        []
      );

    expect(
      buildLineSegmentPositions(
        mesh
      ).length
    ).toBe(0);
  });

  test("rejects values that would overflow a Float32 GPU coordinate", () => {
    const mesh = {
      vertices: [
        {
          x:
            GPU_FLOAT32_MAX * 2,
          y: 0,
          z: 0
        },
        {
          x: 0,
          y: 0,
          z: 0
        }
      ],
      edges: [
        [0, 1]
      ]
    } as const;

    expect(() =>
      buildLineSegmentPositions(
        mesh
      )
    ).toThrow(RangeError);
  });
});
