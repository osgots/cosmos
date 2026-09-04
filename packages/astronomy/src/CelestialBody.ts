export type CelestialBodyId =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "moon"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export type CelestialBodyKind =
  | "star"
  | "planet"
  | "natural-satellite";

export type CelestialBodyParentId =
  | CelestialBodyId
  | null;

export type AstronomyParameterClass =
  | "REFERENCE_PARAMETER"
  | "APPROXIMATION";

export interface AstronomyProvenance {
  readonly authority: string;
  readonly sourceName: string;
  readonly parameterClass: AstronomyParameterClass;
}

export interface CelestialBody {
  readonly id: CelestialBodyId;
  readonly name: string;
  readonly kind: CelestialBodyKind;
  readonly parentId: CelestialBodyParentId;

  /** Representative mean physical radius in metres. */
  readonly radiusM: number;

  /** Mass in kilograms. */
  readonly massKg: number;

  /**
   * Representative orbital scale from the parent body's centre.
   *
   * For the eight planets the current catalog uses the JPL fitted
   * semi-major-axis parameter that drives the circularized visual orbit.
   * For the Moon it uses the representative Earth-Moon mean distance.
   *
   * This compatibility field will later be superseded by full orbital
   * elements / ephemerides without changing the renderer boundary.
   */
  readonly meanOrbitDistanceM: number | null;

  /** Sidereal orbital period in seconds. */
  readonly orbitalPeriodS: number | null;

  readonly provenance: AstronomyProvenance;
}
