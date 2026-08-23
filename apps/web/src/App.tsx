import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  RotationPlane4,
  multiplyMatrix4,
  rotationMatrix4
} from "@cosmos/math-core";

import {
  createTesseract,
  projectTesseractPerspective,
  transformTesseract
} from "@cosmos/geometry-4d";

import {
  createProjectedTesseractRenderMesh
} from "@cosmos/visualization";

import {
  ThreeWebGPUBackend
} from "@cosmos/renderer/three-webgpu";

import "./App.css";

const BASE_TESSERACT =
  createTesseract(2);

type ViewportStatus =
  | "INITIALIZING"
  | "LIVE"
  | "ERROR";

interface RotationAngles {
  readonly XY: number;
  readonly XZ: number;
  readonly XW: number;
  readonly YZ: number;
  readonly YW: number;
  readonly ZW: number;
}

type RotationKey =
  keyof RotationAngles;

const ZERO_ROTATION:
  RotationAngles = {
    XY: 0,
    XZ: 0,
    XW: 0,
    YZ: 0,
    YW: 0,
    ZW: 0
  };

const AUTO_ROTATION_SPEED:
  RotationAngles = {
    XY: 0.17,
    XZ: 0.11,
    XW: 0.31,
    YZ: 0.13,
    YW: 0.23,
    ZW: 0.19
  };

const ROTATION_CONTROLS:
  readonly {
    readonly key: RotationKey;
    readonly label: string;
    readonly fourthDimensional: boolean;
  }[] = [
    {
      key: "XY",
      label: "XY",
      fourthDimensional: false
    },
    {
      key: "XZ",
      label: "XZ",
      fourthDimensional: false
    },
    {
      key: "XW",
      label: "XW",
      fourthDimensional: true
    },
    {
      key: "YZ",
      label: "YZ",
      fourthDimensional: false
    },
    {
      key: "YW",
      label: "YW",
      fourthDimensional: true
    },
    {
      key: "ZW",
      label: "ZW",
      fourthDimensional: true
    }
  ];

function degrees(
  radians: number
): number {
  return (
    radians *
    180 /
    Math.PI
  );
}

function combineRotations(
  manual:
    RotationAngles,
  automatic:
    RotationAngles
) {
  const xy =
    rotationMatrix4(
      RotationPlane4.XY,
      manual.XY +
        automatic.XY
    );

  const xz =
    rotationMatrix4(
      RotationPlane4.XZ,
      manual.XZ +
        automatic.XZ
    );

  const xw =
    rotationMatrix4(
      RotationPlane4.XW,
      manual.XW +
        automatic.XW
    );

  const yz =
    rotationMatrix4(
      RotationPlane4.YZ,
      manual.YZ +
        automatic.YZ
    );

  const yw =
    rotationMatrix4(
      RotationPlane4.YW,
      manual.YW +
        automatic.YW
    );

  const zw =
    rotationMatrix4(
      RotationPlane4.ZW,
      manual.ZW +
        automatic.ZW
    );

  return multiplyMatrix4(
    zw,
    multiplyMatrix4(
      yw,
      multiplyMatrix4(
        yz,
        multiplyMatrix4(
          xw,
          multiplyMatrix4(
            xz,
            xy
          )
        )
      )
    )
  );
}

