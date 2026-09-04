import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  EARTH,
  MOON,
  SPEED_OF_LIGHT_M_PER_S,
  SUN,
  circularOrbitPosition,
  lightTravelTimeS
} from "@cosmos/astronomy";

import type {
  UniverseCameraState,
  UniverseRenderScene
} from "@cosmos/renderer";

import {
  ThreeUniverseBackend
} from "@cosmos/renderer/three-universe";

import "./UniverseExplorer.css";

type FocusId =
  | "sun"
  | "earth"
  | "moon";

type ScaleMode =
  | "EXPLORE"
  | "TRUE";

interface Position3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

const ZERO:
  Position3 = {
    x: 0,
    y: 0,
    z: 0
  };

const TIME_SPEEDS =
  Object.freeze({
    PAUSE: 0,
    DAY_1:
      86_400,
    DAY_10:
      864_000,
    DAY_30:
      2_592_000
  });

function subtract(
  first: Position3,
  second: Position3
): Position3 {
  return {
    x:
      first.x -
      second.x,

    y:
      first.y -
      second.y,

    z:
      first.z -
      second.z
  };
}

function exploreDistance(
  meters: number
): number {
  return (
    1.7 *
    Math.log10(
      1 +
      meters /
      1_000_000
    )
  );
}

function radiusForBody(
  id: FocusId,
  physicalRadiusM: number,
  mode: ScaleMode,
  linearScale: number
): number {
  if (
    mode ===
    "TRUE"
  ) {
    return (
      physicalRadiusM *
      linearScale
    );
  }

  switch (id) {
    case "sun":
      return 1.05;

    case "earth":
      return 0.42;

    case "moon":
      return 0.25;
  }
}

function buildUniverseScene(
  elapsedS: number,
  focus: FocusId,
  mode: ScaleMode
): {
  readonly scene:
    UniverseRenderScene;

  readonly camera:
    UniverseCameraState;
} {
  const earthPhysical =
    circularOrbitPosition(
      EARTH
        .meanOrbitDistanceM!,
      EARTH
        .orbitalPeriodS!,
      elapsedS
    );

  const moonPhysicalLocal =
    circularOrbitPosition(
      MOON
        .meanOrbitDistanceM!,
      MOON
        .orbitalPeriodS!,
      elapsedS,
      0.65
    );

  const linearScale =
    mode ===
    "TRUE"
      ? (
          focus === "sun"
            ? 10 /
              EARTH
                .meanOrbitDistanceM!
            : 5 /
              MOON
                .meanOrbitDistanceM!
        )
      : 1;

  const earthOrbitRadius =
    mode ===
    "TRUE"
      ? EARTH
          .meanOrbitDistanceM! *
        linearScale
      : exploreDistance(
          EARTH
            .meanOrbitDistanceM!
        );

  const moonOrbitRadius =
    mode ===
    "TRUE"
      ? MOON
          .meanOrbitDistanceM! *
        linearScale
      : exploreDistance(
          MOON
            .meanOrbitDistanceM!
        );

  const sunPosition:
    Position3 =
      ZERO;

  const earthPosition:
    Position3 = {
      x:
        Math.cos(
          Math.atan2(
            earthPhysical.zM,
            earthPhysical.xM
          )
        ) *
        earthOrbitRadius,

      y: 0,

      z:
        Math.sin(
          Math.atan2(
            earthPhysical.zM,
            earthPhysical.xM
          )
        ) *
        earthOrbitRadius
    };

  const moonPosition:
    Position3 = {
      x:
        earthPosition.x +
        Math.cos(
          Math.atan2(
            moonPhysicalLocal.zM,
            moonPhysicalLocal.xM
          )
        ) *
        moonOrbitRadius,

      y: 0,

      z:
        earthPosition.z +
        Math.sin(
          Math.atan2(
            moonPhysicalLocal.zM,
            moonPhysicalLocal.xM
          )
        ) *
        moonOrbitRadius
    };

  const focusPosition =
    focus === "sun"
      ? sunPosition
      : focus === "earth"
        ? earthPosition
        : moonPosition;

  const sunRender =
    subtract(
      sunPosition,
      focusPosition
    );

  const earthRender =
    subtract(
      earthPosition,
      focusPosition
    );

  const moonRender =
    subtract(
      moonPosition,
      focusPosition
    );

  const cameraDistance =
    focus === "sun"
      ? 20
      : focus === "earth"
        ? 12
        : 10;

  return {
    scene: {
      bodies: [
        {
          id: "sun",
          label: "Sun",
          kind: "star",

          position:
            sunRender,

          radius:
            radiusForBody(
              "sun",
              SUN.radiusM,
              mode,
              linearScale
            ),

          color: {
            r: 1,
            g: 0.72,
            b: 0.12
          }
        },
        {
          id: "earth",
          label: "Earth",
          kind: "planet",

          position:
            earthRender,

          radius:
            radiusForBody(
              "earth",
              EARTH.radiusM,
              mode,
              linearScale
            ),

          color: {
            r: 0.12,
            g: 0.56,
            b: 1
          }
        },
        {
          id: "moon",
          label: "Moon",
          kind: "moon",

          position:
            moonRender,

          radius:
            radiusForBody(
              "moon",
              MOON.radiusM,
              mode,
              linearScale
            ),

          color: {
            r: 0.75,
            g: 0.78,
            b: 0.82
          }
        }
      ],

      orbits: [
        {
          id:
            "earth-orbit",

          center:
            sunRender,

          radius:
            earthOrbitRadius,

          color: {
            r: 0.3,
            g: 0.45,
            b: 0.65
          },

          opacity:
            0.22
        },
        {
          id:
            "moon-orbit",

          center:
            earthRender,

          radius:
            moonOrbitRadius,

          color: {
            r: 0.55,
            g: 0.65,
            b: 0.78
          },

          opacity:
            0.28
        }
      ]
    },

    camera: {
      position: {
        x: 0,
        y:
          focus === "sun"
            ? 6
            : 4,

        z:
          cameraDistance
      },

      target:
        ZERO
    }
  };
}

