import {
  createProjectionBasis3ND,
  hypercubeCombinatorics,
  projectVectorNDTo3D,
  rotateVectorNDInPlane,
  validateDimension
} from "@cosmos/math-core";

import type {
  RenderColor3,
  RenderLineMesh3,
  RenderPosition3
} from "@cosmos/renderer";

export interface NDHypercubeRenderResult {
  readonly mesh: RenderLineMesh3;
  readonly exact: boolean;
  readonly theoreticalVertices: bigint;
  readonly theoreticalEdges: bigint;
}

export interface NDHypercubeOptions {
  readonly dimension: number;
  readonly axisA: number;
  readonly axisB: number;
  readonly angleRad: number;
  readonly sampleEdgeLimit?: number;
}

const NEGATIVE_HIDDEN: RenderColor3 =
  Object.freeze({
    r: 0.16,
    g: 0.58,
    b: 1
  });

const MID_HIDDEN: RenderColor3 =
  Object.freeze({
    r: 0.92,
    g: 0.97,
    b: 1
  });

const POSITIVE_HIDDEN: RenderColor3 =
  Object.freeze({
    r: 1,
    g: 0.43,
    b: 0.16
  });

function clamp01(
  value: number
): number {
  return Math.max(
    0,
    Math.min(1, value)
  );
}

function mix(
  first: RenderColor3,
  second: RenderColor3,
  amount: number
): RenderColor3 {
  const t = clamp01(amount);

  return {
    r:
      first.r +
      (second.r - first.r) * t,
    g:
      first.g +
      (second.g - first.g) * t,
    b:
      first.b +
      (second.b - first.b) * t
  };
}

function hiddenCoordinateColor(
  vector: readonly number[]
): RenderColor3 {
  if (vector.length <= 3) {
    return MID_HIDDEN;
  }

  let weighted = 0;
  let normalization = 0;

  for (
    let index = 3;
    index < vector.length;
    index += 1
  ) {
    const weight =
      1 /
      Math.sqrt(index - 1);

    weighted +=
      vector[index]! * weight;
    normalization += weight;
  }

  const normalized =
    normalization > 0
      ? Math.tanh(
          weighted /
          normalization * 2.2
        )
      : 0;

  return normalized < 0
    ? mix(
        MID_HIDDEN,
        NEGATIVE_HIDDEN,
        -normalized
      )
    : mix(
        MID_HIDDEN,
        POSITIVE_HIDDEN,
        normalized
      );
}

function seededRandom(
  seed: number
): () => number {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;

    let result = value;

    result = Math.imul(
      result ^ result >>> 15,
      result | 1
    );

    result ^= result +
      Math.imul(
        result ^ result >>> 7,
        result | 61
      );

    return (
      (
        result ^ result >>> 14
      ) >>> 0
    ) /
      4_294_967_296;
  };
}

function projectVertex(
  vector: readonly number[],
  basis: ReturnType<
    typeof createProjectionBasis3ND
  >
): RenderPosition3 {
  const [x, y, z] =
    projectVectorNDTo3D(
      vector,
      basis
    );

  const dimensionScale =
    Math.max(
      1,
      Math.sqrt(vector.length / 3)
    );

  return {
    x:
      x /
      dimensionScale,
    y:
      y /
      dimensionScale,
    z:
      z /
      dimensionScale
  };
}

function rotateIfPossible(
  vector: readonly number[],
  dimension: number,
  axisA: number,
  axisB: number,
  angleRad: number
): readonly number[] {
  if (dimension < 2) {
    return vector;
  }

  return rotateVectorNDInPlane(
    vector,
    axisA,
    axisB,
    angleRad
  );
}

