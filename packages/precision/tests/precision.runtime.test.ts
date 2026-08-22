import {
  localCoordinate3,
  parseSector,
  relativePosition3,
  sector,
  sectorPosition3,
  zeroLocalCoordinate
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity precision foundation", () => {
  test("preserves extremely large integer sector coordinates exactly", () => {
    const value =
      "918273645918273645918273645918273645";

    expect(parseSector(value).toString()).toBe(value);
  });

  test("supports negative enormous sector coordinates", () => {
    const value =
      "-918273645918273645918273645918273645";

    expect(parseSector(value).toString()).toBe(value);
  });

  test("rejects malformed sector strings", () => {
    expect(() =>
      parseSector("12.5")
    ).toThrow(TypeError);

    expect(() =>
      parseSector("abc")
    ).toThrow(TypeError);
  });

  test("rejects non-finite local coordinates", () => {
    expect(() =>
      localCoordinate3(
        Number.NaN,
        0,
        0
      )
    ).toThrow(RangeError);
  });

  test("computes same-sector observer-relative position", () => {
    const observer = sectorPosition3(
      sector(10n),
      sector(20n),
      sector(30n),
      localCoordinate3(100, 200, 300)
    );

    const target = sectorPosition3(
      sector(10n),
      sector(20n),
      sector(30n),
      localCoordinate3(150, 180, 330)
    );

    expect(
      relativePosition3(
        target,
        observer,
        1_000
      )
    ).toEqual({
      x: 50,
      y: -20,
      z: 30
    });
  });

  test("computes adjacent-sector relative position", () => {
    const observer = sectorPosition3(
      100n,
      0n,
      0n,
      zeroLocalCoordinate()
    );

    const target = sectorPosition3(
      101n,
      0n,
      0n,
      localCoordinate3(25, 0, 0)
    );

    expect(
      relativePosition3(
        target,
        observer,
        1_000
      )
    ).toEqual({
      x: 1_025,
      y: 0,
      z: 0
    });
  });

  test("works even when absolute sectors are enormous", () => {
    const origin =
      999999999999999999999999999999999999n;

    const observer = sectorPosition3(
      origin,
      origin,
      origin,
      zeroLocalCoordinate()
    );

    const target = sectorPosition3(
      origin + 1n,
      origin - 1n,
      origin,
      localCoordinate3(5, 10, 15)
    );

    expect(
      relativePosition3(
        target,
        observer,
        1_000
      )
    ).toEqual({
      x: 1_005,
      y: -990,
      z: 15
    });
  });

  test("rejects invalid sector size", () => {
    const position = sectorPosition3(
      0n,
      0n,
      0n,
      zeroLocalCoordinate()
    );

    expect(() =>
      relativePosition3(
        position,
        position,
        0
      )
    ).toThrow(RangeError);
  });

  test("rejects unsafe direct rendering sector distances", () => {
    const observer = sectorPosition3(
      0n,
      0n,
      0n,
      zeroLocalCoordinate()
    );

    const target = sectorPosition3(
      BigInt(Number.MAX_SAFE_INTEGER) + 1n,
      0n,
      0n,
      zeroLocalCoordinate()
    );

    expect(() =>
      relativePosition3(
        target,
        observer,
        1
      )
    ).toThrow(RangeError);
  });
});
