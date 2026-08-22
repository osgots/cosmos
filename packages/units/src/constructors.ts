import { Dimension } from "./dimensions";
import { createQuantity } from "./Quantity";

import type {
  Acceleration,
  Dimensionless,
  Energy,
  Length,
  Mass,
  Time,
  Velocity
} from "./types";

export function dimensionless(value: number): Dimensionless {
  return createQuantity(value, Dimension.Dimensionless);
}

export function meters(value: number): Length {
  return createQuantity(value, Dimension.Length);
}

export function seconds(value: number): Time {
  return createQuantity(value, Dimension.Time);
}

export function kilograms(value: number): Mass {
  return createQuantity(value, Dimension.Mass);
}

export function metersPerSecond(value: number): Velocity {
  return createQuantity(value, Dimension.Velocity);
}

export function metersPerSecondSquared(value: number): Acceleration {
  return createQuantity(value, Dimension.Acceleration);
}

export function joules(value: number): Energy {
  return createQuantity(value, Dimension.Energy);
}
