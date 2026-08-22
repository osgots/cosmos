import type { LocalCoordinate3 } from "./LocalCoordinate";
import type { SectorCoordinate } from "./SectorCoordinate";

/**
 * Position represented using exact integer sectors plus a local
 * floating-point offset.
 *
 * This is the first foundation of the future COSMOS Infinity
 * hierarchical/floating-origin coordinate system.
 */
export interface SectorPosition3 {
  readonly sectorX: SectorCoordinate;
  readonly sectorY: SectorCoordinate;
  readonly sectorZ: SectorCoordinate;

  readonly local: LocalCoordinate3;
}

export function sectorPosition3(
  sectorX: SectorCoordinate,
  sectorY: SectorCoordinate,
  sectorZ: SectorCoordinate,
  local: LocalCoordinate3
): SectorPosition3 {
  return Object.freeze({
    sectorX,
    sectorY,
    sectorZ,
    local
  });
}
