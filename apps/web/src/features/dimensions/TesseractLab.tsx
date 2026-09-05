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

import type {
  RenderLineMesh3
} from "@cosmos/renderer";

import {
  ThreeWebGPUBackend
} from "@cosmos/renderer/three-webgpu";

import {
  createNDHypercubeRenderResult
} from "./ndHypercubeMesh";

import "../../App.css";
import "./DimensionsLab.css";

const BASE_TESSERACT =
  createTesseract(2);

const MIN_DIMENSION = 1;
const MAX_DIMENSION = 99;
const MIN_VIEW_ZOOM = 0.22;
const MAX_VIEW_ZOOM = 14;

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
  readonly exact: boolean;
  readonly theoreticalVertices: bigint;
  readonly theoreticalEdges: bigint;
}

interface PointerPoint {
  readonly x: number;
  readonly y: number;
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

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.max(
    minimum,
    Math.min(
      maximum,
      value
    )
  );
}

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
      manual.XY + automatic.XY
    );

  const xz =
    rotationMatrix4(
      RotationPlane4.XZ,
      manual.XZ + automatic.XZ
    );

  const xw =
    rotationMatrix4(
      RotationPlane4.XW,
      manual.XW + automatic.XW
    );

  const yz =
    rotationMatrix4(
      RotationPlane4.YZ,
      manual.YZ + automatic.YZ
    );

  const yw =
    rotationMatrix4(
      RotationPlane4.YW,
      manual.YW + automatic.YW
    );

  const zw =
    rotationMatrix4(
      RotationPlane4.ZW,
      manual.ZW + automatic.ZW
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

function transformRenderMesh(
  mesh: RenderLineMesh3,
  zoom: number,
  panX: number,
  panY: number
): RenderLineMesh3 {
  return {
    ...mesh,
    vertices:
      mesh.vertices.map(
        vertex => ({
          x:
            vertex.x * zoom + panX,
          y:
            vertex.y * zoom + panY,
          z:
            vertex.z * zoom
        })
      )
  };
}

function objectName(
  dimension: number
): string {
  switch (dimension) {
    case 1:
      return "LINE SEGMENT";
    case 2:
      return "SQUARE";
    case 3:
      return "CUBE";
    case 4:
      return "TESSERACT";
    case 5:
      return "PENTERACT";
    default:
      return `${dimension}-CUBE`;
  }
}

function formatBigInt(
  value: bigint
): string {
  const text = value.toString();

  if (text.length <= 9) {
    return Number(value)
      .toLocaleString("en-US");
  }

  const digits =
    text.slice(0, 4);

  return `${digits[0]}.${digits.slice(1)}e${text.length - 1}`;
}

function theoreticalCounts(
  dimension: number
): {
  readonly vertices: bigint;
  readonly edges: bigint;
} {
  const vertices =
    1n << BigInt(dimension);

  return {
    vertices,
    edges:
      BigInt(dimension) *
      (
        1n <<
        BigInt(dimension - 1)
      )
  };
}

function pointerDistance(
  first: PointerPoint,
  second: PointerPoint
): number {
  return Math.hypot(
    first.x - second.x,
    first.y - second.y
  );
}

function TesseractLab() {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const [status, setStatus] =
    useState<ViewportStatus>(
      "INITIALIZING"
    );

  const [dimension, setDimension] =
    useState(4);
  const dimensionRef =
    useRef(4);

  const [manualAngles, setManualAngles] =
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

  const [autoRotation, setAutoRotation] =
    useState(true);
  const autoRotationRef =
    useRef(true);

  const [projectionDistance, setProjectionDistance] =
    useState(4.5);
  const projectionDistanceRef =
    useRef(4.5);

  const [viewMode, setViewMode] =
    useState<ViewMode>(
      "PERSPECTIVE"
    );
  const viewModeRef =
    useRef<ViewMode>(
      "PERSPECTIVE"
    );

  const [sliceW, setSliceW] =
    useState(0);
  const sliceWRef =
    useRef(0);

  const [ndAxisA, setNdAxisA] =
    useState(0);
  const ndAxisARef =
    useRef(0);

  const [ndAxisB, setNdAxisB] =
    useState(1);
  const ndAxisBRef =
    useRef(1);

  const [ndManualAngle, setNdManualAngle] =
    useState(0);
  const ndManualAngleRef =
    useRef(0);
  const ndAutoAngleRef =
    useRef(0);

  const [viewZoom, setViewZoom] =
    useState(1);
  const viewZoomRef =
    useRef(1);

  const [, setViewPan] =
    useState({
      x: 0,
      y: 0
    });
  const viewPanRef =
    useRef({
      x: 0,
      y: 0
    });

  const initialCounts =
    theoreticalCounts(4);

  const [renderStats, setRenderStats] =
    useState<RenderStats>({
      vertices: 16,
      edges: 32,
      exact: true,
      theoreticalVertices:
        initialCounts.vertices,
      theoreticalEdges:
        initialCounts.edges
    });
  const renderStatsRef =
    useRef<RenderStats>({
      vertices: 16,
      edges: 32,
      exact: true,
      theoreticalVertices:
        initialCounts.vertices,
      theoreticalEdges:
        initialCounts.edges
    });

  function updateDimension(
    value: number
  ): void {
    if (!Number.isFinite(value)) {
      return;
    }

    const next =
      Math.round(
        clamp(
          value,
          MIN_DIMENSION,
          MAX_DIMENSION
        )
      );

    dimensionRef.current = next;
    setDimension(next);

    const nextA =
      next < 2
        ? 0
        : Math.min(
            ndAxisARef.current,
            next - 1
          );

    let nextB =
      next < 2
        ? 0
        : Math.min(
            ndAxisBRef.current,
            next - 1
          );

    if (
      next >= 2 &&
      nextA === nextB
    ) {
      nextB =
        (nextA + 1) % next;
    }

    ndAxisARef.current = nextA;
    ndAxisBRef.current = nextB;
    setNdAxisA(nextA);
    setNdAxisB(nextB);

    resetView();
  }

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

    manualAnglesRef.current = next;
    setManualAngles(next);
  }

  function updateNDPlane(
    which: "A" | "B",
    value: number
  ): void {
    const n =
      dimensionRef.current;

    if (n < 2) {
      return;
    }

    const index =
      Math.round(
        clamp(
          value - 1,
          0,
          n - 1
        )
      );

    if (which === "A") {
      const nextA =
        index === ndAxisBRef.current
          ? (index + 1) % n
          : index;

      ndAxisARef.current = nextA;
      setNdAxisA(nextA);
      return;
    }

    const nextB =
      index === ndAxisARef.current
        ? (index + 1) % n
        : index;

    ndAxisBRef.current = nextB;
    setNdAxisB(nextB);
  }

  function updateNDAngle(
    value: number
  ): void {
    if (!Number.isFinite(value)) {
      return;
    }

    ndManualAngleRef.current = value;
    setNdManualAngle(value);
  }

  function toggleAutoRotation():
    void {
    const next =
      !autoRotationRef.current;

    autoRotationRef.current = next;
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

    projectionDistanceRef.current = value;
    setProjectionDistance(value);
  }

  function updateSliceW(
    value: number
  ): void {
    if (!Number.isFinite(value)) {
      return;
    }

    sliceWRef.current = value;
    setSliceW(value);
  }

  function selectViewMode(
    mode: ViewMode
  ): void {
    viewModeRef.current = mode;
    setViewMode(mode);
  }

  function setZoom(
    value: number
  ): void {
    const next =
      clamp(
        value,
        MIN_VIEW_ZOOM,
        MAX_VIEW_ZOOM
      );

    viewZoomRef.current = next;
    setViewZoom(next);
  }

  function zoomBy(
    multiplier: number
  ): void {
    setZoom(
      viewZoomRef.current *
      multiplier
    );
  }

  function panBy(
    dx: number,
    dy: number
  ): void {
    const next = {
      x:
        clamp(
          viewPanRef.current.x + dx,
          -5,
          5
        ),
      y:
        clamp(
          viewPanRef.current.y + dy,
          -5,
          5
        )
    };

    viewPanRef.current = next;
    setViewPan(next);
  }

  function resetView():
    void {
    viewZoomRef.current = 1;
    viewPanRef.current = {
      x: 0,
      y: 0
    };
    setViewZoom(1);
    setViewPan({
      x: 0,
      y: 0
    });
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
    ndManualAngleRef.current = 0;
    ndAutoAngleRef.current = 0;

    setManualAngles(zeroManual);
    setNdManualAngle(0);
  }

  function updateRenderStats(
    next: RenderStats
  ): void {
    const previous =
      renderStatsRef.current;

    if (
      previous.vertices === next.vertices &&
      previous.edges === next.edges &&
      previous.exact === next.exact &&
      previous.theoreticalVertices ===
        next.theoreticalVertices &&
      previous.theoreticalEdges ===
        next.theoreticalEdges
    ) {
      return;
    }

    renderStatsRef.current = next;
    setRenderStats(next);
  }

  useEffect(
    () => {
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
      const pointers =
        new Map<number, PointerPoint>();

      let previousSingle:
        PointerPoint | null = null;
      let previousPinch:
        number | null = null;
      let cancelled = false;
      let animationFrame = 0;
      let resizeObserver:
        ResizeObserver | null = null;

      const handleWheel = (
        event: WheelEvent
      ): void => {
        event.preventDefault();
        zoomBy(
          Math.exp(
            -event.deltaY *
            0.0015
          )
        );
      };

      const handlePointerDown = (
        event: PointerEvent
      ): void => {
        canvasElement.setPointerCapture(
          event.pointerId
        );

        const point = {
          x: event.clientX,
          y: event.clientY
        };

        pointers.set(
          event.pointerId,
          point
        );

        if (pointers.size === 1) {
          previousSingle = point;
        }

        if (pointers.size === 2) {
          const active =
            Array.from(
              pointers.values()
            );

          previousPinch =
            pointerDistance(
              active[0]!,
              active[1]!
            );
        }
      };

      const handlePointerMove = (
        event: PointerEvent
      ): void => {
        if (
          !pointers.has(
            event.pointerId
          )
        ) {
          return;
        }

        const next = {
          x: event.clientX,
          y: event.clientY
        };

        pointers.set(
          event.pointerId,
          next
        );

        if (
          pointers.size === 1 &&
          previousSingle !== null
        ) {
          const scale =
            0.006 /
            Math.max(
              0.25,
              viewZoomRef.current
            );

          panBy(
            (
              next.x -
              previousSingle.x
            ) * scale,
            -(
              next.y -
              previousSingle.y
            ) * scale
          );

          previousSingle = next;
          return;
        }

        if (pointers.size >= 2) {
          const active =
            Array.from(
              pointers.values()
            );

          const distance =
            pointerDistance(
              active[0]!,
              active[1]!
            );

          if (
            previousPinch !== null &&
            previousPinch > 0
          ) {
            zoomBy(
              distance /
              previousPinch
            );
          }

          previousPinch = distance;
        }
      };

      const releasePointer = (
        event: PointerEvent
      ): void => {
        pointers.delete(
          event.pointerId
        );

        if (
          canvasElement.hasPointerCapture(
            event.pointerId
          )
        ) {
          canvasElement.releasePointerCapture(
            event.pointerId
          );
        }

        previousSingle =
          pointers.size === 1
            ? Array.from(
                pointers.values()
              )[0] ?? null
            : null;

        if (pointers.size < 2) {
          previousPinch = null;
        }
      };

      canvasElement.addEventListener(
        "wheel",
        handleWheel,
        {
          passive: false
        }
      );
      canvasElement.addEventListener(
        "pointerdown",
        handlePointerDown
      );
      canvasElement.addEventListener(
        "pointermove",
        handlePointerMove
      );
      canvasElement.addEventListener(
        "pointerup",
        releasePointer
      );
      canvasElement.addEventListener(
        "pointercancel",
        releasePointer
      );

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
                  window.devicePixelRatio || 1,
                  rect.width <= 720
                    ? 1.5
                    : 2
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
                  now - previousFrameTime
                ) /
                  1000,
                0.1
              );

            previousFrameTime = now;

            if (
              autoRotationRef.current
            ) {
              if (
                dimensionRef.current === 4
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
              } else if (
                dimensionRef.current >= 2
              ) {
                ndAutoAngleRef.current +=
                  0.29 * deltaSeconds;
              }
            }

            const zoom =
              viewZoomRef.current;
            const pan =
              viewPanRef.current;

            if (
              dimensionRef.current === 4
            ) {
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

              let renderMesh:
                RenderLineMesh3;

              switch (
                viewModeRef.current
              ) {
                case "PERSPECTIVE": {
                  const projected =
                    projectTesseractPerspective(
                      rotated,
                      projectionDistanceRef.current
                    );

                  renderMesh =
                    createWEncodedProjectedTesseractRenderMesh(
                      rotated,
                      projected
                    );
                  break;
                }

                case "ORTHOGRAPHIC": {
                  const projected =
                    projectTesseractOrthographic(
                      rotated
                    );

                  renderMesh =
                    createWEncodedProjectedTesseractRenderMesh(
                      rotated,
                      projected
                    );
                  break;
                }

                case "SLICE": {
                  const slice =
                    sliceTesseractAtW(
                      rotated,
                      sliceWRef.current
                    );

                  renderMesh =
                    createTesseractSliceRenderMesh(
                      slice
                    );
                  break;
                }
              }

              const transformed =
                transformRenderMesh(
                  renderMesh,
                  zoom,
                  pan.x,
                  pan.y
                );

              backend.renderLineMesh(
                transformed
              );

              updateRenderStats({
                vertices:
                  renderMesh.vertices.length,
                edges:
                  renderMesh.edges.length,
                exact: true,
                theoreticalVertices: 16n,
                theoreticalEdges: 32n
              });
            } else {
              const result =
                createNDHypercubeRenderResult({
                  dimension:
                    dimensionRef.current,
                  axisA:
                    ndAxisARef.current,
                  axisB:
                    ndAxisBRef.current,
                  angleRad:
                    ndManualAngleRef.current +
                    ndAutoAngleRef.current,
                  sampleEdgeLimit:
                    window.innerWidth <= 720
                      ? 1_500
                      : 3_600
                });

              const transformed =
                transformRenderMesh(
                  result.mesh,
                  zoom,
                  pan.x,
                  pan.y
                );

              backend.renderLineMesh(
                transformed
              );

              updateRenderStats({
                vertices:
                  result.mesh.vertices.length,
                edges:
                  result.mesh.edges.length,
                exact:
                  result.exact,
                theoreticalVertices:
                  result.theoreticalVertices,
                theoreticalEdges:
                  result.theoreticalEdges
              });
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
            "COSMOS dimensional viewport initialization failed:",
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

        if (animationFrame !== 0) {
          cancelAnimationFrame(
            animationFrame
          );
        }

        resizeObserver?.disconnect();

        canvasElement.removeEventListener(
          "wheel",
          handleWheel
        );
        canvasElement.removeEventListener(
          "pointerdown",
          handlePointerDown
        );
        canvasElement.removeEventListener(
          "pointermove",
          handlePointerMove
        );
        canvasElement.removeEventListener(
          "pointerup",
          releasePointer
        );
        canvasElement.removeEventListener(
          "pointercancel",
          releasePointer
        );

        backend.dispose();
      };
    },
    []
  );

  const isTrue4D =
    dimension === 4;

  const dimensionDescription =
    dimension <= 3
      ? "EUCLIDEAN GEOMETRY"
      : dimension === 4
        ? "TRUE R⁴ SPATIAL GEOMETRY"
        : "MATHEMATICAL Rⁿ PROJECTION";

  return (
    <main className="cosmos-shell dimension-lab-shell">
      <canvas
        ref={canvasRef}
        className="cosmos-viewport dimension-lab-viewport"
        aria-label={`Interactive ${dimension}-dimensional hypercube visualization`}
      />

      <section className="cosmos-hud">
        <div className="cosmos-brand">
          COSMOS
          <span>∞</span>
        </div>

        <div className="cosmos-subtitle">
          DIMENSION LAB · 1D–99D
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

      <section
        className="dimension-selector"
        aria-label="Dimension selector"
      >
        <div>
          <span>DIMENSION</span>
          <strong>{dimension}D</strong>
        </div>

        <input
          type="range"
          min={MIN_DIMENSION}
          max={MAX_DIMENSION}
          step="1"
          value={dimension}
          onChange={
            event =>
              updateDimension(
                Number(
                  event.currentTarget.value
                )
              )
          }
          aria-label="Select dimension from 1 to 99"
        />

        <input
          className="dimension-number-input"
          type="number"
          min={MIN_DIMENSION}
          max={MAX_DIMENSION}
          step="1"
          value={dimension}
          onChange={
            event =>
              updateDimension(
                Number(
                  event.currentTarget.value
                )
              )
          }
          aria-label="Dimension number"
        />
      </section>

      <aside className="cosmos-readout dimension-readout">
        <div>
          <span>OBJECT</span>
          <strong>
            {objectName(dimension)}
          </strong>
        </div>

        <div>
          <span>SPACE</span>
          <strong>
            R^{dimension}
          </strong>
        </div>

        <div>
          <span>STATUS</span>
          <strong>
            {dimensionDescription}
          </strong>
        </div>

        <div>
          <span>THEORY V</span>
          <strong>
            {formatBigInt(
              renderStats.theoreticalVertices
            )}
          </strong>
        </div>

        <div>
          <span>THEORY E</span>
          <strong>
            {formatBigInt(
              renderStats.theoreticalEdges
            )}
          </strong>
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

        <div>
          <span>RENDER</span>
          <strong>
            {renderStats.exact
              ? "EXACT"
              : "DETERMINISTIC SAMPLE"}
          </strong>
        </div>

        <div>
          <span>VIEW ZOOM</span>
          <strong>
            {Math.round(
              viewZoom * 100
            )}%
          </strong>
        </div>
      </aside>

      {isTrue4D &&
        viewMode !== "SLICE" && (
        <aside
          className="cosmos-w-legend"
          aria-label="Fourth spatial coordinate color legend"
        >
          <div className="cosmos-w-legend-header">
            <span>W AXIS</span>
            <strong>VISUAL ENCODING</strong>
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

      <nav
        className="dimension-view-controls"
        aria-label="Dimension viewport controls"
      >
        <button
          type="button"
          onClick={() => zoomBy(0.78)}
          aria-label="Zoom out"
        >
          −
        </button>

        <span>
          {Math.round(
            viewZoom * 100
          )}%
        </span>

        <button
          type="button"
          onClick={() => zoomBy(1.28)}
          aria-label="Zoom in"
        >
          +
        </button>

        <button
          type="button"
          onClick={() => panBy(-0.35, 0)}
          aria-label="Move view left"
        >
          ←
        </button>

        <button
          type="button"
          onClick={() => panBy(0.35, 0)}
          aria-label="Move view right"
        >
          →
        </button>

        <button
          type="button"
          onClick={() => panBy(0, 0.35)}
          aria-label="Move view up"
        >
          ↑
        </button>

        <button
          type="button"
          onClick={() => panBy(0, -0.35)}
          aria-label="Move view down"
        >
          ↓
        </button>

        <button
          type="button"
          className="dimension-view-reset"
          onClick={resetView}
        >
          CENTER
        </button>
      </nav>

      <section
        className="cosmos-controls dimension-controls"
        aria-label={`${dimension}-dimensional controls`}
      >
        <header className="cosmos-controls-header">
          <div>
            <span className="cosmos-panel-kicker">
              MATHEMATICAL CONTROL
            </span>

            <h2>
              {dimension}D ROTATION
            </h2>
          </div>

          <button
            className={
              autoRotation
                ? "cosmos-toggle is-active"
                : "cosmos-toggle"
            }
            type="button"
            onClick={toggleAutoRotation}
            aria-pressed={autoRotation}
          >
            AUTO
          </button>
        </header>

        {isTrue4D
          ? (
              <>
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
                          <span>{label}</span>
                          <output>
                            {degrees(
                              manualAngles[key]
                            ).toFixed(0)}°
                          </output>
                        </div>

                        <input
                          type="range"
                          min={-Math.PI}
                          max={Math.PI}
                          step="0.01"
                          value={manualAngles[key]}
                          onChange={
                            event =>
                              updateManualAngle(
                                key,
                                Number(
                                  event.currentTarget.value
                                )
                              )
                          }
                          aria-label={`${label} rotation angle`}
                        />
                      </label>
                    )
                  )}
                </div>

                <div className="cosmos-control-divider" />

                <div className="cosmos-view-section">
                  <div className="cosmos-slider-heading">
                    <span>VIEW MODE</span>
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
                              selectViewMode(mode)
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

                {viewMode === "PERSPECTIVE" && (
                  <label className="cosmos-slider cosmos-view-control">
                    <div className="cosmos-slider-heading">
                      <span>4D VIEW DISTANCE</span>
                      <output>
                        {projectionDistance.toFixed(2)}
                      </output>
                    </div>

                    <input
                      type="range"
                      min="2.25"
                      max="12"
                      step="0.05"
                      value={projectionDistance}
                      onChange={
                        event =>
                          updateProjectionDistance(
                            Number(
                              event.currentTarget.value
                            )
                          )
                      }
                      aria-label="Four-dimensional perspective projection distance"
                    />
                  </label>
                )}

                {viewMode === "ORTHOGRAPHIC" && (
                  <p className="cosmos-view-description">
                    W is removed only after the true R⁴ rotation. No fourth-dimensional perspective scaling is applied.
                  </p>
                )}

                {viewMode === "SLICE" && (
                  <>
                    <label className="cosmos-slider cosmos-view-control">
                      <div className="cosmos-slider-heading">
                        <span>SLICE W</span>
                        <output>
                          {sliceW.toFixed(2)}
                        </output>
                      </div>

                      <input
                        type="range"
                        min="-2.2"
                        max="2.2"
                        step="0.01"
                        value={sliceW}
                        onChange={
                          event =>
                            updateSliceW(
                              Number(
                                event.currentTarget.value
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
              </>
            )
          : (
              <>
                <div className="dimension-plane-grid">
                  <label>
                    <span>PLANE AXIS A</span>
                    <input
                      type="number"
                      min="1"
                      max={dimension}
                      value={ndAxisA + 1}
                      disabled={dimension < 2}
                      onChange={
                        event =>
                          updateNDPlane(
                            "A",
                            Number(
                              event.currentTarget.value
                            )
                          )
                      }
                    />
                  </label>

                  <label>
                    <span>PLANE AXIS B</span>
                    <input
                      type="number"
                      min="1"
                      max={dimension}
                      value={ndAxisB + 1}
                      disabled={dimension < 2}
                      onChange={
                        event =>
                          updateNDPlane(
                            "B",
                            Number(
                              event.currentTarget.value
                            )
                          )
                      }
                    />
                  </label>
                </div>

                <label className="cosmos-slider cosmos-view-control">
                  <div className="cosmos-slider-heading">
                    <span>
                      GIVENS ROTATION x{ndAxisA + 1}x{ndAxisB + 1}
                    </span>
                    <output>
                      {degrees(
                        ndManualAngle
                      ).toFixed(0)}°
                    </output>
                  </div>

                  <input
                    type="range"
                    min={-Math.PI}
                    max={Math.PI}
                    step="0.01"
                    value={ndManualAngle}
                    disabled={dimension < 2}
                    onChange={
                      event =>
                        updateNDAngle(
                          Number(
                            event.currentTarget.value
                          )
                        )
                    }
                  />
                </label>

                <p className="cosmos-view-description dimension-disclaimer">
                  Rotation is performed exactly in the selected coordinate plane of R^{dimension}, then projected linearly into 3D for display.
                </p>

                {!renderStats.exact && (
                  <p className="dimension-sampling-badge">
                    DISPLAY SAMPLING ACTIVE · THE FULL {dimension}D HYPERCUBE HAS {formatBigInt(renderStats.theoreticalVertices)} VERTICES AND {formatBigInt(renderStats.theoreticalEdges)} EDGES.
                  </p>
                )}
              </>
            )}

        <div className="cosmos-control-divider" />

        <button
          type="button"
          className="cosmos-reset"
          onClick={resetOrientation}
        >
          RESET {dimension}D ORIENTATION
        </button>

        <p className="cosmos-control-note">
          {dimension === 4
            ? "XW, YW and ZW directly mix visible space with the fourth spatial axis."
            : dimension <= 3
              ? "This is ordinary Euclidean geometry represented in its native coordinate dimension."
              : `R^${dimension} here is a mathematical Euclidean space. Selecting ${dimension}D does not claim that nature contains ${dimension} physical spatial dimensions.`}
        </p>
      </section>

      <div className="cosmos-caption dimension-caption">
        <span>
          {isTrue4D
            ? viewMode === "SLICE"
              ? "TRUE 3D CROSS-SECTION"
              : "SPECIALIZED TRUE 4D ENGINE"
            : `R^${dimension} → R³ MATHEMATICAL PROJECTION`}
        </span>

        <strong>
          {isTrue4D
            ? "The original validated tesseract rotation, projection and slicing engine remains active."
            : renderStats.exact
              ? "All hypercube vertices and edges are rendered exactly for this dimension."
              : "The full combinatorial object is defined exactly; the viewport renders a deterministic edge sample because 2^n growth becomes computationally enormous."}
        </strong>
      </div>

      <div className="dimension-interaction-hint">
        WHEEL / PINCH TO ZOOM · DRAG TO PAN · ARROWS MOVE VIEW
      </div>
    </main>
  );
}

export default TesseractLab;
