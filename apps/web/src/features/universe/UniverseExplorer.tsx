import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  ASTRONOMICAL_UNIT_M,
  CELESTIAL_BODY_CATALOG,
  EARTH,
  MOON,
  NEPTUNE,
  PLANETS,
  SPEED_OF_LIGHT_M_PER_S,
  SUN,
  circularOrbitPosition,
  lightTravelTimeS
} from "@cosmos/astronomy";

import type {
  CelestialBody,
  CelestialBodyId
} from "@cosmos/astronomy";

import type {
  RenderColor3,
  UniverseCameraState,
  UniverseRenderScene,
  UniverseVisualKind
} from "@cosmos/renderer";

import {
  ThreeUniverseBackend
} from "@cosmos/renderer/three-universe";

import "./UniverseExplorer.css";

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
    DAY_1: 86_400,
    DAY_30: 2_592_000,
    YEAR_1:
      365.25 * 86_400
  });

const FOCUS_ORDER:
  readonly CelestialBodyId[] =
    Object.freeze([
      "sun",
      "mercury",
      "venus",
      "earth",
      "moon",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune"
    ]);

const BODY_BY_ID =
  Object.freeze(
    Object.fromEntries(
      CELESTIAL_BODY_CATALOG.map(
        body => [
          body.id,
          body
        ]
      )
    ) as Record<
      CelestialBodyId,
      CelestialBody
    >
  );

const BODY_COLORS:
  Readonly<
    Record<
      CelestialBodyId,
      RenderColor3
    >
  > =
    Object.freeze({
      sun: {
        r: 1,
        g: 0.72,
        b: 0.12
      },
      mercury: {
        r: 0.58,
        g: 0.56,
        b: 0.53
      },
      venus: {
        r: 0.93,
        g: 0.68,
        b: 0.34
      },
      earth: {
        r: 0.12,
        g: 0.56,
        b: 1
      },
      moon: {
        r: 0.75,
        g: 0.78,
        b: 0.82
      },
      mars: {
        r: 0.86,
        g: 0.29,
        b: 0.16
      },
      jupiter: {
        r: 0.82,
        g: 0.64,
        b: 0.46
      },
      saturn: {
        r: 0.91,
        g: 0.78,
        b: 0.52
      },
      uranus: {
        r: 0.42,
        g: 0.84,
        b: 0.88
      },
      neptune: {
        r: 0.18,
        g: 0.37,
        b: 0.92
      }
    });

const EXPLORE_RADII:
  Readonly<
    Record<
      CelestialBodyId,
      number
    >
  > =
    Object.freeze({
      sun: 0.95,
      mercury: 0.16,
      venus: 0.27,
      earth: 0.28,
      moon: 0.11,
      mars: 0.21,
      jupiter: 0.52,
      saturn: 0.48,
      uranus: 0.34,
      neptune: 0.33
    });

/**
 * Visual phase offsets prevent the simplified circularized planets from
 * starting on one straight line. They are deliberately NOT a claim about
 * the current ephemeris and are labelled as such in the UI.
 */
const PHASE_OFFSETS_RAD:
  Readonly<
    Record<
      CelestialBodyId,
      number
    >
  > =
    Object.freeze({
      sun: 0,
      mercury: 0.18,
      venus: 1.14,
      earth: 2.08,
      moon: 0.65,
      mars: 3.02,
      jupiter: 4.16,
      saturn: 5.08,
      uranus: 0.78,
      neptune: 2.72
    });

function subtract(
  first: Position3,
  second: Position3
): Position3 {
  return {
    x: first.x - second.x,
    y: first.y - second.y,
    z: first.z - second.z
  };
}

function explorePlanetOrbit(
  meters: number
): number {
  const distanceAu =
    meters /
    ASTRONOMICAL_UNIT_M;

  return 2.4 +
    2.5 *
    Math.sqrt(distanceAu);
}

function exploreMoonOrbit(
  focus: CelestialBodyId
): number {
  return focus === "earth" ||
    focus === "moon"
    ? 1.2
    : 0.34;
}

function linearScaleForFocus(
  focus: CelestialBodyId
): number {
  if (
    focus === "sun"
  ) {
    return 16 /
      NEPTUNE.meanOrbitDistanceM!;
  }

  if (
    focus === "earth" ||
    focus === "moon"
  ) {
    return 5 /
      MOON.meanOrbitDistanceM!;
  }

  return 0.4 /
    BODY_BY_ID[focus]
      .radiusM;
}

function renderRadius(
  body: CelestialBody,
  mode: ScaleMode,
  linearScale: number
): number {
  return mode === "TRUE"
    ? body.radiusM *
      linearScale
    : EXPLORE_RADII[
        body.id
      ];
}

function visualKind(
  body: CelestialBody
): UniverseVisualKind {
  if (
    body.kind ===
    "natural-satellite"
  ) {
    return "moon";
  }

  return body.kind;
}

