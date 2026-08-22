/**
 * Integer coordinate identifying a potentially enormous universe sector.
 *
 * BigInt is used because JavaScript numbers lose exact integer precision
 * beyond Number.MAX_SAFE_INTEGER.
 */
export type SectorCoordinate = bigint;

/**
 * Creates a sector coordinate from an already exact BigInt.
 */
export function sector(value: bigint): SectorCoordinate {
  return value;
}

/**
 * Parses a base-10 sector coordinate without passing through a JavaScript
 * number, which would risk precision loss.
 */
export function parseSector(value: string): SectorCoordinate {
  if (!/^[+-]?\d+$/.test(value)) {
    throw new TypeError(
      `Invalid sector coordinate: "${value}"`
    );
  }

  return BigInt(value);
}
