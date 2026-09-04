import {
  circularOrbitPosition,
  lightTravelTimeS
} from "../src/index";

import {
  describe,
  expect,
  test
} from "vitest";

describe(
  "COSMOS circular orbit approximation",
  () => {
    test(
      "starts at positive X when phase is zero",
      () => {
        const position =
          circularOrbitPosition(
            100,
            20,
            0
          );

        expect(
          position.xM
        ).toBeCloseTo(
          100
        );

        expect(
          position.zM
        ).toBeCloseTo(
          0
        );
      }
    );

    test(
      "reaches quarter orbit after quarter period",
      () => {
        const position =
          circularOrbitPosition(
            100,
            20,
            5
          );

        expect(
          position.xM
        ).toBeCloseTo(
          0
        );

        expect(
          position.zM
        ).toBeCloseTo(
          100
        );
      }
    );

    test(
      "returns to its starting point after one period",
      () => {
        const position =
          circularOrbitPosition(
            100,
            20,
            20
          );

        expect(
          position.xM
        ).toBeCloseTo(
          100
        );

        expect(
          position.zM
        ).toBeCloseTo(
          0
        );
      }
    );

    test(
      "computes light travel time",
      () => {
        expect(
          lightTravelTimeS(
            299_792_458,
            299_792_458
          )
        ).toBe(1);
      }
    );
  }
);
