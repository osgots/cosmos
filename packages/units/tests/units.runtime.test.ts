import {
  Dimension,
  add,
  divideLengthByTime,
  divideVelocityByTime,
  meters,
  metersPerSecond,
  scale,
  seconds,
  subtract,
  type Length
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity dimensional units", () => {
  test("creates a canonical SI length", () => {
    const distance = meters(42);

    expect(distance.siValue).toBe(42);
    expect(distance.dimension).toBe(Dimension.Length);
    expect(Object.isFrozen(distance)).toBe(true);
  });

  test("adds quantities with the same dimension", () => {
    const result = add(
      meters(1),
      meters(2)
    );

    expect(result.siValue).toBe(3);
    expect(result.dimension).toBe(Dimension.Length);
  });

  test("subtracts quantities with the same dimension", () => {
    const result = subtract(
      meters(10),
      meters(4)
    );

    expect(result.siValue).toBe(6);
    expect(result.dimension).toBe(Dimension.Length);
  });

  test("scales a quantity while preserving its dimension", () => {
    const result = scale(
      meters(5),
      3
    );

    expect(result.siValue).toBe(15);
    expect(result.dimension).toBe(Dimension.Length);
  });

  test("computes velocity from length divided by time", () => {
    const result = divideLengthByTime(
      meters(10),
      seconds(2)
    );

    expect(result.siValue).toBe(5);
    expect(result.dimension).toBe(Dimension.Velocity);
  });

  test("computes acceleration from velocity divided by time", () => {
    const result = divideVelocityByTime(
      metersPerSecond(10),
      seconds(2)
    );

    expect(result.siValue).toBe(5);
    expect(result.dimension).toBe(Dimension.Acceleration);
  });

  test("rejects NaN quantities", () => {
    expect(() => meters(Number.NaN)).toThrow(RangeError);
  });

  test("rejects positive infinity", () => {
    expect(() => meters(Number.POSITIVE_INFINITY))
      .toThrow(RangeError);
  });

  test("rejects negative infinity", () => {
    expect(() => meters(Number.NEGATIVE_INFINITY))
      .toThrow(RangeError);
  });

  test("rejects non-finite scaling factors", () => {
    expect(() =>
      scale(
        meters(1),
        Number.POSITIVE_INFINITY
      )
    ).toThrow(RangeError);
  });

  test("rejects division by zero time", () => {
    expect(() =>
      divideLengthByTime(
        meters(10),
        seconds(0)
      )
    ).toThrow(RangeError);
  });

  test("rejects runtime dimension corruption", () => {
    /**
     * This intentionally bypasses TypeScript to simulate data arriving
     * from an unsafe external boundary such as JSON, worker data,
     * IndexedDB, network input, or future WASM code.
     */
    const corruptedLength =
      seconds(1) as unknown as Length;

    expect(() =>
      add(
        meters(1),
        corruptedLength
      )
    ).toThrow(TypeError);
  });
});
