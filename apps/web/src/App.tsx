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
  projectTesseractOrthographic,
  projectTesseractPerspective,
  sliceTesseractAtW,
  transformTesseract
} from "@cosmos/geometry-4d";

import {
  createTesseractSliceRenderMesh,
  createWEncodedProjectedTesseractRenderMesh
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

type ViewMode =
  | "PERSPECTIVE"
  | "ORTHOGRAPHIC"
  | "SLICE";

interface RotationAngles {
  readonly XY: number;
  readonly XZ: number;
  readonly XW: number;
  readonly YZ: number;
  readonly YW: number;
  readonly ZW: number;
}

interface RenderStats {
  readonly vertices: number;
  readonly edges: number;
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

const VIEW_MODES:
  readonly {
    readonly mode: ViewMode;
    readonly label: string;
  }[] = [
    {
      mode: "PERSPECTIVE",
      label: "PERSPECTIVE"
    },
    {
      mode: "ORTHOGRAPHIC",
      label: "ORTHO"
    },
    {
      mode: "SLICE",
      label: "TRUE SLICE"
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
  manual: RotationAngles,
  automatic: RotationAngles
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

  const [
    viewMode,
    setViewMode
  ] =
    useState<ViewMode>(
      "PERSPECTIVE"
    );

  const viewModeRef =
    useRef<ViewMode>(
      "PERSPECTIVE"
    );

  const [
    sliceW,
    setSliceW
  ] =
    useState(0);

  const sliceWRef =
    useRef(0);

  const [
    renderStats,
    setRenderStats
  ] =
    useState<RenderStats>({
      vertices: 16,
      edges: 32
    });

  const renderStatsRef =
    useRef<RenderStats>({
      vertices: 16,
      edges: 32
    });

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

  function updateSliceW(
    value: number
  ): void {
    if (!Number.isFinite(value)) {
      return;
    }

    sliceWRef.current =
      value;

    setSliceW(value);
  }

  function selectViewMode(
    mode: ViewMode
  ): void {
    viewModeRef.current =
      mode;

    setViewMode(mode);
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

  function updateRenderStats(
    vertices: number,
    edges: number
  ): void {
    const previous =
      renderStatsRef.current;

    if (
      previous.vertices === vertices &&
      previous.edges === edges
    ) {
      return;
    }

    const next = {
      vertices,
      edges
    };

    renderStatsRef.current =
      next;

    setRenderStats(next);
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

          switch (
            viewModeRef.current
          ) {
            case "PERSPECTIVE": {
              const projected =
                projectTesseractPerspective(
                  rotated,
                  projectionDistanceRef.current
                );

              const renderMesh =
                createWEncodedProjectedTesseractRenderMesh(
                  rotated,
                  projected
                );

              updateRenderStats(
                renderMesh.vertices.length,
                renderMesh.edges.length
              );

              backend.renderLineMesh(
                renderMesh
              );

              break;
            }

            case "ORTHOGRAPHIC": {
              const projected =
                projectTesseractOrthographic(
                  rotated
                );

              const renderMesh =
                createWEncodedProjectedTesseractRenderMesh(
                  rotated,
                  projected
                );

              updateRenderStats(
                renderMesh.vertices.length,
                renderMesh.edges.length
              );

              backend.renderLineMesh(
                renderMesh
              );

              break;
            }

            case "SLICE": {
              const slice =
                sliceTesseractAtW(
                  rotated,
                  sliceWRef.current
                );

              const renderMesh =
                createTesseractSliceRenderMesh(
                  slice
                );

              updateRenderStats(
                renderMesh.vertices.length,
                renderMesh.edges.length
              );

              backend.renderLineMesh(
                renderMesh
              );

              break;
            }
          }

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
        aria-label="Interactive four-dimensional tesseract visualization"
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
          <span>VIEW</span>

          <strong>
            {viewMode === "SLICE"
              ? "TRUE SLICE"
              : viewMode}
          </strong>
        </div>

        <div>
          <span>SOURCE</span>
          <strong>16 V / 32 E</strong>
        </div>

        <div>
          <span>DISPLAY</span>

          <strong>
            {renderStats.vertices}
            {" V / "}
            {renderStats.edges}
            {" E"}
          </strong>
        </div>

        {viewMode ===
          "SLICE" && (
          <div>
            <span>SLICE W</span>

            <strong>
              {sliceW.toFixed(2)}
            </strong>
          </div>
        )}

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

      {viewMode !==
        "SLICE" && (
        <aside
          className="cosmos-w-legend"
          aria-label="Fourth spatial coordinate color legend"
        >
          <div className="cosmos-w-legend-header">
            <span>
              W AXIS
            </span>

            <strong>
              VISUAL ENCODING
            </strong>
          </div>

          <div
            className="cosmos-w-gradient"
            aria-hidden="true"
          />

          <div className="cosmos-w-labels">
            <span>−W</span>
            <span>0</span>
            <span>+W</span>
          </div>

          <p>
            Color encodes fourth-dimensional position after rotation.
          </p>

          <small>
            ARTISTIC VISUALIZATION
          </small>
        </aside>
      )}

      <section
        className="cosmos-controls"
        aria-label="Four-dimensional controls"
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

        <div className="cosmos-view-section">
          <div className="cosmos-slider-heading">
            <span>
              VIEW MODE
            </span>
          </div>

          <div
            className="cosmos-mode-switch"
            role="group"
            aria-label="Four-dimensional viewing mode"
          >
            {VIEW_MODES.map(
              ({
                mode,
                label
              }) => (
                <button
                  key={mode}
                  type="button"
                  className={
                    viewMode === mode
                      ? "cosmos-mode-button is-active"
                      : "cosmos-mode-button"
                  }
                  onClick={
                    () =>
                      selectViewMode(
                        mode
                      )
                  }
                  aria-pressed={
                    viewMode === mode
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {viewMode ===
          "PERSPECTIVE" && (
          <label className="cosmos-slider cosmos-view-control">
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
        )}

        {viewMode ===
          "ORTHOGRAPHIC" && (
          <p className="cosmos-view-description">
            W is removed only after the true R⁴ rotation. No fourth-dimensional perspective scaling is applied.
          </p>
        )}

        {viewMode ===
          "SLICE" && (
          <>
            <label className="cosmos-slider cosmos-view-control">
              <div className="cosmos-slider-heading">
                <span>
                  SLICE W
                </span>

                <output>
                  {sliceW.toFixed(2)}
                </output>
              </div>

              <input
                type="range"
                min="-2.2"
                max="2.2"
                step="0.01"
                value={
                  sliceW
                }
                onChange={
                  (event) =>
                    updateSliceW(
                      Number(
                        event
                          .currentTarget
                          .value
                      )
                    )
                }
                aria-label="Four-dimensional W slice position"
              />
            </label>

            <p className="cosmos-view-description">
              Actual intersection of the rotated tesseract with the 3D hyperplane w = {sliceW.toFixed(2)}.
            </p>
          </>
        )}

        <div className="cosmos-control-divider" />

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
        {viewMode ===
          "PERSPECTIVE" && (
          <>
            <span>
              FOUR-DIMENSIONAL PERSPECTIVE
            </span>

            <strong>
              W position is encoded visually while the object is projected into 3D.
            </strong>
          </>
        )}

        {viewMode ===
          "ORTHOGRAPHIC" && (
          <>
            <span>
              ORTHOGRAPHIC 4D → 3D
            </span>

            <strong>
              Color reveals hidden W position even after W is discarded geometrically.
            </strong>
          </>
        )}

        {viewMode ===
          "SLICE" && (
          <>
            <span>
              TRUE 3D CROSS-SECTION
            </span>

            <strong>
              This geometry actually intersects the hyperplane w = {sliceW.toFixed(2)}.
            </strong>
          </>
        )}
      </div>
    </main>
  );
}

export default App;
