import {
  localCoordinate3
} from "./LocalCoordinate";

import {
  sectorPosition3
} from "./SectorPosition";

import type {
  SectorPosition3
} from "./SectorPosition";

interface NormalizedAxis {
  readonly sector: bigint;
  readonly local: number;
}

/**
 * Moves local-coordinate overflow into the exact BigInt sector coordinate.
 *
 * Canonical local range:
 *
 *   0 <= local < sectorSize
 *
 * Examples with sectorSize = 1000:
 *
 *   sector 10, local 1250
 *        ->
 *   sector 11, local 250
 *
 *   sector 10, local -25
 *        ->
 *   sector 9, local 975
 *
 * The carry must remain a safe JavaScript integer before conversion to
 * BigInt. Extremely large local offsets indicate that rebasing was allowed
 * to drift too far and are rejected rather than silently losing precision.
 */
function normalizeAxis(
  sector: bigint,
  local: number,
  sectorSize: number
): NormalizedAxis {
  if (!Number.isFinite(local)) {
    throw new RangeError(
      "Local coordinate must be finite."
    );
  }

  const carry = Math.floor(local / sectorSize);

  if (!Number.isSafeInteger(carry)) {
    throw new RangeError(
      "Local coordinate overflow is too large to normalize safely. Rebase earlier."
    );
  }

  let normalizedSector =
    sector + BigInt(carry);

  let normalizedLocal =
    local - carry * sectorSize;

  /**
   * Floating-point rounding can very rarely place the result exactly
   * outside the canonical interval. Correct that here.
   */
  if (normalizedLocal >= sectorSize) {
    normalizedSector += 1n;
    normalizedLocal -= sectorSize;
  }

  if (normalizedLocal < 0) {
    normalizedSector -= 1n;
    normalizedLocal += sectorSize;
  }

  /**
   * Remove negative zero because -0 and +0 should not create
   * distinguishable coordinate representations.
   */
  if (Object.is(normalizedLocal, -0)) {
    normalizedLocal = 0;
  }

  if (
    !Number.isFinite(normalizedLocal) ||
    normalizedLocal < 0 ||
    normalizedLocal >= sectorSize
  ) {
    throw new RangeError(
      "Sector normalization failed to produce a canonical local coordinate."
    );
  }

  return {
    sector: normalizedSector,
    local: normalizedLocal
  };
}

/**
 * Canonicalizes a 3D sector position by moving all local-coordinate
 * overflow into the corresponding BigInt sector coordinates.
 *
 * This operation preserves physical position.
 */
export function normalizeSectorPosition3(
  position: SectorPosition3,
  sectorSize: number
): SectorPosition3 {
  if (
    !Number.isFinite(sectorSize) ||
    sectorSize <= 0
  ) {
    throw new RangeError(
      "Sector size must be a positive finite number."
    );
  }

  const x = normalizeAxis(
    position.sectorX,
    position.local.x,
    sectorSize
  );

  const y = normalizeAxis(
    position.sectorY,
    position.local.y,
    sectorSize
  );

  const z = normalizeAxis(
    position.sectorZ,
    position.local.z,
    sectorSize
  );

  return sectorPosition3(
    x.sector,
    y.sector,
    z.sector,
    localCoordinate3(
      x.local,
      y.local,
      z.local
    )
  );
}
