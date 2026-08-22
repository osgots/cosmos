import {
  add,
  divideLengthByTime,
  meters,
  seconds
} from "../src/index";

const oneMeter = meters(1);
const twoMeters = meters(2);
const oneSecond = seconds(1);

const validLength = add(oneMeter, twoMeters);

const validVelocity = divideLengthByTime(
  twoMeters,
  oneSecond
);

void validLength;
void validVelocity;

/**
 * This line MUST remain a TypeScript error.
 *
 * If TypeScript ever stops reporting an error here, the @ts-expect-error
 * directive itself will fail the units package typecheck.
 */
// @ts-expect-error Length and Time must never be addable.
add(oneMeter, oneSecond);