function exactHypercube(
  dimension: number,
  axisA: number,
  axisB: number,
  angleRad: number
): RenderLineMesh3 {
  const vertexCount =
    1 << dimension;
  const basis =
    createProjectionBasis3ND(
      dimension
    );

  const vectors:
    readonly number[][] =
      Array.from(
        { length: vertexCount },
        (_, vertexIndex) =>
          Array.from(
            { length: dimension },
            (_, axis) =>
              (
                vertexIndex &
                (1 << axis)
              ) !== 0
                ? 1
                : -1
          )
      );

  const rotated =
    vectors.map(
      vector =>
        rotateIfPossible(
          vector,
          dimension,
          axisA,
          axisB,
          angleRad
        )
    );

  const vertices =
    rotated.map(
      vector =>
        projectVertex(
          vector,
          basis
        )
    );

  const vertexColors =
    rotated.map(
      hiddenCoordinateColor
    );

  const edges:
    Array<readonly [number, number]> = [];

  for (
    let vertex = 0;
    vertex < vertexCount;
    vertex += 1
  ) {
    for (
      let axis = 0;
      axis < dimension;
      axis += 1
    ) {
      const bit =
        1 << axis;

      if (
        (vertex & bit) !== 0
      ) {
        continue;
      }

      edges.push([
        vertex,
        vertex | bit
      ] as const);
    }
  }

  return {
    vertices,
    edges,
    vertexColors
  };
}

function sampledHypercube(
  dimension: number,
  axisA: number,
  axisB: number,
  angleRad: number,
  edgeLimit: number
): RenderLineMesh3 {
  const basis =
    createProjectionBasis3ND(
      dimension
    );

  const random =
    seededRandom(
      dimension * 97_531 +
      Math.round(
        angleRad * 10_000
      )
    );

  const vertices:
    RenderPosition3[] = [];
  const edges:
    Array<readonly [number, number]> = [];
  const vertexColors:
    RenderColor3[] = [];

  for (
    let sample = 0;
    sample < edgeLimit;
    sample += 1
  ) {
    const axis =
      sample % dimension;

    const first =
      Array.from(
        { length: dimension },
        () =>
          random() > 0.5
            ? 1
            : -1
      );

    const second =
      [...first];

    second[axis] =
      -second[axis]!;

    const firstRotated =
      rotateIfPossible(
        first,
        dimension,
        axisA,
        axisB,
        angleRad
      );

    const secondRotated =
      rotateIfPossible(
        second,
        dimension,
        axisA,
        axisB,
        angleRad
      );

    const startIndex =
      vertices.length;

    vertices.push(
      projectVertex(
        firstRotated,
        basis
      ),
      projectVertex(
        secondRotated,
        basis
      )
    );

    vertexColors.push(
      hiddenCoordinateColor(
        firstRotated
      ),
      hiddenCoordinateColor(
        secondRotated
      )
    );

    edges.push([
      startIndex,
      startIndex + 1
    ] as const);
  }

  return {
    vertices,
    edges,
    vertexColors
  };
}

export function createNDHypercubeRenderResult(
  options: NDHypercubeOptions
): NDHypercubeRenderResult {
  const dimension =
    validateDimension(
      options.dimension
    );

  const combinatorics =
    hypercubeCombinatorics(
      dimension
    );

  const axisA =
    dimension < 2
      ? 0
      : Math.max(
          0,
          Math.min(
            dimension - 1,
            Math.trunc(
              options.axisA
            )
          )
        );

  let axisB =
    dimension < 2
      ? 0
      : Math.max(
          0,
          Math.min(
            dimension - 1,
            Math.trunc(
              options.axisB
            )
          )
        );

  if (
    dimension >= 2 &&
    axisA === axisB
  ) {
    axisB =
      (axisA + 1) % dimension;
  }

  const exact =
    dimension <= 10;

  const mesh =
    exact
      ? exactHypercube(
          dimension,
          axisA,
          axisB,
          options.angleRad
        )
      : sampledHypercube(
          dimension,
          axisA,
          axisB,
          options.angleRad,
          Math.max(
            400,
            Math.min(
              6_000,
              Math.trunc(
                options.sampleEdgeLimit ??
                3_200
              )
            )
          )
        );

  return Object.freeze({
    mesh,
    exact,
    theoreticalVertices:
      combinatorics.vertices,
    theoreticalEdges:
      combinatorics.edges
  });
}
