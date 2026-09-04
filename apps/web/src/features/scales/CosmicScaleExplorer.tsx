import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  deepDiveForStage
} from "./scaleDeepDiveCatalog";

import type {
  ScaleDeepDiveObject
} from "./scaleDeepDiveCatalog";

import "./CosmicScaleExplorer.css";

export type CosmicScaleId =
  | "human"
  | "earth"
  | "moon"
  | "solar-system"
  | "nearby-stars"
  | "milky-way"
  | "local-group"
  | "clusters"
  | "superclusters"
  | "cosmic-web"
  | "observable-universe"
  | "beyond"
  | "infinity";

export interface CosmicScaleStage {
  readonly id: CosmicScaleId;
  readonly title: string;
  readonly subtitle: string;
  readonly scaleLabel: string;
  readonly scienceStatus:
    | "REFERENCE SCALE"
    | "OBSERVED"
    | "ESTABLISHED MODEL"
    | "PHYSICS-CONSTRAINED EXTRAPOLATION"
    | "THEORETICAL CONTINUATION";
  readonly visualNote: string;
}

export const COSMIC_SCALE_STAGES:
  readonly CosmicScaleStage[] =
    Object.freeze([
      {
        id: "human",
        title: "Human",
        subtitle:
          "Begin from the scale your senses know directly.",
        scaleLabel:
          "ORDER OF METRES",
        scienceStatus:
          "REFERENCE SCALE",
        visualNote:
          "Representative human-scale reference. The figure is illustrative, not a biological model."
      },
      {
        id: "earth",
        title: "Earth",
        subtitle:
          "Our planetary reference frame.",
        scaleLabel:
          "PLANETARY SCALE",
        scienceStatus:
          "OBSERVED",
        visualNote:
          "Rendered through the live Solar System engine using physical astronomy values and a visualization layer."
      },
      {
        id: "moon",
        title: "Moon",
        subtitle:
          "Earth's natural satellite and our nearest large celestial neighbour.",
        scaleLabel:
          "EARTH–MOON SCALE",
        scienceStatus:
          "OBSERVED",
        visualNote:
          "Rendered through the live Solar System engine. Explore and true-scale modes remain explicitly separated."
      },
      {
        id: "solar-system",
        title: "Solar System",
        subtitle:
          "From the Sun through the eight planets to the outer planetary frontier.",
        scaleLabel:
          "TENS OF AU",
        scienceStatus:
          "ESTABLISHED MODEL",
        visualNote:
          "Current motion uses circularized reference orbits and labelled visual phase offsets, not a current ephemeris."
      },
      {
        id: "nearby-stars",
        title: "Nearby Stars",
        subtitle:
          "Leave the heliosphere and enter the local stellar neighbourhood.",
        scaleLabel:
          "LIGHT-YEARS",
        scienceStatus:
          "OBSERVED",
        visualNote:
          "Measured distances are factual. The 2D placement is compressed and schematic rather than a catalogue-accurate astrometric reconstruction."
      },
      {
        id: "milky-way",
        title: "Milky Way",
        subtitle:
          "Our barred spiral galaxy, seen as a structured stellar system rather than a flat icon.",
        scaleLabel:
          "~100,000 LIGHT-YEARS",
        scienceStatus:
          "ESTABLISHED MODEL",
        visualNote:
          "Galaxy-scale morphology is procedural and explanatory. Named physical landmarks use established measurements."
      },
      {
        id: "local-group",
        title: "Local Group",
        subtitle:
          "The gravitational neighbourhood containing the Milky Way, Andromeda and many smaller galaxies.",
        scaleLabel:
          "MILLIONS OF LIGHT-YEARS",
        scienceStatus:
          "ESTABLISHED MODEL",
        visualNote:
          "Named galaxies and quoted distances are observationally grounded; scene spacing is compressed for readability."
      },
      {
        id: "clusters",
        title: "Galaxy Clusters",
        subtitle:
          "Hundreds to thousands of galaxies bound inside deep gravitational environments.",
        scaleLabel:
          "TENS OF MILLIONS OF LIGHT-YEARS",
        scienceStatus:
          "ESTABLISHED MODEL",
        visualNote:
          "The scene is a representative cluster visualization, not a labelled map of one observed cluster."
      },
      {
        id: "superclusters",
        title: "Superclusters",
        subtitle:
          "Cluster complexes extending across hundreds of millions of light-years.",
        scaleLabel:
          "HUNDREDS OF MILLIONS OF LIGHT-YEARS",
        scienceStatus:
          "ESTABLISHED MODEL",
        visualNote:
          "The rendered network communicates hierarchy and connectivity, not literal present-day object coordinates."
      },
      {
        id: "cosmic-web",
        title: "Cosmic Web",
        subtitle:
          "Filaments, nodes, sheets and immense voids emerging from large-scale structure formation.",
        scaleLabel:
          "BILLIONS OF LIGHT-YEARS",
        scienceStatus:
          "ESTABLISHED MODEL",
        visualNote:
          "Procedural filaments are an explanatory visualization of cosmic-web morphology, not observed galaxy positions."
      },
      {
        id: "observable-universe",
        title: "Observable Universe",
        subtitle:
          "The region from which signals can have reached us during cosmic history.",
        scaleLabel:
          "COSMOLOGICAL HORIZON",
        scienceStatus:
          "ESTABLISHED MODEL",
        visualNote:
          "The horizon surface is conceptual. It is not a physical wall or shell surrounding Earth."
      },
      {
        id: "beyond",
        title: "Beyond the Horizon",
        subtitle:
          "Continue past observation only where the assumptions are made explicit.",
        scaleLabel:
          "BEYOND DIRECT OBSERVATION",
        scienceStatus:
          "PHYSICS-CONSTRAINED EXTRAPOLATION",
        visualNote:
          "Generated structure beyond the horizon is never presented as observed. The boundary marks an epistemic limit, not an edge of space."
      },
      {
        id: "infinity",
        title: "∞",
        subtitle:
          "Exploration continues without pretending that cosmology has measured a final spatial edge.",
        scaleLabel:
          "NO VISUAL FINAL SCREEN",
        scienceStatus:
          "THEORETICAL CONTINUATION",
        visualNote:
          "This mode represents unbounded exploration. It does not claim that observations establish a literally infinite Universe."
      }
    ]);

