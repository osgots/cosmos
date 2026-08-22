/**
 * Immutable numeric vectors used by COSMOS Infinity mathematics.
 *
 * These vectors deliberately contain raw dimensionless numbers.
 * Physical units belong to higher-level physics/domain layers.
 */

export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export interface Vector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Vector4 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}
