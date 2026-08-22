/**
 * Time state used by simulations.
 *
 * Values are expressed in SI seconds.
 * Stronger dimensional typing will be introduced by @cosmos/units.
 */
export interface SimulationTime {
  readonly seconds: number;
}
