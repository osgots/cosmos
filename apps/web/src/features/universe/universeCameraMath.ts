import type {
  UniverseCameraState
} from "@cosmos/renderer";

export interface UniverseViewState {
  readonly zoom: number;
  readonly panX: number;
  readonly panY: number;
}

export const MIN_UNIVERSE_ZOOM = 0.45;
export const MAX_UNIVERSE_ZOOM = 9;

export const DEFAULT_UNIVERSE_VIEW:
  UniverseViewState =
    Object.freeze({
      zoom: 1,
      panX: 0,
      panY: 0
    });

export function clampUniverseZoom(
  zoom: number
): number {
  if (!Number.isFinite(zoom)) {
    return 1;
  }

  return Math.min(
    MAX_UNIVERSE_ZOOM,
    Math.max(
      MIN_UNIVERSE_ZOOM,
      zoom
    )
  );
}

export function applyUniverseView(
  camera: UniverseCameraState,
  view: UniverseViewState
): UniverseCameraState {
  const zoom =
    clampUniverseZoom(
      view.zoom
    );

  const offsetX =
    camera.position.x -
    camera.target.x;

  const offsetY =
    camera.position.y -
    camera.target.y;

  const offsetZ =
    camera.position.z -
    camera.target.z;

  const target = {
    x:
      camera.target.x +
      view.panX,
    y:
      camera.target.y +
      view.panY,
    z:
      camera.target.z
  };

  return {
    target,
    position: {
      x:
        target.x +
        offsetX / zoom,
      y:
        target.y +
        offsetY / zoom,
      z:
        target.z +
        offsetZ / zoom
    }
  };
}

export function smoothUniverseView(
  current: UniverseViewState,
  target: UniverseViewState,
  deltaS: number
): UniverseViewState {
  const safeDelta =
    Number.isFinite(deltaS)
      ? Math.max(0, deltaS)
      : 0;

  const blend =
    1 -
    Math.exp(
      -9 * safeDelta
    );

  return {
    zoom:
      current.zoom +
      (
        target.zoom -
        current.zoom
      ) * blend,
    panX:
      current.panX +
      (
        target.panX -
        current.panX
      ) * blend,
    panY:
      current.panY +
      (
        target.panY -
        current.panY
      ) * blend
  };
}
