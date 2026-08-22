/**
 * High-level physical scale regime used by the future Scale Engine.
 *
 * These categories do NOT impose discrete limits on physical scale.
 * COSMOS Infinity will maintain a continuous scale system; this
 * contract only identifies the family of physics/visualization
 * models appropriate to a region.
 *
 * Implemented as an erasable JavaScript object rather than a
 * TypeScript enum.
 */
export const ScaleRegime = {
  FundamentalFrontier: "FUNDAMENTAL_FRONTIER",
  Particle: "PARTICLE",
  Nuclear: "NUCLEAR",
  Atomic: "ATOMIC",
  Molecular: "MOLECULAR",
  Biological: "BIOLOGICAL",
  Human: "HUMAN",
  Planetary: "PLANETARY",
  Stellar: "STELLAR",
  Galactic: "GALACTIC",
  LargeScaleStructure: "LARGE_SCALE_STRUCTURE",
  Cosmological: "COSMOLOGICAL",
  BeyondObservable: "BEYOND_OBSERVABLE",
  AbstractMathematical: "ABSTRACT_MATHEMATICAL"
} as const;

export type ScaleRegime =
  (typeof ScaleRegime)[keyof typeof ScaleRegime];
