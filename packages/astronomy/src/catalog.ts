import {
  ASTRONOMICAL_UNIT_M,
  DAY_S
} from "./constants";

import type {
  CelestialBody
} from "./CelestialBody";

function au(
  value: number
): number {
  return value *
    ASTRONOMICAL_UNIT_M;
}

function years(
  value: number
): number {
  return value *
    365.25 *
    DAY_S;
}

const JPL_PLANET_PROVENANCE =
  Object.freeze({
    authority: "NASA / JPL",
    sourceName:
      "JPL Planetary Physical Parameters + Approximate Positions of the Planets",
    parameterClass:
      "REFERENCE_PARAMETER" as const
  });

export const SUN:
  CelestialBody =
    Object.freeze({
      id: "sun",
      name: "Sun",
      kind: "star",
      parentId: null,
      radiusM: 695_700_000,
      massKg: 1.9884e30,
      meanOrbitDistanceM: null,
      orbitalPeriodS: null,
      provenance:
        Object.freeze({
          authority: "NASA",
          sourceName: "Sun Fact Sheet",
          parameterClass:
            "REFERENCE_PARAMETER"
        })
    });

export const MERCURY:
  CelestialBody =
    Object.freeze({
      id: "mercury",
      name: "Mercury",
      kind: "planet",
      parentId: "sun",
      radiusM: 2_439_400,
      massKg: 3.30103e23,
      meanOrbitDistanceM:
        au(0.38709927),
      orbitalPeriodS:
        years(0.2408467),
      provenance:
        JPL_PLANET_PROVENANCE
    });

export const VENUS:
  CelestialBody =
    Object.freeze({
      id: "venus",
      name: "Venus",
      kind: "planet",
      parentId: "sun",
      radiusM: 6_051_800,
      massKg: 4.86731e24,
      meanOrbitDistanceM:
        au(0.72333566),
      orbitalPeriodS:
        years(0.61519726),
      provenance:
        JPL_PLANET_PROVENANCE
    });

export const EARTH:
  CelestialBody =
    Object.freeze({
      id: "earth",
      name: "Earth",
      kind: "planet",
      parentId: "sun",
      radiusM: 6_371_008.4,
      massKg: 5.97217e24,
      meanOrbitDistanceM:
        au(1.00000261),
      orbitalPeriodS:
        years(1.0000174),
      provenance:
        JPL_PLANET_PROVENANCE
    });

export const MOON:
  CelestialBody =
    Object.freeze({
      id: "moon",
      name: "Moon",
      kind: "natural-satellite",
      parentId: "earth",
      radiusM: 1_737_400,
      massKg: 7.34767309245735e22,
      meanOrbitDistanceM:
        384_400_000,
      orbitalPeriodS:
        27.3 * DAY_S,
      provenance:
        Object.freeze({
          authority: "NASA / JPL",
          sourceName:
            "Earth-Moon reference parameters and JPL satellite radius",
          parameterClass:
            "REFERENCE_PARAMETER"
        })
    });

export const MARS:
  CelestialBody =
    Object.freeze({
      id: "mars",
      name: "Mars",
      kind: "planet",
      parentId: "sun",
      radiusM: 3_389_500,
      massKg: 6.41691e23,
      meanOrbitDistanceM:
        au(1.52371034),
      orbitalPeriodS:
        years(1.8808476),
      provenance:
        JPL_PLANET_PROVENANCE
    });

export const JUPITER:
  CelestialBody =
    Object.freeze({
      id: "jupiter",
      name: "Jupiter",
      kind: "planet",
      parentId: "sun",
      radiusM: 69_911_000,
      massKg: 1.898125e27,
      meanOrbitDistanceM:
        au(5.202887),
      orbitalPeriodS:
        years(11.862615),
      provenance:
        JPL_PLANET_PROVENANCE
    });

export const SATURN:
  CelestialBody =
    Object.freeze({
      id: "saturn",
      name: "Saturn",
      kind: "planet",
      parentId: "sun",
      radiusM: 58_232_000,
      massKg: 5.68317e26,
      meanOrbitDistanceM:
        au(9.53667594),
      orbitalPeriodS:
        years(29.447498),
      provenance:
        JPL_PLANET_PROVENANCE
    });

export const URANUS:
  CelestialBody =
    Object.freeze({
      id: "uranus",
      name: "Uranus",
      kind: "planet",
      parentId: "sun",
      radiusM: 25_362_000,
      massKg: 8.68099e25,
      meanOrbitDistanceM:
        au(19.18916464),
      orbitalPeriodS:
        years(84.016846),
      provenance:
        JPL_PLANET_PROVENANCE
    });

export const NEPTUNE:
  CelestialBody =
    Object.freeze({
      id: "neptune",
      name: "Neptune",
      kind: "planet",
      parentId: "sun",
      radiusM: 24_622_000,
      massKg: 1.024092e26,
      meanOrbitDistanceM:
        au(30.06992276),
      orbitalPeriodS:
        years(164.79132),
      provenance:
        JPL_PLANET_PROVENANCE
    });

export const PLANETS =
  Object.freeze([
    MERCURY,
    VENUS,
    EARTH,
    MARS,
    JUPITER,
    SATURN,
    URANUS,
    NEPTUNE
  ] as const);

export const CELESTIAL_BODY_CATALOG =
  Object.freeze([
    SUN,
    MERCURY,
    VENUS,
    EARTH,
    MOON,
    MARS,
    JUPITER,
    SATURN,
    URANUS,
    NEPTUNE
  ] as const);

export {
  ASTRONOMICAL_UNIT_M
};
