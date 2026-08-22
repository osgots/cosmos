import type { LocalCoordinate3 } from "./LocalCoordinate";

import type {
  SectorPosition3
} from "./SectorPosition";

export interface RelativePosition3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * Converts a nearby absolute sector position into observer-relative
 * coordinates suitable for rendering.
 *
 * This function deliberately refuses sector deltas that cannot be safely
 * converted into JavaScript numbers. Future hierarchical rebasing will
 * resolve very distant positions before they reach the renderer.
 */
export function relativePosition3(
  target: SectorPosition3,
  observer: SectorPosition3,
  sectorSize: number
): RelativePosition3 {
  if (!Number.isFinite(sectorSize) || sectorSize <= 0) {
    throw new RangeError(
      "Sector size must be a positive finite number."
    );
  }

  const dx = target.sectorX - observer.sectorX;
  const dy = target.sectorY - observer.sectorY;
  const dz = target.sectorZ - observer.sectorZ;

  const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);

  if (
    dx > maxSafe || dx < -maxSafe ||
    dy > maxSafe || dy < -maxSafe ||
    dz > maxSafe || dz < -maxSafe
  ) {
    throw new RangeError(
      "Sector delta is too large for direct local rendering. Rebase first."
    );
  }

  return Object.freeze({
    x:
      Number(dx) * sectorSize +
      target.local.x -
      observer.local.x,

    y:
      Number(dy) * sectorSize +
      target.local.y -
      observer.local.y,

    z:
      Number(dz) * sectorSize +
      target.local.z -
      observer.local.z
  });
}

export function zeroLocalCoordinate(): LocalCoordinate3 {
  return Object.freeze({
    x: 0,
    y: 0,
    z: 0
  });
}
