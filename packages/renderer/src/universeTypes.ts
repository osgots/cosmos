import type {
  RenderColor3,
  RenderPosition3
} from "./types";

export type UniverseVisualKind =
  | "star"
  | "planet"
  | "moon";

export type UniverseSurfacePreset =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "moon"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export interface UniverseRingVisual {
  readonly innerRadiusMultiplier: number;
  readonly outerRadiusMultiplier: number;
  readonly tiltRad: number;
  readonly opacity: number;
  readonly color: RenderColor3;
}

export interface UniverseHaloVisual {
  readonly scaleMultiplier: number;
  readonly opacity: number;
  readonly color: RenderColor3;
}

export interface UniverseAtmosphereVisual {
  readonly scaleMultiplier: number;
  readonly opacity: number;
  readonly color: RenderColor3;
}

export interface UniverseRenderBody {
  readonly id: string;
  readonly label: string;
  readonly kind: UniverseVisualKind;
  readonly position: RenderPosition3;
  readonly radius: number;

  /** Fallback tint used if richer rendering is unavailable. */
  readonly color: RenderColor3;

  /** Optional rendering-only visual policy. */
  readonly surfacePreset?: UniverseSurfacePreset;
  readonly roughness?: number;
  readonly metalness?: number;
  readonly ring?: UniverseRingVisual;
  readonly halo?: UniverseHaloVisual;
  readonly atmosphere?: UniverseAtmosphereVisual;
}

export interface UniverseRenderOrbit {
  readonly id: string;
  readonly center: RenderPosition3;
  readonly radius: number;
  readonly color: RenderColor3;
  readonly opacity: number;
}

export interface UniverseRenderScene {
  readonly bodies: readonly UniverseRenderBody[];
  readonly orbits: readonly UniverseRenderOrbit[];
}

export interface UniverseCameraState {
  readonly position: RenderPosition3;
  readonly target: RenderPosition3;
}
