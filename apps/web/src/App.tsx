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

function createRotation(
  elapsedSeconds: number
) {
  const xy =
    rotationMatrix4(
      RotationPlane4.XY,
      elapsedSeconds * 0.17
    );

  const xz =
    rotationMatrix4(
      RotationPlane4.XZ,
      elapsedSeconds * 0.11
    );

  const xw =
    rotationMatrix4(
      RotationPlane4.XW,
      elapsedSeconds * 0.31
    );

  const yz =
    rotationMatrix4(
      RotationPlane4.YZ,
      elapsedSeconds * 0.13
    );

  const yw =
    rotationMatrix4(
      RotationPlane4.YW,
      elapsedSeconds * 0.23
    );

  const zw =
    rotationMatrix4(
      RotationPlane4.ZW,
      elapsedSeconds * 0.19
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

  useEffect(() => {
    const currentCanvas =
      canvasRef.current;

    if (currentCanvas === null) {
      return;
    }

    /**
     * Capture the validated element in an explicitly non-null variable.
     *
     * This matters because the canvas is later used inside asynchronous
     * functions and callbacks. We do not want those scopes depending on
     * the mutable React ref.
     */
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

            /**
             * Restrict excessive render resolution on very
             * high-density displays during the first prototype.
             */
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

        const startedAt =
          performance.now();

        const renderFrame = (
          now: number
        ): void => {
          if (cancelled) {
            return;
          }

          const elapsedSeconds =
            (
              now -
              startedAt
            ) /
            1000;

          /**
           * STEP 1
           *
           * Create an actual transformation in R^4.
           */
          const rotation =
            createRotation(
              elapsedSeconds
            );

          /**
           * STEP 2
           *
           * Apply the Matrix4 transformation to the real
           * four-dimensional tesseract vertices.
           */
          const rotated =
            transformTesseract(
              BASE_TESSERACT,
              rotation
            );

          /**
           * STEP 3
           *
           * Project R^4 -> R^3 only after the true
           * four-dimensional transformation has occurred.
           */
          const projected =
            projectTesseractPerspective(
              rotated,
              4.5
            );

          /**
           * STEP 4
           *
           * Translate scientific geometry into the generic
           * renderer representation.
           */
          const renderMesh =
            createProjectedTesseractRenderMesh(
              projected
            );

          /**
           * STEP 5
           *
           * Only the resulting three-dimensional local data
           * reaches the graphics backend.
           */
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
          <span>ROTATION PLANES</span>
          <strong>6 ACTIVE</strong>
        </div>
      </aside>

      <div className="cosmos-caption">
        <span>
          Not a simulated 3D cube.
        </span>

        <strong>
          Every frame is transformed in four-dimensional space first.
        </strong>
      </div>
    </main>
  );
}

export default App;
