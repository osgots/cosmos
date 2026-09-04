import {
  ASTRONOMICAL_UNIT_M,
  CELESTIAL_BODY_CATALOG,
  EARTH,
  MOON,
  SPEED_OF_LIGHT_M_PER_S,
  SUN
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe(
  "COSMOS Infinity astronomy catalog",
  () => {
    test(
      "defines the astronomical unit exactly",
      () => {
        expect(
          ASTRONOMICAL_UNIT_M
        ).toBe(
          149_597_870_700
        );
      }
    );

    test(
      "uses the exact SI speed of light",
      () => {
        expect(
          SPEED_OF_LIGHT_M_PER_S
        ).toBe(
          299_792_458
        );
      }
    );

    test(
      "starts with exactly Sun, Earth and Moon",
      () => {
        expect(
          CELESTIAL_BODY_CATALOG.map(
            (
              body
            ) =>
              body.id
          )
        ).toEqual([
          "sun",
          "earth",
          "moon"
        ]);
      }
    );

    test(
      "has correct hierarchy",
      () => {
        expect(
          SUN.parentId
        ).toBeNull();

        expect(
          EARTH.parentId
        ).toBe(
          "sun"
        );

        expect(
          MOON.parentId
        ).toBe(
          "earth"
        );
      }
    );

    test(
      "preserves physical size ordering",
      () => {
        expect(
          SUN.radiusM
        ).toBeGreaterThan(
          EARTH.radiusM
        );

        expect(
          EARTH.radiusM
        ).toBeGreaterThan(
          MOON.radiusM
        );
      }
    );

    test(
      "uses the representative Moon orbital distance",
      () => {
        expect(
          MOON.meanOrbitDistanceM
        ).toBe(
          384_400_000
        );
      }
    );

    test(
      "does not incorrectly define Earth's orbit as exactly one au",
      () => {
        expect(
          EARTH.meanOrbitDistanceM
        ).not.toBe(
          ASTRONOMICAL_UNIT_M
        );

        const relativeDifference =
          Math.abs(
            EARTH.meanOrbitDistanceM! -
            ASTRONOMICAL_UNIT_M
          ) /
          ASTRONOMICAL_UNIT_M;

        expect(
          relativeDifference
        ).toBeLessThan(
          0.00001
        );
      }
    );

    test(
      "contains only positive finite physical parameters",
      () => {
        for (
          const body of
            CELESTIAL_BODY_CATALOG
        ) {
          expect(
            Number.isFinite(
              body.radiusM
            )
          ).toBe(true);

          expect(
            body.radiusM
          ).toBeGreaterThan(0);

          expect(
            Number.isFinite(
              body.massKg
            )
          ).toBe(true);

          expect(
            body.massKg
          ).toBeGreaterThan(0);

          if (
            body.meanOrbitDistanceM !==
            null
          ) {
            expect(
              Number.isFinite(
                body.meanOrbitDistanceM
              )
            ).toBe(true);

            expect(
              body.meanOrbitDistanceM
            ).toBeGreaterThan(0);
          }

          if (
            body.orbitalPeriodS !==
            null
          ) {
            expect(
              Number.isFinite(
                body.orbitalPeriodS
              )
            ).toBe(true);

            expect(
              body.orbitalPeriodS
            ).toBeGreaterThan(0);
          }
        }
      }
    );

    test(
      "Earth-Moon light time is approximately 1.28 seconds",
      () => {
        const lightTime =
          MOON.meanOrbitDistanceM! /
          SPEED_OF_LIGHT_M_PER_S;

        expect(
          lightTime
        ).toBeGreaterThan(
          1.28
        );

        expect(
          lightTime
        ).toBeLessThan(
          1.29
        );
      }
    );
  }
);