interface CosmicScaleExplorerProps {
  readonly stageId: CosmicScaleId;
}

interface PointerPoint {
  readonly x: number;
  readonly y: number;
}

interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
}

interface SeededPoint {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly phase: number;
}

interface NetworkNode {
  readonly x: number;
  readonly y: number;
  readonly weight: number;
}

interface NearbyStarVisual {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly color: string;
  readonly glow: string;
}

const MIN_ZOOM = 0.58;
const MAX_ZOOM = 8.5;

const NEARBY_STARS:
  readonly NearbyStarVisual[] =
    Object.freeze([
      {
        id: "sun",
        label: "SUN",
        x: 0,
        y: 0,
        radius: 9,
        color: "#fff0ad",
        glow: "rgba(255,196,83,0.18)"
      },
      {
        id: "proxima",
        label: "PROXIMA CENTAURI · 4.24 LY",
        x: -168,
        y: -76,
        radius: 5,
        color: "#ff876b",
        glow: "rgba(255,86,61,0.17)"
      },
      {
        id: "alpha-centauri",
        label: "ALPHA CENTAURI A+B · 4.37 LY",
        x: -205,
        y: -35,
        radius: 7,
        color: "#ffe3a2",
        glow: "rgba(255,211,125,0.16)"
      },
      {
        id: "barnard",
        label: "BARNARD'S STAR · 5.96 LY",
        x: 110,
        y: 92,
        radius: 5,
        color: "#ff9477",
        glow: "rgba(255,91,71,0.15)"
      },
      {
        id: "sirius",
        label: "SIRIUS · 8.60 LY",
        x: 252,
        y: -132,
        radius: 8,
        color: "#ddecff",
        glow: "rgba(125,184,255,0.2)"
      },
      {
        id: "procyon",
        label: "PROCYON · 11.46 LY",
        x: -272,
        y: 150,
        radius: 6,
        color: "#fff0c7",
        glow: "rgba(255,219,160,0.15)"
      }
    ]);

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

function seededRandom(
  seed: number
): () => number {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;

    let result = value;

    result = Math.imul(
      result ^ result >>> 15,
      result | 1
    );

    result ^=
      result +
      Math.imul(
        result ^ result >>> 7,
        result | 61
      );

    return (
      (
        result ^ result >>> 14
      ) >>> 0
    ) / 4_294_967_296;
  };
}

function hashText(
  value: string
): number {
  let hash = 2_026;

  for (
    const character of value
  ) {
    hash =
      (
        hash * 31 +
        character.charCodeAt(0)
      ) >>> 0;
  }

  return hash;
}

function stageFromId(
  stageId: CosmicScaleId
): CosmicScaleStage {
  return (
    COSMIC_SCALE_STAGES.find(
      stage =>
        stage.id === stageId
    ) ??
    COSMIC_SCALE_STAGES[0]!
  );
}

function makeStarfield(
  seed: number,
  count: number
): readonly SeededPoint[] {
  const random =
    seededRandom(seed);

  return Object.freeze(
    Array.from(
      { length: count },
      () => ({
        x:
          random() * 2 - 1,
        y:
          random() * 2 - 1,
        size:
          0.35 +
          random() * 1.75,
        phase:
          random() *
          Math.PI * 2
      })
    )
  );
}

function drawBackgroundStars(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: readonly SeededPoint[],
  timeS: number
): void {
  context.save();

  const background =
    context.createRadialGradient(
      width * 0.5,
      height * 0.45,
      0,
      width * 0.5,
      height * 0.45,
      Math.max(
        width,
        height
      ) * 0.72
    );

  background.addColorStop(
    0,
    "#020916"
  );
  background.addColorStop(
    0.55,
    "#00040b"
  );
  background.addColorStop(
    1,
    "#000106"
  );

  context.fillStyle =
    background;
  context.fillRect(
    0,
    0,
    width,
    height
  );

  for (
    const point of points
  ) {
    const alpha =
      0.16 +
      0.4 *
      (
        0.5 +
        0.5 *
        Math.sin(
          timeS * 0.6 +
          point.phase
        )
      );

    context.globalAlpha = alpha;
    context.fillStyle =
      point.size > 1.4
        ? "#f6fbff"
        : "#cfeaff";
    context.beginPath();
    context.arc(
      (
        point.x * 0.5 +
        0.5
      ) * width,
      (
        point.y * 0.5 +
        0.5
      ) * height,
      point.size,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  context.globalAlpha = 1;
  context.restore();
}

function glowCircle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  core: string,
  glow: string,
  opacity = 1
): void {
  context.save();
  context.globalAlpha = opacity;

  const gradient =
    context.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      radius * 3.2
    );

  gradient.addColorStop(
    0,
    core
  );
  gradient.addColorStop(
    0.16,
    core
  );
  gradient.addColorStop(
    0.42,
    glow
  );
  gradient.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(
    x,
    y,
    radius * 3.2,
    0,
    Math.PI * 2
  );
  context.fill();
  context.restore();
}

