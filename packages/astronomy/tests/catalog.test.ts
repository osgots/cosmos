import {
  ASTRONOMICAL_UNIT_M,
  CELESTIAL_BODY_CATALOG,
  EARTH,
  JUPITER,
  MERCURY,
  MOON,
  NEPTUNE,
  PLANETS,
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
      "contains all eight planets in heliocentric order",
      () => {
        expect(
          PLANETS.map(
            planet =>
              planet.id
          )
        ).toEqual([
          "mercury",
          "venus",
          "earth",
          "mars",
          "jupiter",
          "saturn",
          "uranus",
          "neptune"
        ]);
      }
    );

    test(
      "catalog contains Sun, eight planets and Moon",
      () => {
        expect(
          CELESTIAL_BODY_CATALOG
        ).toHaveLength(10);
      }
    );

    test(
      "catalog IDs are unique",
      () => {
        const ids =
          CELESTIAL_BODY_CATALOG.map(
            body =>
              body.id
          );

        expect(
          new Set(ids).size
        ).toBe(ids.length);
      }
    );

    test(
      "preserves the Solar System hierarchy",
      () => {
        expect(
          SUN.parentId
        ).toBeNull();

        for (
          const planet of PLANETS
        ) {
          expect(
            planet.parentId
          ).toBe("sun");
        }

        expect(
          MOON.parentId
        ).toBe("earth");
      }
    );

    test(
      "planetary orbital scale increases from Mercury to Neptune",
      () => {
        for (
          let index = 1;
          index < PLANETS.length;
          index += 1
        ) {
          expect(
            PLANETS[index]!
              .meanOrbitDistanceM!
          ).toBeGreaterThan(
            PLANETS[index - 1]!
              .meanOrbitDistanceM!
          );
        }
      }
    );

    test(
      "planetary sidereal periods increase outward",
      () => {
        for (
          let index = 1;
          index < PLANETS.length;
          index += 1
        ) {
          expect(
            PLANETS[index]!
              .orbitalPeriodS!
          ).toBeGreaterThan(
            PLANETS[index - 1]!
              .orbitalPeriodS!
          );
        }
      }
    );

    test(
      "Earth reference orbit remains close to one au but not defined by it",
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
        ).toBeLessThan(0.00001);
      }
    );

    test(
      "Mercury is inside Earth while Neptune is beyond 30 au",
      () => {
        expect(
          MERCURY.meanOrbitDistanceM!
        ).toBeLessThan(
          EARTH.meanOrbitDistanceM!
        );

        expect(
          NEPTUNE.meanOrbitDistanceM! /
          ASTRONOMICAL_UNIT_M
        ).toBeGreaterThan(30);
      }
    );

    test(
      "Jupiter is physically larger than Earth",
      () => {
        expect(
          JUPITER.radiusM
        ).toBeGreaterThan(
          EARTH.radiusM
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
      "Earth-Moon light time remains approximately 1.28 seconds",
      () => {
        const lightTime =
          MOON.meanOrbitDistanceM! /
          SPEED_OF_LIGHT_M_PER_S;

        expect(lightTime)
          .toBeGreaterThan(1.28);

        expect(lightTime)
          .toBeLessThan(1.29);
      }
    );
  }
);
