import type {
  CelestialBodyId
} from "@cosmos/astronomy";

import type {
  RenderColor3,
  UniverseAtmosphereVisual,
  UniverseHaloVisual,
  UniverseRingVisual,
  UniverseSurfacePreset
} from "@cosmos/renderer";

export interface CelestialBodyVisualDefinition {
  readonly surfacePreset:
    UniverseSurfacePreset;

  readonly fallbackColor:
    RenderColor3;

  readonly orbitColor:
    RenderColor3;

  readonly roughness:
    number;

  readonly metalness:
    number;

  readonly ring?:
    UniverseRingVisual;

  readonly halo?:
    UniverseHaloVisual;

  readonly atmosphere?:
    UniverseAtmosphereVisual;
}

/**
 * Rendering-only visual policy.
 *
 * Nothing in this manifest changes physical astronomy values. The colors,
 * procedural surface presets, halo, atmosphere and ring presentation belong
 * strictly to the visualization layer.
 */
export const BODY_VISUALS = {
  sun: {
    surfacePreset: "sun",
    fallbackColor: {
      r: 1,
      g: 0.72,
      b: 0.12
    },
    orbitColor: {
      r: 1,
      g: 0.72,
      b: 0.12
    },
    roughness: 1,
    metalness: 0,
    halo: {
      scaleMultiplier: 2.55,
      opacity: 0.52,
      color: {
        r: 1,
        g: 0.48,
        b: 0.08
      }
    }
  },

  mercury: {
    surfacePreset: "mercury",
    fallbackColor: {
      r: 0.58,
      g: 0.56,
      b: 0.53
    },
    orbitColor: {
      r: 0.58,
      g: 0.56,
      b: 0.53
    },
    roughness: 0.98,
    metalness: 0
  },

  venus: {
    surfacePreset: "venus",
    fallbackColor: {
      r: 0.93,
      g: 0.68,
      b: 0.34
    },
    orbitColor: {
      r: 0.93,
      g: 0.68,
      b: 0.34
    },
    roughness: 0.92,
    metalness: 0,
    atmosphere: {
      scaleMultiplier: 1.035,
      opacity: 0.075,
      color: {
        r: 1,
        g: 0.72,
        b: 0.32
      }
    }
  },

  earth: {
    surfacePreset: "earth",
    fallbackColor: {
      r: 0.12,
      g: 0.56,
      b: 1
    },
    orbitColor: {
      r: 0.12,
      g: 0.56,
      b: 1
    },
    roughness: 0.72,
    metalness: 0,
    atmosphere: {
      scaleMultiplier: 1.045,
      opacity: 0.13,
      color: {
        r: 0.18,
        g: 0.55,
        b: 1
      }
    }
  },

  moon: {
    surfacePreset: "moon",
    fallbackColor: {
      r: 0.75,
      g: 0.78,
      b: 0.82
    },
    orbitColor: {
      r: 0.75,
      g: 0.78,
      b: 0.82
    },
    roughness: 1,
    metalness: 0
  },

  mars: {
    surfacePreset: "mars",
    fallbackColor: {
      r: 0.86,
      g: 0.29,
      b: 0.16
    },
    orbitColor: {
      r: 0.86,
      g: 0.29,
      b: 0.16
    },
    roughness: 0.96,
    metalness: 0
  },

  jupiter: {
    surfacePreset: "jupiter",
    fallbackColor: {
      r: 0.82,
      g: 0.64,
      b: 0.46
    },
    orbitColor: {
      r: 0.82,
      g: 0.64,
      b: 0.46
    },
    roughness: 0.86,
    metalness: 0
  },

  saturn: {
    surfacePreset: "saturn",
    fallbackColor: {
      r: 0.91,
      g: 0.78,
      b: 0.52
    },
    orbitColor: {
      r: 0.91,
      g: 0.78,
      b: 0.52
    },
    roughness: 0.9,
    metalness: 0,
    ring: {
      innerRadiusMultiplier: 1.24,
      outerRadiusMultiplier: 2.28,
      tiltRad: 0.466,
      opacity: 0.82,
      color: {
        r: 0.92,
        g: 0.82,
        b: 0.64
      }
    }
  },

  uranus: {
    surfacePreset: "uranus",
    fallbackColor: {
      r: 0.42,
      g: 0.84,
      b: 0.88
    },
    orbitColor: {
      r: 0.42,
      g: 0.84,
      b: 0.88
    },
    roughness: 0.84,
    metalness: 0,
    atmosphere: {
      scaleMultiplier: 1.025,
      opacity: 0.065,
      color: {
        r: 0.4,
        g: 0.9,
        b: 0.92
      }
    }
  },

  neptune: {
    surfacePreset: "neptune",
    fallbackColor: {
      r: 0.18,
      g: 0.37,
      b: 0.92
    },
    orbitColor: {
      r: 0.18,
      g: 0.37,
      b: 0.92
    },
    roughness: 0.82,
    metalness: 0,
    atmosphere: {
      scaleMultiplier: 1.03,
      opacity: 0.075,
      color: {
        r: 0.14,
        g: 0.44,
        b: 1
      }
    }
  }
} as const satisfies Readonly<
  Record<
    CelestialBodyId,
    CelestialBodyVisualDefinition
  >
>;