function App() {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const [
    status,
    setStatus
  ] =
    useState<ViewportStatus>(
      "INITIALIZING"
    );

  const [
    manualAngles,
    setManualAngles
  ] =
    useState<RotationAngles>({
      ...ZERO_ROTATION
    });

  const manualAnglesRef =
    useRef<RotationAngles>({
      ...ZERO_ROTATION
    });

  const automaticAnglesRef =
    useRef<RotationAngles>({
      ...ZERO_ROTATION
    });

  const [
    autoRotation,
    setAutoRotation
  ] =
    useState(true);

  const autoRotationRef =
    useRef(true);

  const [
    projectionDistance,
    setProjectionDistance
  ] =
    useState(4.5);

  const projectionDistanceRef =
    useRef(4.5);

  function updateManualAngle(
    plane: RotationKey,
    value: number
  ): void {
    if (!Number.isFinite(value)) {
      return;
    }

    const next = {
      ...manualAnglesRef.current,
      [plane]: value
    };

    manualAnglesRef.current =
      next;

    setManualAngles(next);
  }

  function toggleAutoRotation():
    void {
    const next =
      !autoRotationRef.current;

    autoRotationRef.current =
      next;

    setAutoRotation(next);
  }

  function updateProjectionDistance(
    value: number
  ): void {
    if (
      !Number.isFinite(value) ||
      value <= 2
    ) {
      return;
    }

    projectionDistanceRef.current =
      value;

    setProjectionDistance(
      value
    );
  }

  function resetOrientation():
    void {
    const zeroManual = {
      ...ZERO_ROTATION
    };

    const zeroAutomatic = {
      ...ZERO_ROTATION
    };

    manualAnglesRef.current =
      zeroManual;

    automaticAnglesRef.current =
      zeroAutomatic;

    setManualAngles(
      zeroManual
    );
  }

  useEffect(() => {
    const currentCanvas =
      canvasRef.current;

    if (currentCanvas === null) {
      return;
    }

    const canvasElement:
      HTMLCanvasElement =
        currentCanvas;

    const backend =
      new ThreeWebGPUBackend();

    let cancelled =
      false;

    let animationFrame =
      0;

    let resizeObserver:
      ResizeObserver | null =
        null;

    async function start():
      Promise<void> {
      try {
        await backend.initialize(
          canvasElement
        );

        if (cancelled) {
          backend.dispose();
          return;
        }

        const resize = (): void => {
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
              Math.min(
                window.devicePixelRatio ||
                  1,
                2
              )
          });
        };

        resize();

        resizeObserver =
          new ResizeObserver(
            resize
          );

        resizeObserver.observe(
          canvasElement
        );

        let previousFrameTime =
          performance.now();

        const renderFrame = (
          now: number
        ): void => {
          if (cancelled) {
            return;
          }

          const deltaSeconds =
            Math.min(
              (
                now -
                previousFrameTime
              ) /
                1000,
              0.1
            );

          previousFrameTime =
            now;

          if (
            autoRotationRef.current
          ) {
            const current =
              automaticAnglesRef.current;

            automaticAnglesRef.current = {
              XY:
                current.XY +
                AUTO_ROTATION_SPEED.XY *
                  deltaSeconds,

              XZ:
                current.XZ +
                AUTO_ROTATION_SPEED.XZ *
                  deltaSeconds,

              XW:
                current.XW +
                AUTO_ROTATION_SPEED.XW *
                  deltaSeconds,

              YZ:
                current.YZ +
                AUTO_ROTATION_SPEED.YZ *
                  deltaSeconds,

              YW:
                current.YW +
                AUTO_ROTATION_SPEED.YW *
                  deltaSeconds,

              ZW:
                current.ZW +
                AUTO_ROTATION_SPEED.ZW *
                  deltaSeconds
            };
          }

          /**
           * The complete orientation is calculated in R^4.
           *
           * Manual slider angles and accumulated automatic angles
           * are combined before projection.
           */
          const rotation =
            combineRotations(
              manualAnglesRef.current,
              automaticAnglesRef.current
            );

          const rotated =
            transformTesseract(
              BASE_TESSERACT,
              rotation
            );

          const projected =
            projectTesseractPerspective(
              rotated,
              projectionDistanceRef.current
            );

          const renderMesh =
            createProjectedTesseractRenderMesh(
              projected
            );

          backend.renderLineMesh(
            renderMesh
          );

          animationFrame =
            requestAnimationFrame(
              renderFrame
            );
        };

        setStatus("LIVE");

        animationFrame =
          requestAnimationFrame(
            renderFrame
          );
      } catch (error) {
        console.error(
          "COSMOS viewport initialization failed:",
          error
        );

        if (!cancelled) {
          setStatus("ERROR");
        }
      }
    }

    void start();

    return () => {
      cancelled = true;

      if (
        animationFrame !== 0
      ) {
        cancelAnimationFrame(
          animationFrame
        );
      }

      resizeObserver
        ?.disconnect();

      backend.dispose();
    };
  }, []);

  return (
    <main className="cosmos-shell">
      <canvas
        ref={canvasRef}
        className="cosmos-viewport"
        aria-label="Interactive four-dimensional tesseract projection"
      />

      <section className="cosmos-hud">
        <div className="cosmos-brand">
          COSMOS
          <span>∞</span>
        </div>

        <div className="cosmos-subtitle">
          TRUE 4D GEOMETRY ENGINE
        </div>

        <div
          className="cosmos-status"
          data-status={status}
        >
          <span
            className="cosmos-status-dot"
            aria-hidden="true"
          />

          {status}
        </div>
      </section>

      <aside className="cosmos-readout">
        <div>
          <span>OBJECT</span>
          <strong>TESSERACT</strong>
        </div>

        <div>
          <span>SPACE</span>
          <strong>R⁴</strong>
        </div>

        <div>
          <span>VERTICES</span>
          <strong>16</strong>
        </div>

        <div>
          <span>EDGES</span>
          <strong>32</strong>
        </div>

        <div>
          <span>PROJECTION</span>
          <strong>4D → 3D</strong>
        </div>

        <div>
          <span>
            AUTO ROTATION
          </span>

          <strong>
            {autoRotation
              ? "ACTIVE"
              : "PAUSED"}
          </strong>
        </div>
      </aside>

      <section
        className="cosmos-controls"
        aria-label="Four-dimensional rotation controls"
      >
        <header className="cosmos-controls-header">
          <div>
            <span className="cosmos-panel-kicker">
              MANUAL CONTROL
            </span>

            <h2>
              4D ROTATION
            </h2>
          </div>

          <button
            className={
              autoRotation
                ? "cosmos-toggle is-active"
                : "cosmos-toggle"
            }
            type="button"
            onClick={
              toggleAutoRotation
            }
            aria-pressed={
              autoRotation
            }
          >
            AUTO
          </button>
        </header>

        <div className="cosmos-rotation-grid">
          {ROTATION_CONTROLS.map(
            ({
              key,
              label,
              fourthDimensional
            }) => (
              <label
                className={
                  fourthDimensional
                    ? "cosmos-slider is-fourth-dimensional"
                    : "cosmos-slider"
                }
                key={key}
              >
                <div className="cosmos-slider-heading">
                  <span>
                    {label}
                  </span>

                  <output>
                    {degrees(
                      manualAngles[
                        key
                      ]
                    ).toFixed(0)}
                    °
                  </output>
                </div>

                <input
                  type="range"
                  min={
                    -Math.PI
                  }
                  max={
                    Math.PI
                  }
                  step="0.01"
                  value={
                    manualAngles[
                      key
                    ]
                  }
                  onChange={
                    (event) =>
                      updateManualAngle(
                        key,
                        Number(
                          event
                            .currentTarget
                            .value
                        )
                      )
                  }
                  aria-label={
                    `${label} rotation angle`
                  }
                />
              </label>
            )
          )}
        </div>

        <div className="cosmos-control-divider" />

        <label className="cosmos-slider cosmos-projection-control">
          <div className="cosmos-slider-heading">
            <span>
              4D VIEW DISTANCE
            </span>

            <output>
              {projectionDistance
                .toFixed(2)}
            </output>
          </div>

          <input
            type="range"
            min="2.25"
            max="12"
            step="0.05"
            value={
              projectionDistance
            }
            onChange={
              (event) =>
                updateProjectionDistance(
                  Number(
                    event
                      .currentTarget
                      .value
                  )
                )
            }
            aria-label="Four-dimensional perspective projection distance"
          />
        </label>

        <button
          type="button"
          className="cosmos-reset"
          onClick={
            resetOrientation
          }
        >
          RESET 4D ORIENTATION
        </button>

        <p className="cosmos-control-note">
          XW, YW and ZW directly mix visible space with the fourth spatial axis.
        </p>
      </section>

      <div className="cosmos-caption">
        <span>
          TRUE FOUR-DIMENSIONAL TRANSFORMATION
        </span>

        <strong>
          Rotate through W and watch the 3D projection deform.
        </strong>
      </div>
    </main>
  );
}

export default App;
