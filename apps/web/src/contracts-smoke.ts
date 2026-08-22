import {
  ScaleRegime,
  ScientificStatus,
  type LocalPosition3,
  type SimulationTime,
  type UniverseEntityId
} from "@cosmos/contracts";

/**
 * Compile-time smoke test proving that the web application can consume
 * renderer-neutral COSMOS Infinity contracts through the pnpm workspace.
 *
 * This file intentionally has no visual side effects.
 */

const entityId: UniverseEntityId = "cosmos:foundation:test";

const position: LocalPosition3 = {
  x: 0,
  y: 0,
  z: 0
};

const time: SimulationTime = {
  seconds: 0
};

export const contractsSmokeTest = {
  entityId,
  position,
  time,
  scale: ScaleRegime.Human,
  scientificStatus: ScientificStatus.Observed
} as const;
