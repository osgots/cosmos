import {
  createRenderLineMesh3
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity renderer boundary", () => {
  test("creates immutable renderer-neutral line geometry", () => {
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

    expect(
      Object.isFrozen(
        mesh.vertices[0]
      )
    ).toBe(true);

    expect(
      Object.isFrozen(
        mesh.edges[0]
      )
    ).toBe(true);
  });

  test("copies input positions rather than retaining mutable objects", () => {
    const mutableVertex = {
      x: 1,
      y: 2,
      z: 3
    };

    const mesh =
      createRenderLineMesh3(
        [
          mutableVertex,
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

    mutableVertex.x =
      999;

    expect(
      mesh.vertices[0]
    ).toEqual({
      x: 1,
      y: 2,
      z: 3
    });
  });

  test("rejects NaN render coordinates", () => {
    expect(() =>
      createRenderLineMesh3(
        [
          {
            x: Number.NaN,
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
      )
    ).toThrow(RangeError);
  });

  test("rejects infinite render coordinates", () => {
    expect(() =>
      createRenderLineMesh3(
        [
          {
            x: 0,
            y: 0,
            z: 0
          },
          {
            x:
              Number.POSITIVE_INFINITY,
            y: 0,
            z: 0
          }
        ],
        [
          [0, 1]
        ]
      )
    ).toThrow(RangeError);
  });

  test("rejects edges outside the vertex array", () => {
    expect(() =>
      createRenderLineMesh3(
        [
          {
            x: 0,
            y: 0,
            z: 0
          }
        ],
        [
          [0, 1]
        ]
      )
    ).toThrow(RangeError);
  });

  test("rejects self-referencing edges", () => {
    expect(() =>
      createRenderLineMesh3(
        [
          {
            x: 0,
            y: 0,
            z: 0
          }
        ],
        [
          [0, 0]
        ]
      )
    ).toThrow(RangeError);
  });

  test("rejects non-integer edge indices", () => {
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
          [0, 1.5]
        ]
      )
    ).toThrow(RangeError);
  });
});