function drawSelectionRing(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  timeS: number
): void {
  context.save();
  context.strokeStyle =
    "rgba(133,224,255,0.88)";
  context.lineWidth = 1.4;
  context.setLineDash([
    5,
    5
  ]);
  context.lineDashOffset =
    -timeS * 10;
  context.beginPath();
  context.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );
  context.stroke();
  context.setLineDash([]);
  context.restore();
}

function drawSpiralGalaxy(
  context: CanvasRenderingContext2D,
  radius: number,
  rotation: number,
  opacity: number,
  seed: number,
  flatten = 0.72,
  quality = 1
): void {
  const random =
    seededRandom(seed);

  context.save();
  context.rotate(rotation);
  context.scale(1, flatten);
  context.globalCompositeOperation =
    "lighter";

  const halo =
    context.createRadialGradient(
      0,
      0,
      radius * 0.05,
      0,
      0,
      radius
    );

  halo.addColorStop(
    0,
    `rgba(255,236,197,${
      0.28 * opacity
    })`
  );
  halo.addColorStop(
    0.28,
    `rgba(122,168,255,${
      0.09 * opacity
    })`
  );
  halo.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );

  context.fillStyle = halo;
  context.beginPath();
  context.arc(
    0,
    0,
    radius,
    0,
    Math.PI * 2
  );
  context.fill();

  glowCircle(
    context,
    0,
    0,
    radius * 0.12,
    "rgba(255,247,226,0.98)",
    "rgba(255,171,95,0.16)",
    opacity
  );

  context.save();
  context.rotate(-0.22);
  const barGradient =
    context.createLinearGradient(
      -radius * 0.28,
      0,
      radius * 0.28,
      0
    );
  barGradient.addColorStop(
    0,
    "rgba(255,188,111,0)"
  );
  barGradient.addColorStop(
    0.5,
    `rgba(255,225,184,${
      0.34 * opacity
    })`
  );
  barGradient.addColorStop(
    1,
    "rgba(255,188,111,0)"
  );
  context.fillStyle =
    barGradient;
  context.fillRect(
    -radius * 0.32,
    -radius * 0.026,
    radius * 0.64,
    radius * 0.052
  );
  context.restore();

  const arms = 4;
  const starsPerArm =
    Math.max(
      130,
      Math.round(
        460 * quality
      )
    );

  for (
    let arm = 0;
    arm < arms;
    arm += 1
  ) {
    for (
      let index = 0;
      index < starsPerArm;
      index += 1
    ) {
      const progress =
        index /
        starsPerArm;

      const angle =
        arm *
          Math.PI * 0.5 +
        progress *
          Math.PI * 4.05 +
        (
          random() - 0.5
        ) *
          (
            0.22 +
            progress * 0.34
          );

      const radial =
        radius *
        (
          0.07 +
          0.93 * progress
        ) *
        (
          0.89 +
          random() * 0.22
        );

      const x =
        Math.cos(angle) *
        radial;
      const y =
        Math.sin(angle) *
        radial;

      const outer =
        progress > 0.48;

      context.globalAlpha =
        opacity *
        (
          0.11 +
          random() * 0.58
        );

      context.fillStyle =
        outer
          ? random() > 0.72
            ? "#d9f0ff"
            : "#8fc0ff"
          : random() > 0.45
            ? "#ffe2a7"
            : "#ffc788";

      context.beginPath();
      context.arc(
        x,
        y,
        0.28 +
          random() * 1.38,
        0,
        Math.PI * 2
      );
      context.fill();
    }
  }

  context.globalCompositeOperation =
    "source-over";

  context.strokeStyle =
    `rgba(17,10,20,${
      0.28 * opacity
    })`;
  context.lineWidth =
    Math.max(
      2,
      radius * 0.014
    );

  for (
    let arm = 0;
    arm < 4;
    arm += 1
  ) {
    context.beginPath();

    for (
      let index = 0;
      index <= 90;
      index += 1
    ) {
      const progress =
        index / 90;
      const angle =
        arm *
          Math.PI * 0.5 +
        progress *
          Math.PI * 4.05 +
        0.08;
      const radial =
        radius *
        (
          0.11 +
          0.84 * progress
        );
      const x =
        Math.cos(angle) *
        radial;
      const y =
        Math.sin(angle) *
        radial;

      if (index === 0) {
        context.moveTo(
          x,
          y
        );
      } else {
        context.lineTo(
          x,
          y
        );
      }
    }

    context.stroke();
  }

  context.globalAlpha = 1;
  context.restore();
}

