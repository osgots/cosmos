/**
 * Scientific metadata attached to a physical constant.
 *
 * `decimal` preserves the authoritative decimal representation.
 * `value` provides a convenient JavaScript number for ordinary
 * calculations.
 *
 * Future high-precision numerical systems should prefer `decimal`
 * when constructing precision-aware values.
 *
 * `exactByDefinition` describes the scientific definition of the
 * constant, not whether IEEE-754 binary floating point can represent
 * its decimal value without rounding.
 */
export interface PhysicalConstantDefinition {
  readonly name: string;
  readonly symbol: string;

  readonly decimal: string;
  readonly value: number;

  readonly unit: string;

  readonly exactByDefinition: boolean;

  readonly authority: string;

  readonly standardUncertainty?: string;
}
