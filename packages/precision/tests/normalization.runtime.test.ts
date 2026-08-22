import {
  localCoordinate3,
  normalizeSectorPosition3,
  relativePosition3,
  sectorPosition3,
  zeroLocalCoordinate
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe("COSMOS Infinity sector normalization", () => {
  test("moves positive local overflow into the next sector", () => {
    const position = sectorPosition3(
      10n,
      20n,
      30n,
      localCoordinate3(
        1_250,
        200,
        300
      )
    );

    const normalized =
      normalizeSectorPosition3(
        position,
        1_000
      );

    expect(normalized).toEqual({
      sectorX: 11n,
      sectorY: 20n,
      sectorZ: 30n,
      local: {
        x: 250,
        y: 200,
        z: 300
      }
    });
  });

  test("moves negative local overflow into the previous sector", () => {
    const position = sectorPosition3(
      10n,
      20n,
      30n,
      localCoordinate3(
        -25,
        200,
        300
      )
    );

    const normalized =
      normalizeSectorPosition3(
        position,
        1_000
      );

    expect(normalized).toEqual({
      sectorX: 9n,
      sectorY: 20n,
      sectorZ: 30n,
      local: {
        x: 975,
        y: 200,
        z: 300
      }
    });
  });

  test("normalizes multiple sectors of overflow", () => {
    const position = sectorPosition3(
      5n,
      -5n,
      100n,
      localCoordinate3(
        3_250,
        -2_250,
        4_000
      )
    );

    const normalized =
      normalizeSectorPosition3(
        position,
        1_000
      );

    expect(normalized).toEqual({
      sectorX: 8n,
      sectorY: -8n,
      sectorZ: 104n,
      local: {
        x: 250,
        y: 750,
        z: 0
      }
    });
  });

  test("preserves enormous BigInt sector coordinates exactly", () => {
    const huge =
      999999999999999999999999999999999999n;

    const normalized =
      normalizeSectorPosition3(
        sectorPosition3(
          huge,
          huge,
          huge,
          localCoordinate3(
            1_500,
            -500,
            500
          )
        ),
        1_000
      );

    expect(normalized.sectorX)
      .toBe(huge + 1n);

    expect(normalized.sectorY)
      .toBe(huge - 1n);

    expect(normalized.sectorZ)
      .toBe(huge);

    expect(normalized.local).toEqual({
      x: 500,
      y: 500,
      z: 500
    });
  });

  test("leaves an already canonical position unchanged", () => {
    const position = sectorPosition3(
      1n,
      2n,
      3n,
      localCoordinate3(
        100,
        200,
        300
      )
    );

    expect(
      normalizeSectorPosition3(
        position,
        1_000
      )
    ).toEqual(position);
  });

  test("normalization preserves observer-relative physical position", () => {
    const observer = sectorPosition3(
      10n,
      0n,
      0n,
      zeroLocalCoordinate()
    );

    const nonCanonical =
      sectorPosition3(
        10n,
        0n,
        0n,
        localCoordinate3(
          1_250,
          0,
          0
        )
      );

    const normalized =
      normalizeSectorPosition3(
        nonCanonical,
        1_000
      );

    const before =
      relativePosition3(
        nonCanonical,
        observer,
        1_000
      );

    const after =
      relativePosition3(
        normalized,
        observer,
        1_000
      );

    expect(after).toEqual(before);

    expect(after).toEqual({
      x: 1_250,
      y: 0,
      z: 0
    });
  });

  test("rejects local overflow requiring an unsafe integer carry", () => {
    const position =
      sectorPosition3(
        0n,
        0n,
        0n,
        localCoordinate3(
          Number.MAX_SAFE_INTEGER + 1,
          0,
          0
        )
      );

    expect(() =>
      normalizeSectorPosition3(
        position,
        1
      )
    ).toThrow(RangeError);
  });

  test("rejects invalid sector size", () => {
    const position =
      sectorPosition3(
        0n,
        0n,
        0n,
        zeroLocalCoordinate()
      );

    expect(() =>
      normalizeSectorPosition3(
        position,
        0
      )
    ).toThrow(RangeError);

    expect(() =>
      normalizeSectorPosition3(
        position,
        Number.NaN
      )
    ).toThrow(RangeError);
  });
});