function drawHuman(
  context: CanvasRenderingContext2D,
  timeS: number
): void {
  const pulse =
    1 +
    Math.sin(
      timeS * 1.5
    ) * 0.02;

  context.save();
  context.scale(
    pulse,
    pulse
  );
  context.strokeStyle =
    "rgba(133,224,255,0.15)";
  context.lineWidth = 1;

  for (
    let radius = 90;
    radius <= 360;
    radius += 90
  ) {
    context.beginPath();
    context.arc(
      0,
      0,
      radius,
      0,
      Math.PI * 2
    );
    context.stroke();
  }

  const bodyGradient =
    context.createLinearGradient(
      0,
      -190,
      0,
      210
    );

  bodyGradient.addColorStop(
    0,
    "#f5fbff"
  );
  bodyGradient.addColorStop(
    1,
    "#6ccaff"
  );

  context.fillStyle =
    bodyGradient;
  context.shadowColor =
    "rgba(109,211,255,0.35)";
  context.shadowBlur = 28;
  context.beginPath();
  context.arc(
    0,
    -150,
    37,
    0,
    Math.PI * 2
  );
  context.fill();
  context.beginPath();
  context.roundRect(
    -41,
    -108,
    82,
    165,
    34
  );
  context.fill();
  context.lineCap = "round";
  context.strokeStyle =
    "#dff6ff";
  context.lineWidth = 27;
  context.beginPath();
  context.moveTo(-30, -70);
  context.lineTo(-88, 42);
  context.moveTo(30, -70);
  context.lineTo(88, 42);
  context.moveTo(-22, 42);
  context.lineTo(-42, 185);
  context.moveTo(22, 42);
  context.lineTo(42, 185);
  context.stroke();
  context.restore();
}

function drawNearbyStars(
  context: CanvasRenderingContext2D,
  timeS: number,
  selectedId: string | null
): void {
  context.save();

  context.strokeStyle =
    "rgba(135,218,255,0.12)";
  context.lineWidth = 1;

  const rings = [
    {
      radius: 118,
      label: "~5 LY"
    },
    {
      radius: 226,
      label: "~10 LY"
    },
    {
      radius: 334,
      label: "~15 LY"
    }
  ];

  for (
    const ring of rings
  ) {
    context.beginPath();
    context.arc(
      0,
      0,
      ring.radius,
      0,
      Math.PI * 2
    );
    context.stroke();

    context.fillStyle =
      "rgba(174,224,255,0.38)";
    context.font =
      "9px ui-monospace, monospace";
    context.fillText(
      ring.label,
      ring.radius - 38,
      -8
    );
  }

  for (
    const star of NEARBY_STARS
  ) {
    const twinkle =
      1 +
      Math.sin(
        timeS * 1.7 +
        star.x * 0.01
      ) * 0.08;

    glowCircle(
      context,
      star.x,
      star.y,
      star.radius * twinkle,
      star.color,
      star.glow
    );

    if (
      selectedId === star.id
    ) {
      drawSelectionRing(
        context,
        star.x,
        star.y,
        star.radius * 3.5 + 12,
        timeS
      );
    }

    context.globalAlpha =
      selectedId === null ||
      selectedId === star.id
        ? 0.82
        : 0.42;
    context.fillStyle =
      "#e5f3ff";
    context.font =
      selectedId === star.id
        ? "600 11px ui-monospace, monospace"
        : "10px ui-monospace, monospace";
    context.fillText(
      star.label,
      star.x + 14,
      star.y - 10
    );
  }

  context.globalAlpha = 1;
  context.restore();
}

function drawMilkyWay(
  context: CanvasRenderingContext2D,
  timeS: number,
  selectedId: string | null,
  quality: number
): void {
  drawSpiralGalaxy(
    context,
    320,
    timeS * 0.009,
    1,
    33,
    0.7,
    quality
  );

  context.save();
  context.rotate(
    timeS * 0.009
  );

  const solarAngle = -0.9;
  const solarRadius = 166;
  const solarX =
    Math.cos(solarAngle) *
    solarRadius;
  const solarY =
    Math.sin(solarAngle) *
    solarRadius * 0.7;

  context.strokeStyle =
    "rgba(118,210,255,0.11)";
  context.lineWidth = 1;
  context.setLineDash([
    3,
    7
  ]);
  context.beginPath();
  context.ellipse(
    0,
    0,
    solarRadius,
    solarRadius * 0.7,
    0,
    0,
    Math.PI * 2
  );
  context.stroke();
  context.setLineDash([]);

  glowCircle(
    context,
    solarX,
    solarY,
    4.5,
    "#fff3a6",
    "rgba(90,196,255,0.12)"
  );

  context.fillStyle =
    "rgba(215,242,255,0.72)";
  context.font =
    "10px ui-monospace, monospace";
  context.fillText(
    "SUN · ORION SPUR",
    solarX + 12,
    solarY - 8
  );

  if (
    selectedId ===
    "solar-location"
  ) {
    drawSelectionRing(
      context,
      solarX,
      solarY,
      24,
      timeS
    );
  }

  if (
    selectedId ===
    "sagittarius-a"
  ) {
    drawSelectionRing(
      context,
      0,
      0,
      30,
      timeS
    );
  }

  if (
    selectedId ===
    "galactic-bulge"
  ) {
    drawSelectionRing(
      context,
      0,
      0,
      82,
      timeS
    );
  }

  if (
    selectedId ===
    "galactic-disk"
  ) {
    context.strokeStyle =
      "rgba(133,224,255,0.72)";
    context.lineWidth = 1.2;
    context.setLineDash([
      7,
      7
    ]);
    context.beginPath();
    context.ellipse(
      0,
      0,
      326,
      228,
      0,
      0,
      Math.PI * 2
    );
    context.stroke();
    context.setLineDash([]);
  }

  context.restore();
}