function formatKm(
  meters: number
): string {
  return (
    meters /
    1_000
  ).toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 1
    }
  );
}

function UniverseExplorer() {
  const canvasRef =
    useRef<
      HTMLCanvasElement | null
    >(null);

  const [
    focus,
    setFocus
  ] =
    useState<FocusId>(
      "earth"
    );

  const [
    scaleMode,
    setScaleMode
  ] =
    useState<ScaleMode>(
      "EXPLORE"
    );

  const [
    speed,
    setSpeed
  ] =
    useState<number>(
      TIME_SPEEDS.DAY_1
    );

  const [
    live,
    setLive
  ] =
    useState(false);

  const focusRef =
    useRef<FocusId>(
      "earth"
    );

  const scaleModeRef =
    useRef<ScaleMode>(
      "EXPLORE"
    );

  const speedRef =
    useRef<number>(
      TIME_SPEEDS.DAY_1
    );

  const simulationTimeRef =
    useRef(0);

  useEffect(
    () => {
      focusRef.current =
        focus;
    },
    [
      focus
    ]
  );

  useEffect(
    () => {
      scaleModeRef.current =
        scaleMode;
    },
    [
      scaleMode
    ]
  );

  useEffect(
    () => {
      speedRef.current =
        speed;
    },
    [
      speed
    ]
  );

  useEffect(
    () => {
      const canvas =
        canvasRef.current;

      if (
        canvas === null
      ) {
        return;
      }

      const canvasElement:
        HTMLCanvasElement =
          canvas;

      const backend =
        new ThreeUniverseBackend();

      let cancelled =
        false;

      let frame =
        0;

      let observer:
        ResizeObserver | null =
          null;

      async function start():
        Promise<void> {
        await backend.initialize(
          canvasElement
        );

        if (
          cancelled
        ) {
          backend.dispose();
          return;
        }

        const resize =
          (): void => {
            const rect =
              canvasElement
                .getBoundingClientRect();

            backend.resize({
              width:
                Math.max(
                  1,
                  rect.width
                ),

              height:
                Math.max(
                  1,
                  rect.height
                ),

              pixelRatio:
                window
                  .devicePixelRatio ||
                1
            });
          };

        resize();

        observer =
          new ResizeObserver(
            resize
          );

        observer.observe(
          canvasElement
        );

        let previous =
          performance.now();

        const draw = (
          now: number
        ): void => {
          if (
            cancelled
          ) {
            return;
          }

          const delta =
            Math.min(
              (
                now -
                previous
              ) /
                1_000,
              0.1
            );

          previous =
            now;

          simulationTimeRef.current +=
            delta *
            speedRef.current;

          const snapshot =
            buildUniverseScene(
              simulationTimeRef.current,
              focusRef.current,
              scaleModeRef.current
            );

          backend.render(
            snapshot.scene,
            snapshot.camera
          );

          frame =
            requestAnimationFrame(
              draw
            );
        };

        setLive(true);

        frame =
          requestAnimationFrame(
            draw
          );
      }

      void start();

      return () => {
        cancelled = true;

        if (
          frame !== 0
        ) {
          cancelAnimationFrame(
            frame
          );
        }

        observer
          ?.disconnect();

        backend.dispose();
      };
    },
    []
  );

  const body =
    focus === "sun"
      ? SUN
      : focus === "earth"
        ? EARTH
        : MOON;

  const lightTime =
    body.meanOrbitDistanceM ===
    null
      ? null
      : lightTravelTimeS(
          body.meanOrbitDistanceM,
          SPEED_OF_LIGHT_M_PER_S
        );

  return (
    <main className="ue-shell">
      <canvas
        ref={canvasRef}
        className="ue-canvas"
        aria-label="Interactive Sun Earth Moon universe visualization"
      />

      <header className="ue-header">
        <div>
          <strong>
            COSMOS∞
          </strong>

          <span>
            UNIVERSE ENGINE 0.1
          </span>
        </div>

        <div
          className={
            live
              ? "ue-live is-live"
              : "ue-live"
          }
        >
          {live
            ? "● LIVE"
            : "INITIALIZING"}
        </div>
      </header>

      <aside className="ue-info">
        <span className="ue-kicker">
          FOCUSED BODY
        </span>

        <h1>
          {body.name}
        </h1>

        <dl>
          <div>
            <dt>
              RADIUS
            </dt>

            <dd>
              {formatKm(
                body.radiusM
              )}
              {" km"}
            </dd>
          </div>

          <div>
            <dt>
              PARENT
            </dt>

            <dd>
              {body.parentId ??
                "—"}
            </dd>
          </div>

          <div>
            <dt>
              MEAN DISTANCE
            </dt>

            <dd>
              {body
                .meanOrbitDistanceM ===
              null
                ? "—"
                : `${formatKm(
                    body.meanOrbitDistanceM
                  )} km`}
            </dd>
          </div>

          <div>
            <dt>
              ORBITAL PERIOD
            </dt>

            <dd>
              {body
                .orbitalPeriodS ===
              null
                ? "—"
                : `${(
                    body.orbitalPeriodS /
                    86_400
                  ).toFixed(
                    2
                  )} days`}
            </dd>
          </div>

          <div>
            <dt>
              LIGHT TIME
            </dt>

            <dd>
              {lightTime ===
              null
                ? "—"
                : lightTime <
                    60
                  ? `${lightTime.toFixed(
                      2
                    )} s`
                  : `${(
                      lightTime /
                      60
                    ).toFixed(
                      2
                    )} min`}
            </dd>
          </div>
        </dl>

        <div className="ue-status">
          REFERENCE PARAMETER
        </div>
      </aside>

      <section className="ue-controls">
        <div className="ue-control-group">
          <span>
            FOCUS
          </span>

          <div>
            {(
              [
                "sun",
                "earth",
                "moon"
              ] as const
            ).map(
              (
                id
              ) => (
                <button
                  key={id}
                  type="button"
                  className={
                    focus === id
                      ? "is-active"
                      : ""
                  }
                  onClick={
                    () =>
                      setFocus(
                        id
                      )
                  }
                >
                  {id.toUpperCase()}
                </button>
              )
            )}
          </div>
        </div>

        <div className="ue-control-group">
          <span>
            SCALE
          </span>

          <div>
            <button
              type="button"
              className={
                scaleMode ===
                "EXPLORE"
                  ? "is-active"
                  : ""
              }
              onClick={
                () =>
                  setScaleMode(
                    "EXPLORE"
                  )
              }
            >
              EXPLORE
            </button>

            <button
              type="button"
              className={
                scaleMode ===
                "TRUE"
                  ? "is-active"
                  : ""
              }
              onClick={
                () =>
                  setScaleMode(
                    "TRUE"
                  )
              }
            >
              TRUE SCALE
            </button>
          </div>
        </div>

        <div className="ue-control-group">
          <span>
            TIME
          </span>

          <div>
            <button
              type="button"
              className={
                speed === 0
                  ? "is-active"
                  : ""
              }
              onClick={
                () =>
                  setSpeed(0)
              }
            >
              PAUSE
            </button>

            <button
              type="button"
              className={
                speed ===
                TIME_SPEEDS.DAY_1
                  ? "is-active"
                  : ""
              }
              onClick={
                () =>
                  setSpeed(
                    TIME_SPEEDS.DAY_1
                  )
              }
            >
              1 D/S
            </button>

            <button
              type="button"
              className={
                speed ===
                TIME_SPEEDS.DAY_10
                  ? "is-active"
                  : ""
              }
              onClick={
                () =>
                  setSpeed(
                    TIME_SPEEDS.DAY_10
                  )
              }
            >
              10 D/S
            </button>

            <button
              type="button"
              className={
                speed ===
                TIME_SPEEDS.DAY_30
                  ? "is-active"
                  : ""
              }
              onClick={
                () =>
                  setSpeed(
                    TIME_SPEEDS.DAY_30
                  )
              }
            >
              30 D/S
            </button>
          </div>
        </div>

        <p>
          {scaleMode ===
          "EXPLORE"
            ? "VISUAL SCALE ENHANCEMENT — distances and body sizes are transformed for visibility."
            : "TRUE SCALE — one linear physical scale. Small bodies may become difficult to see."}
        </p>

        <small>
          CIRCULAR ORBIT APPROXIMATION · ARTISTIC BODY COLOR
        </small>
      </section>
    </main>
  );
}

export default UniverseExplorer;
