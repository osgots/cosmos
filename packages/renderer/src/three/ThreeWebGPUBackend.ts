import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Scene,
  WebGPURenderer
} from "three/webgpu";

import type {
  RendererBackend,
  RendererSize
} from "../RendererBackend";

import type {
  RenderLineMesh3
} from "../types";

import {
  buildLineSegmentColors
} from "./buildLineSegmentColors";

import {
  buildLineSegmentPositions
} from "./buildLineSegmentPositions";

/**
 * Concrete COSMOS Infinity renderer backed by the current
 * Three.js WebGPURenderer.
 *
 * Three.js remains confined to this implementation.
 */
export class ThreeWebGPUBackend
implements RendererBackend<HTMLCanvasElement> {
  private readonly scene =
    new Scene();

  private readonly camera =
    new PerspectiveCamera(
      60,
      1,
      0.01,
      1_000
    );

  private readonly geometry =
    new BufferGeometry();

  private readonly material =
    new LineBasicMaterial({
      color: 0xffffff,
      vertexColors: true
    });

  private readonly lines =
    new LineSegments(
      this.geometry,
      this.material
    );

  private renderer:
    WebGPURenderer | null =
      null;

  private positionAttribute:
    Float32BufferAttribute | null =
      null;

  private colorAttribute:
    Float32BufferAttribute | null =
      null;

  public constructor() {
    this.camera.position.set(
      0,
      0,
      8
    );

    this.camera.lookAt(
      0,
      0,
      0
    );

    this.lines.frustumCulled =
      false;

    this.scene.add(
      this.lines
    );
  }

  public async initialize(
    canvas: HTMLCanvasElement
  ): Promise<void> {
    if (
      this.renderer !== null
    ) {
      throw new Error(
        "ThreeWebGPUBackend has already been initialized."
      );
    }

    const renderer =
      new WebGPURenderer({
        canvas,
        antialias: true,
        alpha: false
      });

    await renderer.init();

    this.renderer =
      renderer;
  }

  public resize(
    size: RendererSize
  ): void {
    const renderer =
      this.requireRenderer();

    if (
      !Number.isFinite(size.width) ||
      size.width <= 0 ||
      !Number.isFinite(size.height) ||
      size.height <= 0 ||
      !Number.isFinite(
        size.pixelRatio
      ) ||
      size.pixelRatio <= 0
    ) {
      throw new RangeError(
        "Renderer width, height and pixel ratio must be positive finite numbers."
      );
    }

    renderer.setPixelRatio(
      size.pixelRatio
    );

    renderer.setSize(
      size.width,
      size.height,
      false
    );

    this.camera.aspect =
      size.width /
      size.height;

    this.camera
      .updateProjectionMatrix();
  }

  public renderLineMesh(
    mesh: RenderLineMesh3
  ): void {
    const renderer =
      this.requireRenderer();

    const positions =
      buildLineSegmentPositions(
        mesh
      );

    const colors =
      buildLineSegmentColors(
        mesh
      );

    const requiredVertexCount =
      positions.length / 3;

    if (
      this.positionAttribute !==
        null &&
      this.positionAttribute.count ===
        requiredVertexCount
    ) {
      this.positionAttribute
        .array
        .set(positions);

      this.positionAttribute
        .needsUpdate = true;
    } else {
      this.positionAttribute =
        new Float32BufferAttribute(
          positions,
          3
        );

      this.geometry.setAttribute(
        "position",
        this.positionAttribute
      );
    }

    if (
      this.colorAttribute !==
        null &&
      this.colorAttribute.count ===
        requiredVertexCount
    ) {
      this.colorAttribute
        .array
        .set(colors);

      this.colorAttribute
        .needsUpdate = true;
    } else {
      this.colorAttribute =
        new Float32BufferAttribute(
          colors,
          3
        );

      this.geometry.setAttribute(
        "color",
        this.colorAttribute
      );
    }

    renderer.render(
      this.scene,
      this.camera
    );
  }

  public dispose(): void {
    this.scene.remove(
      this.lines
    );

    this.geometry.dispose();
    this.material.dispose();

    if (
      this.renderer !== null
    ) {
      this.renderer.dispose();

      this.renderer =
        null;
    }

    this.positionAttribute =
      null;

    this.colorAttribute =
      null;
  }

  private requireRenderer():
    WebGPURenderer {
    if (
      this.renderer === null
    ) {
      throw new Error(
        "ThreeWebGPUBackend must be initialized before use."
      );
    }

    return this.renderer;
  }
}
