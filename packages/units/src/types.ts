import { Dimension } from "./dimensions";
import type { Quantity } from "./Quantity";

export type Dimensionless =
  Quantity<typeof Dimension.Dimensionless>;

export type Length =
  Quantity<typeof Dimension.Length>;

export type Time =
  Quantity<typeof Dimension.Time>;

export type Mass =
  Quantity<typeof Dimension.Mass>;

export type Velocity =
  Quantity<typeof Dimension.Velocity>;

export type Acceleration =
  Quantity<typeof Dimension.Acceleration>;

export type Energy =
  Quantity<typeof Dimension.Energy>;
