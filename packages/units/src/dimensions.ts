/**
 * Physical-dimension families currently supported by the COSMOS Infinity
 * units foundation.
 *
 * This is intentionally small. New dimensions and dimensional algebra
 * will be introduced only when the corresponding physics modules require
 * them.
 */
export const Dimension = {
  Dimensionless: "DIMENSIONLESS",

  Length: "LENGTH",
  Time: "TIME",
  Mass: "MASS",

  Velocity: "VELOCITY",
  Acceleration: "ACCELERATION",
  Energy: "ENERGY"
} as const;

export type Dimension =
  (typeof Dimension)[keyof typeof Dimension];