function drawLocalGroup(
  context: CanvasRenderingContext2D,
  timeS: number,
  selectedId: string | null,
  quality: number
): void {
  const galaxies = [
    {
      id: "milky-way",
      label: "MILKY WAY",
      x: -155,
      y: 34,
      radius: 118,
      rotation: timeS * 0.018,
      seed: 41,
      flatten: 0.72
    },
    {
      id: "andromeda",
      label: "ANDROMEDA · M31 · 2.5 MLY",
      x: 175,
      y: -92,
      radius: 154,
      rotation:
        -0.62 -
        timeS * 0.011,
      seed: 83,
      flatten: 0.5
    },
    {
      id: "triangulum",
      label: "TRIANGULUM · M33 · 2.7 MLY",
      x: 132,
      y: 164,
      radius: 70,
      rotation:
        0.9 +
        timeS * 0.014,
      seed: 121,
      flatten: 0.8
    }
  ] as const;

  context.save();

  context.strokeStyle =
    "rgba(130,212,255,0.1)";
  context.setLineDash([
    4,
    8
  ]);
  context.beginPath();
  context.moveTo(
    galaxies[0].x,
    galaxies[0].y
  );
  context.lineTo(
    galaxies[1].x,
    galaxies[1].y
  );
  context.lineTo(
    galaxies[2].x,
    galaxies[2].y
  );
  context.stroke();
  context.setLineDash([]);

  for (
    const galaxy of galaxies
  ) {
    context.save();
    context.translate(
      galaxy.x,
      galaxy.y
    );
    drawSpiralGalaxy(
      context,
      galaxy.radius,
      galaxy.rotation,
      selectedId === null ||
      selectedId === galaxy.id
        ? 0.94
        : 0.56,
      galaxy.seed,
      galaxy.flatten,
      quality * 0.8
    );
    context.restore();

    context.fillStyle =
      "rgba(220,242,255,0.72)";
    context.font =
      selectedId === galaxy.id
        ? "600 10px ui-monospace, monospace"
        : "9px ui-monospace, monospace";
    context.fillText(
      galaxy.label,
      galaxy.x -
        galaxy.radius * 0.55,
      galaxy.y -
        galaxy.radius * 0.58
    );

    if (
      selectedId === galaxy.id
    ) {
      drawSelectionRing(
        context,
        galaxy.x,
        galaxy.y,
        galaxy.radius * 0.72,
        timeS
      );
    }
  }

  const random =
    seededRandom(4_445);

  for (
    let index = 0;
    index < 24;
    index += 1
  ) {
    const angle =
      random() *
      Math.PI * 2;
    const radial =
      210 +
      random() * 190;
    const x =
      Math.cos(angle) *
      radial;
    const y =
      Math.sin(angle) *
      radial * 0.72;

    glowCircle(
      context,
      x,
      y,
      1.2 +
        random() * 2.4,
      "rgba(214,235,255,0.52)",
      "rgba(88,142,255,0.04)",
      selectedId ===
      "dwarf-population"
        ? 0.95
        : 0.42
    );
  }

  if (
    selectedId ===
    "dwarf-population"
  ) {
    context.strokeStyle =
      "rgba(133,224,255,0.48)";
    context.setLineDash([
      8,
      8
    ]);
    context.beginPath();
    context.ellipse(
      0,
      0,
      405,
      295,
      0,
      0,
      Math.PI * 2
    );
    context.stroke();
    context.setLineDash([]);
  }

  context.restore();
}

function drawCluster(
  context: CanvasRenderingContext2D,
  timeS: number,
  density: number,
  quality: number
): void {
  const random =
    seededRandom(7_131);

  const count =
    Math.max(
      12,
      Math.round(
        density * quality
      )
    );

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const angle =
      random() *
      Math.PI * 2;
    const radial =
      Math.pow(
        random(),
        0.7
      ) * 300;
    const x =
      Math.cos(angle) * radial;
    const y =
      Math.sin(angle) * radial * 0.64;

    context.save();
    context.translate(
      x,
      y
    );
    drawSpiralGalaxy(
      context,
      13 +
        random() * 24,
      random() *
        Math.PI * 2 +
        timeS * 0.004,
      0.26 +
        random() * 0.34,
      200 + index,
      0.45 +
        random() * 0.5,
      quality * 0.55
    );
    context.restore();
  }

  glowCircle(
    context,
    0,
    0,
    78,
    "rgba(190,220,255,0.06)",
    "rgba(95,143,255,0.04)",
    0.9
  );
}

