import {
  ASTRONOMICAL_UNIT_M,
  DAY_S
} from "./constants";

import type {
  CelestialBody
} from "./CelestialBody";

/**
 * Initial COSMOS∞ astronomical catalog.
 *
 * These are physical/reference parameters.
 *
 * Rendering scale is deliberately NOT stored here.
 * A renderer may enlarge a body for visibility, but it may never
 * overwrite these physical values.
 */

export const SUN:
  CelestialBody =
    Object.freeze({
      id: "sun",

      name: "Sun",

      kind: "star",

      parentId: null,

      radiusM:
        695_700_000,

      massKg:
        1.9884e30,

      meanOrbitDistanceM:
        null,

      orbitalPeriodS:
        null,

      provenance:
        Object.freeze({
          authority:
            "NASA",

          sourceName:
            "Sun Fact Sheet",

          parameterClass:
            "REFERENCE_PARAMETER"
        })
    });

export const EARTH:
  CelestialBody =
    Object.freeze({
      id: "earth",

      name: "Earth",

      kind: "planet",

      parentId: "sun",

      radiusM:
        6_371_000,

      massKg:
        5.97219e24,

      /*
       * NASA/JPL representative average orbital distance.
       *
       * Notice that this is NOT forced to equal exactly 1 au.
       */
      meanOrbitDistanceM:
        149_598_262_000,

      orbitalPeriodS:
        365.25636 *
        DAY_S,

      provenance:
        Object.freeze({
          authority:
            "NASA / JPL",

          sourceName:
            "Solar System Dynamics reference parameters",

          parameterClass:
            "REFERENCE_PARAMETER"
        })
    });

export const MOON:
  CelestialBody =
    Object.freeze({
      id: "moon",

      name: "Moon",

      kind:
        "natural-satellite",

      parentId:
        "earth",

      radiusM:
        1_737_500,

      massKg:
        7.34767309245735e22,

      meanOrbitDistanceM:
        384_400_000,

      orbitalPeriodS:
        27.3 *
        DAY_S,

      provenance:
        Object.freeze({
          authority:
            "NASA / JPL",

          sourceName:
            "Earth and Moon reference parameters",

          parameterClass:
            "REFERENCE_PARAMETER"
        })
    });

export const CELESTIAL_BODY_CATALOG:
  readonly CelestialBody[] =
    Object.freeze([
      SUN,
      EARTH,
      MOON
    ]);

/**
 * Exact unit definition exported next to the catalog for convenience.
 *
 * Do not replace Earth's orbital parameter with this value.
 */
export {
  ASTRONOMICAL_UNIT_M
};
