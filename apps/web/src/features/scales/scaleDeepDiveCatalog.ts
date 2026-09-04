import type {
  CosmicScaleId
} from "./CosmicScaleExplorer";

export interface ScaleFact {
  readonly label: string;
  readonly value: string;
}

export interface ScaleDeepDiveObject {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly summary: string;
  readonly facts: readonly ScaleFact[];
  readonly source: string;
}

export interface ScaleDeepDiveStage {
  readonly defaultObjectId: string;
  readonly objects: readonly ScaleDeepDiveObject[];
}

/**
 * Curated factual overlays for the first three astronomical deep-dive scales.
 *
 * Sources are intentionally named in the UI. Canvas positions remain
 * explanatory/schematic and are never represented as a catalogue-accurate
 * 3D astrometric reconstruction.
 */
export const SCALE_DEEP_DIVE_CATALOG:
  Readonly<
    Partial<
      Record<
        CosmicScaleId,
        ScaleDeepDiveStage
      >
    >
  > = Object.freeze({
    "nearby-stars": {
      defaultObjectId: "proxima",
      objects: Object.freeze([
        {
          id: "sun",
          name: "Sun",
          category: "LOCAL ANCHOR · G-TYPE STAR",
          summary:
            "Our reference star and the origin used for the local-neighbourhood distance rings.",
          facts: Object.freeze([
            {
              label: "DISTANCE",
              value: "0 ly"
            },
            {
              label: "LOCATION",
              value: "Orion Spur"
            },
            {
              label: "ROLE",
              value: "Solar System primary"
            }
          ]),
          source: "NASA Science · Sun Facts"
        },
        {
          id: "proxima",
          name: "Proxima Centauri",
          category: "NEAREST STELLAR NEIGHBOUR",
          summary:
            "A small red-dwarf member of the Alpha Centauri triple system and the nearest known star to the Sun.",
          facts: Object.freeze([
            {
              label: "DISTANCE",
              value: "4.24 ly"
            },
            {
              label: "SYSTEM",
              value: "Alpha Centauri"
            },
            {
              label: "CLASS",
              value: "Red dwarf"
            }
          ]),
          source: "NASA Science · Sun Facts"
        },
        {
          id: "alpha-centauri",
          name: "Alpha Centauri A + B",
          category: "SUNLIKE BINARY PAIR",
          summary:
            "Two bright stars orbiting each other; together with Proxima they form the nearest stellar system to the Sun.",
          facts: Object.freeze([
            {
              label: "DISTANCE",
              value: "4.37 ly"
            },
            {
              label: "COMPONENTS",
              value: "A + B + Proxima"
            },
            {
              label: "TYPE",
              value: "Multiple-star system"
            }
          ]),
          source: "NASA Science · Sun Facts"
        },
        {
          id: "barnard",
          name: "Barnard's Star",
          category: "NEARBY RED DWARF",
          summary:
            "A faint, nearby red dwarf represented here as part of the local stellar neighbourhood rather than as a sky-position chart.",
          facts: Object.freeze([
            {
              label: "DISTANCE",
              value: "≈5.96 ly"
            },
            {
              label: "CLASS",
              value: "Red dwarf"
            },
            {
              label: "VIEW",
              value: "Schematic map"
            }
          ]),
          source: "NASA / established nearby-star measurements"
        },
        {
          id: "sirius",
          name: "Sirius",
          category: "BRIGHT NEARBY BINARY",
          summary:
            "The brightest star system in Earth's night sky, shown here within the same compressed local-distance view.",
          facts: Object.freeze([
            {
              label: "DISTANCE",
              value: "≈8.60 ly"
            },
            {
              label: "SYSTEM",
              value: "Sirius A + B"
            },
            {
              label: "VIEW",
              value: "Distance-compressed"
            }
          ]),
          source: "NASA / established stellar distance measurements"
        },
        {
          id: "procyon",
          name: "Procyon",
          category: "NEARBY BINARY SYSTEM",
          summary:
            "A nearby binary system included to extend the local neighbourhood beyond the ten-light-year region.",
          facts: Object.freeze([
            {
              label: "DISTANCE",
              value: "≈11.46 ly"
            },
            {
              label: "SYSTEM",
              value: "Binary"
            },
            {
              label: "VIEW",
              value: "Distance-compressed"
            }
          ]),
          source: "NASA / established stellar distance measurements"
        }
      ])
    },

    "milky-way": {
      defaultObjectId: "solar-location",
      objects: Object.freeze([
        {
          id: "solar-location",
          name: "Solar Location",
          category: "ORION SPUR",
          summary:
            "The Sun sits in the Orion Spur rather than near the galactic centre. This marker gives the galaxy scene a physical reference point.",
          facts: Object.freeze([
            {
              label: "CENTER DISTANCE",
              value: "≈26,000 ly"
            },
            {
              label: "REGION",
              value: "Orion Spur"
            },
            {
              label: "GALACTIC ORBIT",
              value: "≈250 million y"
            }
          ]),
          source: "NASA Science / NASA StarChild · Milky Way"
        },
        {
          id: "galactic-disk",
          name: "Galactic Disk",
          category: "BARRED SPIRAL STRUCTURE",
          summary:
            "The luminous disk contains spiral structure, dust, gas and most of the stars visible in the familiar Milky Way band.",
          facts: Object.freeze([
            {
              label: "DIAMETER",
              value: "≈100,000 ly"
            },
            {
              label: "MORPHOLOGY",
              value: "Barred spiral"
            },
            {
              label: "VISUAL",
              value: "Procedural morphology"
            }
          ]),
          source: "NASA StarChild · The Milky Way"
        },
        {
          id: "sagittarius-a",
          name: "Sagittarius A*",
          category: "GALACTIC-CENTRE BLACK HOLE",
          summary:
            "The compact supermassive black hole at the heart of the Milky Way, embedded within an exceptionally dense stellar environment.",
          facts: Object.freeze([
            {
              label: "MASS",
              value: "≈4 million Suns"
            },
            {
              label: "FROM SUN",
              value: "≈26,000 ly"
            },
            {
              label: "REGION",
              value: "Galactic centre"
            }
          ]),
          source: "NASA Science · Galactic Center / Sagittarius A*"
        },
        {
          id: "galactic-bulge",
          name: "Central Bulge",
          category: "DENSE INNER GALAXY",
          summary:
            "The inner Milky Way transitions into a dense bulge where stellar separations can be dramatically smaller than in the Solar neighbourhood.",
          facts: Object.freeze([
            {
              label: "INNER REGION",
              value: "~10,000 ly"
            },
            {
              label: "DENSITY",
              value: "Up to ~10⁶× local"
            },
            {
              label: "CENTER",
              value: "Sagittarius A*"
            }
          ]),
          source: "NASA Webb · What Is the Center of Our Galaxy Like?"
        }
      ])
    },

    "local-group": {
      defaultObjectId: "milky-way",
      objects: Object.freeze([
        {
          id: "milky-way",
          name: "Milky Way",
          category: "OUR LARGE GALAXY",
          summary:
            "One of the Local Group's two dominant large spirals and the home galaxy of the Solar System.",
          facts: Object.freeze([
            {
              label: "TYPE",
              value: "Barred spiral"
            },
            {
              label: "REFERENCE",
              value: "Our galaxy"
            },
            {
              label: "GROUP",
              value: "Local Group"
            }
          ]),
          source: "NASA Science · Milky Way"
        },
        {
          id: "andromeda",
          name: "Andromeda · M31",
          category: "NEAREST LARGE GALAXY",
          summary:
            "The nearest major galaxy to the Milky Way and the other dominant large spiral in the Local Group.",
          facts: Object.freeze([
            {
              label: "DISTANCE",
              value: "≈2.5 million ly"
            },
            {
              label: "TYPE",
              value: "Spiral galaxy"
            },
            {
              label: "GROUP",
              value: ">50 galaxies"
            }
          ]),
          source: "NASA Science · Our Neighbor Andromeda / Messier 31"
        },
        {
          id: "triangulum",
          name: "Triangulum · M33",
          category: "LOCAL GROUP SPIRAL",
          summary:
            "A smaller spiral member of the Local Group, famous for large star-forming regions such as NGC 604.",
          facts: Object.freeze([
            {
              label: "DISTANCE",
              value: "≈2.7 million ly"
            },
            {
              label: "TYPE",
              value: "Spiral galaxy"
            },
            {
              label: "FEATURE",
              value: "NGC 604"
            }
          ]),
          source: "NASA Hubble · M33 / NGC 604"
        },
        {
          id: "dwarf-population",
          name: "Dwarf Population",
          category: "NUMEROUS SMALL MEMBERS",
          summary:
            "Most Local Group members are much smaller dwarf systems. They are represented as a halo of faint companion galaxies rather than individually named points.",
          facts: Object.freeze([
            {
              label: "MEMBERSHIP",
              value: ">50 known galaxies"
            },
            {
              label: "DOMINANT TYPE",
              value: "Dwarf systems"
            },
            {
              label: "VISUAL",
              value: "Representative halo"
            }
          ]),
          source: "NASA / WISE · Our Neighbor Andromeda"
        }
      ])
    }
  });

export function deepDiveForStage(
  stageId: CosmicScaleId
): ScaleDeepDiveStage | null {
  return SCALE_DEEP_DIVE_CATALOG[
    stageId
  ] ?? null;
}
