import { Dimension } from "./dimensions";
import type { Dimension as DimensionType } from "./dimensions";

import { createQuantity } from "./Quantity";
import type { Quantity } from "./Quantity";

import type {
  Acceleration,
  Length,
  Time,
  Velocity
} from "./types";

/**
 * Runtime protection for data that may originate outside the trusted
 * TypeScript type system, such as:
 *
 * - serialized data
 * - generated universe data
 * - worker messages
 * - IndexedDB
 * - network responses
 * - future WASM boundaries
 */
function assertSameDimension(
  left: Quantity<DimensionType>,
  right: Quantity<DimensionType>
): void {
  if (left.dimension !== right.dimension) {
    throw new TypeError(
      `Dimension mismatch: ${left.dimension} cannot be combined with ${right.dimension}`
    );
  }
}

/**
 * Adds quantities of exactly the same physical dimension.
 */
export function add<D extends DimensionType>(
  left: Quantity<D>,
  right: Quantity<NoInfer<D>>
): Quantity<D> {
  assertSameDimension(left, right);

  return createQuantity(
    left.siValue + right.siValue,
    left.dimension
  );
}

/**
 * Subtracts quantities of exactly the same physical dimension.
 */
export function subtract<D extends DimensionType>(
  left: Quantity<D>,
  right: Quantity<NoInfer<D>>
): Quantity<D> {
  assertSameDimension(left, right);

  return createQuantity(
    left.siValue - right.siValue,
    left.dimension
  );
}

/**
 * Multiplication by a dimensionless scalar preserves dimension.
 */
export function scale<D extends DimensionType>(
  quantity: Quantity<D>,
  scalar: number
): Quantity<D> {
  if (!Number.isFinite(scalar)) {
    throw new RangeError(
      `Scale factor must be finite. Received: ${scalar}`
    );
  }

  return createQuantity(
    quantity.siValue * scalar,
    quantity.dimension
  );
}

/**
 * Length / Time = Velocity
 */
export function divideLengthByTime(
  length: Length,
  time: Time
): Velocity {
  if (time.siValue === 0) {
    throw new RangeError(
      "Cannot divide length by zero time."
    );
  }

  return createQuantity(
    length.siValue / time.siValue,
    Dimension.Velocity
  );
}

/**
 * Velocity / Time = Acceleration
 */
export function divideVelocityByTime(
  velocity: Velocity,
  time: Time
): Acceleration {
  if (time.siValue === 0) {
    throw new RangeError(
      "Cannot divide velocity by zero time."
    );
  }

  return createQuantity(
    velocity.siValue / time.siValue,
    Dimension.Acceleration
  );
}