function makeNetwork(
  seed: number,
  count: number,
  width: number,
  height: number
): readonly NetworkNode[] {
  const random =
    seededRandom(seed);

  return Object.freeze(
    Array.from(
      { length: count },
      () => ({
        x:
          (
            random() - 0.5
          ) * width,
        y:
          (
            random() - 0.5
          ) * height,
        weight:
          0.45 +
          random() * 1.55
      })
    )
  );
}

function drawNetwork(
  context: CanvasRenderingContext2D,
  nodes: readonly NetworkNode[],
  threshold: number,
  timeS: number,
  bright: boolean
): void {
  context.save();

  for (
    let firstIndex = 0;
    firstIndex < nodes.length;
    firstIndex += 1
  ) {
    const first =
      nodes[firstIndex]!;

    for (
      let secondIndex =
        firstIndex + 1;
      secondIndex < nodes.length;
      secondIndex += 1
    ) {
      const second =
        nodes[secondIndex]!;
      const distance =
        Math.hypot(
          first.x - second.x,
          first.y - second.y
        );

      if (
        distance > threshold
      ) {
        continue;
      }

      const alpha =
        (
          1 -
          distance / threshold
        ) *
        (
          bright
            ? 0.2
            : 0.1
        );

      context.strokeStyle =
        `rgba(118,201,255,${alpha})`;
      context.lineWidth =
        bright
          ? 1.15
          : 0.75;
      context.beginPath();
      context.moveTo(
        first.x,
        first.y
      );
      context.lineTo(
        second.x,
        second.y
      );
      context.stroke();
    }
  }

  for (
    let index = 0;
    index < nodes.length;
    index += 1
  ) {
    const node =
      nodes[index]!;
    const pulse =
      0.85 +
      0.15 *
      Math.sin(
        timeS * 0.8 +
        index
      );

    glowCircle(
      context,
      node.x,
      node.y,
      node.weight *
        (
          bright
            ? 3.2
            : 2.2
        ) *
        pulse,
      bright
        ? "rgba(220,245,255,0.86)"
        : "rgba(192,230,255,0.55)",
      "rgba(75,151,255,0.06)",
      0.75
    );
  }

  context.restore();
}

function drawObservableUniverse(
  context: CanvasRenderingContext2D,
  timeS: number,
  beyond: boolean
): void {
  const radius = 275;
  const nodes =
    makeNetwork(
      beyond
        ? 111
        : 93,
      64,
      750,
      620
    );

  context.save();
  context.beginPath();
  context.arc(
    0,
    0,
    radius,
    0,
    Math.PI * 2
  );

  if (!beyond) {
    context.clip();
  }

  drawNetwork(
    context,
    nodes,
    116,
    timeS,
    true
  );
  context.restore();

  context.save();
  context.setLineDash(
    beyond
      ? [10, 9]
      : []
  );
  context.strokeStyle =
    beyond
      ? "rgba(255,184,116,0.64)"
      : "rgba(160,225,255,0.52)";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(
    0,
    0,
    radius,
    0,
    Math.PI * 2
  );
  context.stroke();
  context.setLineDash([]);

  const ring =
    context.createRadialGradient(
      0,
      0,
      radius * 0.72,
      0,
      0,
      radius * 1.18
    );

  ring.addColorStop(
    0,
    "rgba(0,0,0,0)"
  );
  ring.addColorStop(
    0.75,
    beyond
      ? "rgba(255,132,72,0.025)"
      : "rgba(110,200,255,0.035)"
  );
  ring.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );

  context.fillStyle = ring;
  context.beginPath();
  context.arc(
    0,
    0,
    radius * 1.2,
    0,
    Math.PI * 2
  );
  context.fill();
  context.restore();
}

function drawInfinity(
  context: CanvasRenderingContext2D,
  timeS: number
): void {
  context.save();
  context.globalCompositeOperation =
    "lighter";

  for (
    let ringIndex = 0;
    ringIndex < 16;
    ringIndex += 1
  ) {
    const progress =
      (
        ringIndex / 16 +
        timeS * 0.035
      ) % 1;
    const radius =
      28 +
      progress * 420;

    context.strokeStyle =
      `rgba(126,214,255,${
        0.025 +
        (1 - progress) * 0.16
      })`;
    context.lineWidth =
      0.8 +
      (1 - progress) * 1.2;
    context.beginPath();
    context.ellipse(
      0,
      0,
      radius,
      radius * 0.42,
      timeS * 0.015,
      0,
      Math.PI * 2
    );
    context.stroke();
  }

  drawNetwork(
    context,
    makeNetwork(
      777,
      78,
      780,
      580
    ),
    105,
    timeS,
    false
  );

  context.globalCompositeOperation =
    "source-over";
  context.restore();
}

