import type {
  RenderColor3,
  RenderPosition3
} from "./types";

export type UniverseVisualKind =
  | "star"
  | "planet"
  | "moon";

export interface UniverseRenderBody {
  readonly id: string;

  readonly label: string;

  readonly kind:
    UniverseVisualKind;

  readonly position:
    RenderPosition3;

  readonly radius:
    number;

  readonly color:
    RenderColor3;
}

export interface UniverseRenderOrbit {
  readonly id: string;

  readonly center:
    RenderPosition3;

  readonly radius:
    number;

  readonly color:
    RenderColor3;

  readonly opacity:
    number;
}

export interface UniverseRenderScene {
  readonly bodies:
    readonly UniverseRenderBody[];

  readonly orbits:
    readonly UniverseRenderOrbit[];
}

export interface UniverseCameraState {
  readonly position:
    RenderPosition3;

  readonly target:
    RenderPosition3;
}
