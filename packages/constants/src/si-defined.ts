import type { PhysicalConstantDefinition } from "./types";

/**
 * Exact defining constants of the International System of Units (SI)
 * that are directly relevant to COSMOS Infinity.
 *
 * These values are exact by definition.
 */

export const SPEED_OF_LIGHT_IN_VACUUM = {
  name: "speed of light in vacuum",
  symbol: "c",
  decimal: "299792458",
  value: 299_792_458,
  unit: "m s^-1",
  exactByDefinition: true,
  authority: "SI"
} as const satisfies PhysicalConstantDefinition;

export const PLANCK_CONSTANT = {
  name: "Planck constant",
  symbol: "h",
  decimal: "6.62607015e-34",
  value: 6.626_070_15e-34,
  unit: "J s",
  exactByDefinition: true,
  authority: "SI"
} as const satisfies PhysicalConstantDefinition;

export const ELEMENTARY_CHARGE = {
  name: "elementary charge",
  symbol: "e",
  decimal: "1.602176634e-19",
  value: 1.602_176_634e-19,
  unit: "C",
  exactByDefinition: true,
  authority: "SI"
} as const satisfies PhysicalConstantDefinition;

export const BOLTZMANN_CONSTANT = {
  name: "Boltzmann constant",
  symbol: "k_B",
  decimal: "1.380649e-23",
  value: 1.380_649e-23,
  unit: "J K^-1",
  exactByDefinition: true,
  authority: "SI"
} as const satisfies PhysicalConstantDefinition;

export const AVOGADRO_CONSTANT = {
  name: "Avogadro constant",
  symbol: "N_A",
  decimal: "6.02214076e23",
  value: 6.022_140_76e23,
  unit: "mol^-1",
  exactByDefinition: true,
  authority: "SI"
} as const satisfies PhysicalConstantDefinition;
