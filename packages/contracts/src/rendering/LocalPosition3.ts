/**
 * Renderer-neutral local 3D position.
 *
 * Physics and simulation packages MUST NOT expose THREE.Vector3.
 * The rendering layer is responsible for converting neutral
 * simulation data into GPU/Three.js representations.
 */
export interface LocalPosition3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}
