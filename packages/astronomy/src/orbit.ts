export interface OrbitalPosition2 {
  readonly xM: number;
  readonly zM: number;
}

function requirePositiveFinite(
  value: number,
  name: string
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new RangeError(
      `${name} must be a positive finite number.`
    );
  }
}

/**
 * Circular-orbit approximation.
 *
 * This is intentionally an approximation and must not later be
 * confused with a full Keplerian/N-body orbit model.
 */
export function circularOrbitPosition(
  radiusM: number,
  periodS: number,
  elapsedS: number,
  phaseOffsetRad = 0
): OrbitalPosition2 {
  requirePositiveFinite(
    radiusM,
    "Orbit radius"
  );

  requirePositiveFinite(
    periodS,
    "Orbital period"
  );

  if (
    !Number.isFinite(elapsedS) ||
    !Number.isFinite(
      phaseOffsetRad
    )
  ) {
    throw new RangeError(
      "Orbit time and phase must be finite."
    );
  }

  const phase =
    (
      (
        elapsedS /
        periodS
      ) *
      Math.PI *
      2
    ) +
    phaseOffsetRad;

  return Object.freeze({
    xM:
      Math.cos(
        phase
      ) *
      radiusM,

    zM:
      Math.sin(
        phase
      ) *
      radiusM
  });
}

export function lightTravelTimeS(
  distanceM: number,
  speedOfLightMPerS:
    number
): number {
  requirePositiveFinite(
    distanceM,
    "Distance"
  );

  requirePositiveFinite(
    speedOfLightMPerS,
    "Speed of light"
  );

  return (
    distanceM /
    speedOfLightMPerS
  );
}
