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
 * Surface is deliberately generic so the renderer-neutral package does
 * not depend on browser-specific types such as HTMLCanvasElement.
 */
export interface RendererBackend<
  Surface = unknown
> {
  initialize(
    surface: Surface
  ): Promise<void>;

  resize(
    size: RendererSize
  ): void;

  renderLineMesh(
    mesh: RenderLineMesh3
  ): void;

  dispose(): void;
}
