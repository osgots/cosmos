import {
  describe,
  expect,
  test
} from "vitest";

import {
  createProjectionBasis3ND,
  hypercubeCombinatorics,
  projectVectorNDTo3D,
  rotateVectorNDInPlane,
  validateDimension
} from "../src/index";

function magnitude(
  vector: readonly number[]
): number {
  return Math.sqrt(
    vector.reduce(
      (
        total,
        component
      ) =>
        total +
        component * component,
      0
    )
  );
}

describe(
  "n-dimensional math foundation",
  () => {
    test(
      "accepts dimensions one through ninety-nine",
      () => {
        expect(
          validateDimension(1)
        ).toBe(1);

        expect(
          validateDimension(99)
        ).toBe(99);

        expect(
          () =>
            validateDimension(0)
        ).toThrow(
          RangeError
        );

        expect(
          () =>
            validateDimension(100)
        ).toThrow(
          RangeError
        );
      }
    );

    test(
      "computes exact hypercube combinatorics with BigInt",
      () => {
        const four =
          hypercubeCombinatorics(4);

        expect(
          four.vertices
        ).toBe(16n);
        expect(
          four.edges
        ).toBe(32n);

        const ninetyNine =
          hypercubeCombinatorics(99);

        expect(
          ninetyNine.vertices
        ).toBe(
          1n << 99n
        );
        expect(
          ninetyNine.edges
        ).toBe(
          99n *
          (1n << 98n)
        );
      }
    );

    test(
      "Givens rotation preserves Euclidean magnitude",
      () => {
        const vector = [
          2,
          -3,
          5,
          7,
          -11
        ] as const;

        const rotated =
          rotateVectorNDInPlane(
            vector,
            1,
            4,
            Math.PI / 3
          );

        expect(
          magnitude(rotated)
        ).toBeCloseTo(
          magnitude(vector),
          12
        );

        expect(
          rotated[0]
        ).toBe(vector[0]);
        expect(
          rotated[2]
        ).toBe(vector[2]);
        expect(
          rotated[3]
        ).toBe(vector[3]);
      }
    );

    test(
      "creates finite deterministic 3D projection bases",
      () => {
        const first =
          createProjectionBasis3ND(12);
        const second =
          createProjectionBasis3ND(12);

        expect(first).toEqual(second);

        const projected =
          projectVectorNDTo3D(
            Array.from(
              { length: 12 },
              (_, index) =>
                index % 2 === 0
                  ? 1
                  : -1
            ),
            first
          );

        for (
          const coordinate of projected
        ) {
          expect(
            Number.isFinite(coordinate)
          ).toBe(true);
        }
      }
    );
  }
);