function cameraForFocus(
  focus: CelestialBodyId,
  mode: ScaleMode
): UniverseCameraState {
  if (
    focus === "sun"
  ) {
    return {
      position: {
        x: 0,
        y: 15,
        z: 32
      },
      target: ZERO
    };
  }

  if (
    mode === "TRUE" &&
    (
      focus === "earth" ||
      focus === "moon"
    )
  ) {
    return {
      position: {
        x: 0,
        y: 5,
        z: 13
      },
      target: ZERO
    };
  }

  return {
    position: {
      x: 0,
      y: 2.4,
      z: 7.2
    },
    target: ZERO
  };
}

function buildUniverseScene(
  elapsedS: number,
  focus: CelestialBodyId,
  mode: ScaleMode
): {
  readonly scene:
    UniverseRenderScene;
  readonly camera:
    UniverseCameraState;
} {
  const linearScale =
    mode === "TRUE"
      ? linearScaleForFocus(
          focus
        )
      : 1;

  const positions =
    new Map<
      CelestialBodyId,
      Position3
    >();

  const orbitRadii =
    new Map<
      CelestialBodyId,
      number
    >();

  positions.set(
    "sun",
    ZERO
  );

  for (
    const planet of PLANETS
  ) {
    const orbitRadius =
      mode === "TRUE"
        ? planet
            .meanOrbitDistanceM! *
          linearScale
        : explorePlanetOrbit(
            planet
              .meanOrbitDistanceM!
          );

    orbitRadii.set(
      planet.id,
      orbitRadius
    );

    const position =
      circularOrbitPosition(
        orbitRadius,
        planet.orbitalPeriodS!,
        elapsedS,
        PHASE_OFFSETS_RAD[
          planet.id
        ]
      );

    positions.set(
      planet.id,
      {
        x: position.xM,
        y: 0,
        z: position.zM
      }
    );
  }

  const earthPosition =
    positions.get("earth")!;

  const moonOrbitRadius =
    mode === "TRUE"
      ? MOON.meanOrbitDistanceM! *
        linearScale
      : exploreMoonOrbit(
          focus
        );

  orbitRadii.set(
    "moon",
    moonOrbitRadius
  );

  const moonLocal =
    circularOrbitPosition(
      moonOrbitRadius,
      MOON.orbitalPeriodS!,
      elapsedS,
      PHASE_OFFSETS_RAD.moon
    );

  positions.set(
    "moon",
    {
      x:
        earthPosition.x +
        moonLocal.xM,
      y: 0,
      z:
        earthPosition.z +
        moonLocal.zM
    }
  );

  const focusPosition =
    positions.get(focus) ??
    ZERO;

  const renderPosition = (
    id: CelestialBodyId
  ): Position3 =>
    subtract(
      positions.get(id) ??
        ZERO,
      focusPosition
    );

  const sunRender =
    renderPosition("sun");

  const earthRender =
    renderPosition("earth");

  const bodies =
    CELESTIAL_BODY_CATALOG.map(
      body => ({
        id: body.id,
        label: body.name,
        kind:
          visualKind(body),
        position:
          renderPosition(
            body.id
          ),
        radius:
          renderRadius(
            body,
            mode,
            linearScale
          ),
        color:
          BODY_COLORS[
            body.id
          ]
      })
    );

  const planetOrbits =
    PLANETS.map(
      planet => ({
        id:
          `${planet.id}-orbit`,
        center: sunRender,
        radius:
          orbitRadii.get(
            planet.id
          )!,
        color:
          BODY_COLORS[
            planet.id
          ],
        opacity:
          focus === planet.id
            ? 0.42
            : focus === "sun"
              ? 0.18
              : 0.1
      })
    );

  const moonOrbit =
    focus === "earth" ||
    focus === "moon"
      ? [
          {
            id: "moon-orbit",
            center:
              earthRender,
            radius:
              orbitRadii.get(
                "moon"
              )!,
            color:
              BODY_COLORS.moon,
            opacity: 0.45
          }
        ]
      : [];

  return {
    scene: {
      bodies,
      orbits: [
        ...planetOrbits,
        ...moonOrbit
      ]
    },
    camera:
      cameraForFocus(
        focus,
        mode
      )
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

function formatMass(
  kilograms: number
): string {
  return kilograms
    .toExponential(3)
    .replace("e+", "e");
}

function formatOrbitScale(
  body: CelestialBody
): string {
  if (
    body.meanOrbitDistanceM ===
    null
  ) {
    return "—";
  }

  if (
    body.id === "moon"
  ) {
    return `${formatKm(
      body.meanOrbitDistanceM
    )} km`;
  }

  return `${(
    body.meanOrbitDistanceM /
    ASTRONOMICAL_UNIT_M
  ).toFixed(3)} AU`;
}

function formatPeriod(
  body: CelestialBody
): string {
  if (
    body.orbitalPeriodS ===
    null
  ) {
    return "—";
  }

  const days =
    body.orbitalPeriodS /
    86_400;

  if (
    days >= 730
  ) {
    return `${(
      days /
      365.25
    ).toFixed(2)} y`;
  }

  return `${days.toFixed(2)} d`;
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
    useState<CelestialBodyId>(
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
    useRef<CelestialBodyId>(
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
    [focus]
  );

  useEffect(
    () => {
      scaleModeRef.current =
        scaleMode;
    },
    [scaleMode]
  );

  useEffect(
    () => {
      speedRef.current =
        speed;
    },
    [speed]
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

      let frame = 0;

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

          previous = now;

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

        observer?.disconnect();
        backend.dispose();
      };
    },
    []
  );

  const body =
    BODY_BY_ID[focus];

  const parentName =
    body.parentId === null
      ? "—"
      : BODY_BY_ID[
          body.parentId
        ].name;

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
        aria-label="Interactive Solar System visualization with the Sun, eight planets, and Moon"
      />

      <header className="ue-header">
        <div>
          <strong>
            COSMOS∞
          </strong>

          <span>
            UNIVERSE ENGINE 0.2 · SOLAR SYSTEM
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
            ? "● 8 PLANETS · LIVE"
            : "INITIALIZING"}
        </div>
      </header>

      <aside className="ue-info">
        <span className="ue-kicker">
          {focus === "sun"
            ? "SOLAR SYSTEM / CENTRAL STAR"
            : "FOCUSED BODY"}
        </span>

        <h1>
          {body.name}
        </h1>

        <dl>
          <div>
            <dt>RADIUS</dt>
            <dd>
              {formatKm(
                body.radiusM
              )} km
            </dd>
          </div>

          <div>
            <dt>MASS</dt>
            <dd>
              {formatMass(
                body.massKg
              )} kg
            </dd>
          </div>

          <div>
            <dt>PARENT</dt>
            <dd>
              {parentName}
            </dd>
          </div>

          <div>
            <dt>REFERENCE ORBIT</dt>
            <dd>
              {formatOrbitScale(
                body
              )}
            </dd>
          </div>

          <div>
            <dt>SIDEREAL PERIOD</dt>
            <dd>
              {formatPeriod(
                body
              )}
            </dd>
          </div>

          <div>
            <dt>LIGHT TIME</dt>
            <dd>
              {lightTime === null
                ? "—"
                : lightTime < 60
                  ? `${lightTime.toFixed(
                      2
                    )} s`
                  : lightTime < 3_600
                    ? `${(
                        lightTime /
                        60
                      ).toFixed(2)} min`
                    : `${(
                        lightTime /
                        3_600
                      ).toFixed(2)} h`}
            </dd>
          </div>
        </dl>

        <div className="ue-status">
          REFERENCE PARAMETERS · NASA / JPL
        </div>
      </aside>

      <section className="ue-controls">
        <div className="ue-control-group">
          <span>
            FOCUS · SCROLL FOR ALL BODIES
          </span>

          <div className="ue-focus-row">
            {FOCUS_ORDER.map(
              id => (
                <button
                  key={id}
                  type="button"
                  className={
                    focus === id
                      ? "is-active"
                      : ""
                  }
                  aria-pressed={
                    focus === id
                  }
                  onClick={
                    () =>
                      setFocus(id)
                  }
                >
                  {BODY_BY_ID[
                    id
                  ].name.toUpperCase()}
                </button>
              )
            )}
          </div>
        </div>

        <div className="ue-control-group">
          <span>SCALE</span>

          <div className="ue-scale-row">
            <button
              type="button"
              className={
                scaleMode ===
                "EXPLORE"
                  ? "is-active"
                  : ""
              }
              aria-pressed={
                scaleMode ===
                "EXPLORE"
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
              aria-pressed={
                scaleMode ===
                "TRUE"
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
          <span>TIME</span>

          <div className="ue-time-row">
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

            <button
              type="button"
              className={
                speed ===
                TIME_SPEEDS.YEAR_1
                  ? "is-active"
                  : ""
              }
              onClick={
                () =>
                  setSpeed(
                    TIME_SPEEDS.YEAR_1
                  )
              }
            >
              1 Y/S
            </button>
          </div>
        </div>

        <p>
          {scaleMode === "EXPLORE"
            ? "VISUAL SCALE ENHANCEMENT — orbital ordering is preserved while radii and distances are transformed for visibility."
            : "TRUE LINEAR SCALE — radii and orbital distances share one physical scale. Small bodies may become sub-pixel."}
        </p>

        <small>
          CIRCULARIZED REFERENCE ORBITS · VISUAL PHASE OFFSETS · NOT A CURRENT EPHEMERIS · ARTISTIC BODY COLOR
        </small>
      </section>
    </main>
  );
}

export default UniverseExplorer;
