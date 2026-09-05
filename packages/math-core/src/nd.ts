export interface ProjectionBasis3ND {
  readonly x: readonly number[];
  readonly y: readonly number[];
  readonly z: readonly number[];
}

export interface HypercubeCombinatorics {
  readonly dimension: number;
  readonly vertices: bigint;
  readonly edges: bigint;
}

export function validateDimension(
  dimension: number,
  maximum = 99
): number {
  if (
    !Number.isInteger(dimension) ||
    dimension < 1 ||
    dimension > maximum
  ) {
    throw new RangeError(
      `Dimension must be an integer from 1 to ${maximum}.`
    );
  }

  return dimension;
}

export function hypercubeCombinatorics(
  dimension: number
): HypercubeCombinatorics {
  const n = validateDimension(dimension);
  const vertices =
    1n << BigInt(n);
  const edges =
    BigInt(n) *
    (1n << BigInt(n - 1));

  return Object.freeze({
    dimension: n,
    vertices,
    edges
  });
}

export function rotateVectorNDInPlane(
  vector: readonly number[],
  axisA: number,
  axisB: number,
  angleRad: number
): readonly number[] {
  const dimension =
    validateDimension(vector.length);

  if (
    !Number.isInteger(axisA) ||
    !Number.isInteger(axisB) ||
    axisA < 0 ||
    axisB < 0 ||
    axisA >= dimension ||
    axisB >= dimension ||
    axisA === axisB
  ) {
    throw new RangeError(
      "Rotation axes must be distinct valid coordinate indices."
    );
  }

  if (!Number.isFinite(angleRad)) {
    throw new RangeError(
      "Rotation angle must be finite."
    );
  }

  const result =
    [...vector];

  const cosine =
    Math.cos(angleRad);
  const sine =
    Math.sin(angleRad);
  const a = vector[axisA]!;
  const b = vector[axisB]!;

  result[axisA] =
    a * cosine -
    b * sine;
  result[axisB] =
    a * sine +
    b * cosine;

  return Object.freeze(result);
}

function dot(
  first: readonly number[],
  second: readonly number[]
): number {
  let value = 0;

  for (
    let index = 0;
    index < first.length;
    index += 1
  ) {
    value +=
      first[index]! *
      second[index]!;
  }

  return value;
}

function normalize(
  vector: readonly number[]
): readonly number[] {
  const magnitude =
    Math.sqrt(
      Math.max(
        Number.EPSILON,
        dot(vector, vector)
      )
    );

  return Object.freeze(
    vector.map(
      component =>
        component / magnitude
    )
  );
}

function subtractProjection(
  source: readonly number[],
  basis: readonly number[]
): readonly number[] {
  const amount =
    dot(source, basis);

  return source.map(
    (
      component,
      index
    ) =>
      component -
      amount * basis[index]!
  );
}

/**
 * Deterministic orthonormal projection basis from R^n into R^3.
 *
 * This is a mathematical visualization basis, not a claim that hidden
 * physical dimensions point in these directions. Gram-Schmidt keeps the
 * three rendered axes independent for n >= 3.
 */
export function createProjectionBasis3ND(
  dimension: number
): ProjectionBasis3ND {
  const n =
    validateDimension(dimension);

  const rawX =
    Array.from(
      { length: n },
      (_, index) =>
        Math.cos(
          (index + 1) *
          0.754877666
        )
    );

  const rawY =
    Array.from(
      { length: n },
      (_, index) =>
        Math.sin(
          (index + 1) *
          1.13264796 +
          0.37
        )
    );

  const rawZ =
    Array.from(
      { length: n },
      (_, index) =>
        Math.cos(
          (index + 1) *
          1.618033989 +
          0.91
        )
    );

  const x = normalize(rawX);

  const y =
    n >= 2
      ? normalize(
          subtractProjection(
            rawY,
            x
          )
        )
      : Object.freeze([0]);

  const z =
    n >= 3
      ? normalize(
          subtractProjection(
            subtractProjection(
              rawZ,
              x
            ),
            y
          )
        )
      : Object.freeze(
          Array.from(
            { length: n },
            () => 0
          )
        );

  return Object.freeze({
    x,
    y,
    z
  });
}

export function projectVectorNDTo3D(
  vector: readonly number[],
  basis:
    ProjectionBasis3ND =
      createProjectionBasis3ND(
        vector.length
      )
): readonly [number, number, number] {
  validateDimension(vector.length);

  if (
    basis.x.length !== vector.length ||
    basis.y.length !== vector.length ||
    basis.z.length !== vector.length
  ) {
    throw new RangeError(
      "Projection basis dimension must match the vector dimension."
    );
  }

  return Object.freeze([
    dot(vector, basis.x),
    dot(vector, basis.y),
    dot(vector, basis.z)
  ] as const);
}