function drawStage(
  context: CanvasRenderingContext2D,
  stageId: CosmicScaleId,
  timeS: number,
  selectedObjectId: string | null,
  quality: number
): void {
  switch (stageId) {
    case "human":
      drawHuman(
        context,
        timeS
      );
      break;

    case "nearby-stars":
      drawNearbyStars(
        context,
        timeS,
        selectedObjectId
      );
      break;

    case "milky-way":
      drawMilkyWay(
        context,
        timeS,
        selectedObjectId,
        quality
      );
      break;

    case "local-group":
      drawLocalGroup(
        context,
        timeS,
        selectedObjectId,
        quality
      );
      break;

    case "clusters":
      drawCluster(
        context,
        timeS,
        28,
        quality
      );
      break;

    case "superclusters":
      drawNetwork(
        context,
        makeNetwork(
          651,
          34,
          720,
          520
        ),
        165,
        timeS,
        false
      );
      break;

    case "cosmic-web":
      drawNetwork(
        context,
        makeNetwork(
          1_927,
          76,
          820,
          620
        ),
        125,
        timeS,
        true
      );
      break;

    case "observable-universe":
      drawObservableUniverse(
        context,
        timeS,
        false
      );
      break;

    case "beyond":
      drawObservableUniverse(
        context,
        timeS,
        true
      );
      break;

    case "infinity":
      drawInfinity(
        context,
        timeS
      );
      break;

    case "earth":
    case "moon":
    case "solar-system":
      drawNearbyStars(
        context,
        timeS,
        null
      );
      break;
  }
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

function selectedDeepDiveObject(
  objects: readonly ScaleDeepDiveObject[],
  selectedObjectId: string
): ScaleDeepDiveObject {
  return (
    objects.find(
      object =>
        object.id ===
        selectedObjectId
    ) ??
    objects[0]!
  );
}

function CosmicScaleExplorer({
  stageId
}: CosmicScaleExplorerProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const viewRef =
    useRef<ViewState>({
      zoom: 1,
      panX: 0,
      panY: 0
    });

  const targetViewRef =
    useRef<ViewState>({
      zoom: 1,
      panX: 0,
      panY: 0
    });

  const deepDive =
    deepDiveForStage(
      stageId
    );

  const [
    zoomPercent,
    setZoomPercent
  ] =
    useState(100);

  const [
    selectedObjectId,
    setSelectedObjectId
  ] =
    useState<string>(
      () =>
        deepDive
          ?.defaultObjectId ??
        ""
    );

  const stage =
    stageFromId(stageId);

  const selectedObject =
    deepDive === null
      ? null
      : selectedDeepDiveObject(
          deepDive.objects,
          selectedObjectId
        );

  function updateZoom(
    multiplier: number
  ): void {
    const target =
      targetViewRef.current;
    const zoom =
      clamp(
        target.zoom * multiplier,
        MIN_ZOOM,
        MAX_ZOOM
      );

    targetViewRef.current = {
      ...target,
      zoom
    };

    setZoomPercent(
      Math.round(
        zoom * 100
      )
    );
  }

  function resetView():
    void {
    targetViewRef.current = {
      zoom: 1,
      panX: 0,
      panY: 0
    };
    setZoomPercent(100);
  }

  useEffect(
    () => {
      resetView();

      const nextDeepDive =
        deepDiveForStage(
          stageId
        );

      setSelectedObjectId(
        nextDeepDive
          ?.defaultObjectId ??
        ""
      );
    },
    [stageId]
  );

  useEffect(
    () => {
      const canvas =
        canvasRef.current;

      if (canvas === null) {
        return;
      }

      const context =
        canvas.getContext("2d");

      if (context === null) {
        return;
      }

      const pointers =
        new Map<number, PointerPoint>();

      const backgroundStars =
        makeStarfield(
          hashText(stageId),
          210
        );

      let previousSingle:
        PointerPoint | null =
          null;
      let previousPinch:
        number | null = null;
      let frame = 0;
      let disposed = false;

      const resize =
        (): void => {
          const bounds =
            canvas.getBoundingClientRect();
          const mobile =
            bounds.width <= 720;
          const pixelRatio =
            Math.min(
              window.devicePixelRatio || 1,
              mobile
                ? 1.45
                : 2
            );

          canvas.width =
            Math.max(
              1,
              Math.round(
                bounds.width *
                pixelRatio
              )
            );
          canvas.height =
            Math.max(
              1,
              Math.round(
                bounds.height *
                pixelRatio
              )
            );
        };

      const observer =
        new ResizeObserver(
          resize
        );

      resize();
      observer.observe(canvas);

      const handleWheel = (
        event: WheelEvent
      ): void => {
        event.preventDefault();
        updateZoom(
          Math.exp(
            -event.deltaY *
            0.0014
          )
        );
      };

      const handlePointerDown = (
        event: PointerEvent
      ): void => {
        canvas.setPointerCapture(
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
          const target =
            targetViewRef.current;

          target.panX =
            clamp(
              target.panX +
                next.x -
                previousSingle.x,
              -420,
              420
            );
          target.panY =
            clamp(
              target.panY +
                next.y -
                previousSingle.y,
              -300,
              300
            );

          previousSingle = next;
          return;
        }

        if (
          pointers.size >= 2
        ) {
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
            updateZoom(
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
          canvas.hasPointerCapture(
            event.pointerId
          )
        ) {
          canvas.releasePointerCapture(
            event.pointerId
          );
        }

        previousSingle =
          pointers.size === 1
            ? Array.from(
                pointers.values()
              )[0] ?? null
            : null;

        if (
          pointers.size < 2
        ) {
          previousPinch = null;
        }
      };

      canvas.addEventListener(
        "wheel",
        handleWheel,
        {
          passive: false
        }
      );
      canvas.addEventListener(
        "pointerdown",
        handlePointerDown
      );
      canvas.addEventListener(
        "pointermove",
        handlePointerMove
      );
      canvas.addEventListener(
        "pointerup",
        releasePointer
      );
      canvas.addEventListener(
        "pointercancel",
        releasePointer
      );

      const started =
        performance.now();

      const draw = (
        now: number
      ): void => {
        if (disposed) {
          return;
        }

        const bounds =
          canvas.getBoundingClientRect();
        const width =
          Math.max(
            1,
            bounds.width
          );
        const height =
          Math.max(
            1,
            bounds.height
          );
        const timeS =
          (
            now - started
          ) /
          1_000;
        const target =
          targetViewRef.current;

        viewRef.current.zoom +=
          (
            target.zoom -
            viewRef.current.zoom
          ) * 0.1;
        viewRef.current.panX +=
          (
            target.panX -
            viewRef.current.panX
          ) * 0.11;
        viewRef.current.panY +=
          (
            target.panY -
            viewRef.current.panY
          ) * 0.11;

        context.setTransform(
          1,
          0,
          0,
          1,
          0,
          0
        );

        const actualScaleX =
          canvas.width / width;
        const actualScaleY =
          canvas.height / height;

        context.scale(
          actualScaleX,
          actualScaleY
        );

        drawBackgroundStars(
          context,
          width,
          height,
          backgroundStars,
          timeS
        );

        context.save();
        context.translate(
          width * 0.5 +
            viewRef.current.panX,
          height * 0.5 +
            viewRef.current.panY
        );
        context.scale(
          viewRef.current.zoom,
          viewRef.current.zoom
        );

        const fitScale =
          Math.min(
            width / 980,
            height / 760
          );

        context.scale(
          fitScale,
          fitScale
        );

        drawStage(
          context,
          stageId,
          timeS,
          selectedObjectId || null,
          width <= 720
            ? 0.62
            : 1
        );
        context.restore();

        frame =
          requestAnimationFrame(
            draw
          );
      };

      frame =
        requestAnimationFrame(
          draw
        );

      return () => {
        disposed = true;
        cancelAnimationFrame(frame);
        observer.disconnect();
        canvas.removeEventListener(
          "wheel",
          handleWheel
        );
        canvas.removeEventListener(
          "pointerdown",
          handlePointerDown
        );
        canvas.removeEventListener(
          "pointermove",
          handlePointerMove
        );
        canvas.removeEventListener(
          "pointerup",
          releasePointer
        );
        canvas.removeEventListener(
          "pointercancel",
          releasePointer
        );
      };
    },
    [
      stageId,
      selectedObjectId
    ]
  );

  return (
    <main className="cse-shell">
      <canvas
        ref={canvasRef}
        className="cse-canvas"
        aria-label={`${stage.title} interactive cosmic scale visualization`}
      />

      <header className="cse-header">
        <strong>
          COSMOS∞
        </strong>

        <span>
          SCALE ENGINE · {stage.scaleLabel}
        </span>
      </header>

      {deepDive !== null &&
        selectedObject !== null && (
        <aside className="cse-deep-dive">
          <div
            className="cse-object-tabs"
            role="tablist"
            aria-label={`${stage.title} observed landmarks`}
          >
            {deepDive.objects.map(
              object => (
                <button
                  key={object.id}
                  type="button"
                  role="tab"
                  aria-selected={
                    selectedObject.id ===
                    object.id
                  }
                  className={
                    selectedObject.id ===
                    object.id
                      ? "is-active"
                      : ""
                  }
                  onClick={
                    () =>
                      setSelectedObjectId(
                        object.id
                      )
                  }
                >
                  {object.name}
                </button>
              )
            )}
          </div>

          <section className="cse-object-card">
            <span>
              {selectedObject.category}
            </span>

            <h2>
              {selectedObject.name}
            </h2>

            <p>
              {selectedObject.summary}
            </p>

            <dl>
              {selectedObject.facts.map(
                fact => (
                  <div
                    key={fact.label}
                  >
                    <dt>
                      {fact.label}
                    </dt>
                    <dd>
                      {fact.value}
                    </dd>
                  </div>
                )
              )}
            </dl>

            <small>
              SOURCE · {selectedObject.source}
            </small>
          </section>
        </aside>
      )}

      <aside className="cse-info">
        <span className="cse-kicker">
          {stage.scienceStatus}
        </span>

        <h1>
          {stage.title}
        </h1>

        <p>
          {stage.subtitle}
        </p>

        <div className="cse-scale-readout">
          {stage.scaleLabel}
        </div>

        <small>
          {stage.visualNote}
        </small>
      </aside>

      <nav
        className="cse-camera"
        aria-label="Scale visualization camera"
      >
        <button
          type="button"
          onClick={
            () =>
              updateZoom(0.78)
          }
          aria-label="Zoom out"
        >
          −
        </button>

        <span>
          {zoomPercent}%
        </span>

        <button
          type="button"
          onClick={
            () =>
              updateZoom(1.28)
          }
          aria-label="Zoom in"
        >
          +
        </button>

        <button
          type="button"
          className="cse-reset"
          onClick={
            resetView
          }
        >
          RESET
        </button>
      </nav>

      <div className="cse-interaction-note">
        WHEEL / PINCH TO ZOOM · DRAG TO PAN
      </div>
    </main>
  );
}

export default CosmicScaleExplorer;
