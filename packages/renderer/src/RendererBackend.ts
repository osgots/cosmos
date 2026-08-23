import type {
  RenderLineMesh3
} from "./types";

export interface RendererSize {
  readonly width: number;
  readonly height: number;
  readonly pixelRatio: number;
}

/**
 * Stable renderer boundary used by COSMOS Infinity.
 *
 * A concrete implementation may later use:
 *
 * - Three.js WebGPURenderer
 * - WebGL fallback
 * - another GPU backend
 *
 * Higher-level COSMOS systems interact only with this interface.
 */
export interface RendererBackend {
  initialize(
    canvas: HTMLCanvasElement
  ): Promise<void>;

  resize(
    size: RendererSize
  ): void;

  renderLineMesh(
    mesh: RenderLineMesh3
  ): void;

  dispose(): void;
}
