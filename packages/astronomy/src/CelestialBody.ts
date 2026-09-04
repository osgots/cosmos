export type CelestialBodyId =
  | "sun"
  | "earth"
  | "moon";

export type CelestialBodyKind =
  | "star"
  | "planet"
  | "natural-satellite";

export type CelestialBodyParentId =
  | CelestialBodyId
  | null;

/**
 * Source classification for the numerical parameter set.
 *
 * This is intentionally separate from COSMOS∞'s higher-level
 * scientific-honesty taxonomy. Later scenes can independently label
 * observed facts, models, extrapolations and speculative content.
 */
export type AstronomyParameterClass =
  | "REFERENCE_PARAMETER"
  | "APPROXIMATION";

export interface AstronomyProvenance {
  readonly authority: string;
  readonly sourceName: string;
  readonly parameterClass:
    AstronomyParameterClass;
}

export interface CelestialBody {
  readonly id:
    CelestialBodyId;

  readonly name:
    string;

  readonly kind:
    CelestialBodyKind;

  readonly parentId:
    CelestialBodyParentId;

  /**
   * Representative physical radius in metres.
   */
  readonly radiusM:
    number;

  /**
   * Mass in kilograms.
   */
  readonly massKg:
    number;

  /**
   * Representative orbital distance from parent body's centre.
   *
   * null for the root body of this initial catalog.
   */
  readonly meanOrbitDistanceM:
    number | null;

  /**
   * Sidereal orbital period in seconds.
   *
   * null for the catalog root.
   */
  readonly orbitalPeriodS:
    number | null;

  readonly provenance:
    AstronomyProvenance;
}
