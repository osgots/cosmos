import {
  useEffect,
  useRef,
  useState
} from "react";

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
        subtitle: "Begin from the scale your senses know directly.",
        scaleLabel: "ORDER OF METRES",
        scienceStatus: "REFERENCE SCALE",
        visualNote:
          "Representative human-scale reference. The figure is illustrative, not a biological model."
      },
      {
        id: "earth",
        title: "Earth",
        subtitle: "Our planetary reference frame.",
        scaleLabel: "PLANETARY SCALE",
        scienceStatus: "OBSERVED",
        visualNote:
          "Rendered through the live Solar System engine using physical astronomy values and a visualization layer."
      },
      {
        id: "moon",
        title: "Moon",
        subtitle: "Earth's natural satellite and our nearest large celestial neighbour.",
        scaleLabel: "EARTH–MOON SCALE",
        scienceStatus: "OBSERVED",
        visualNote:
          "Rendered through the live Solar System engine. Explore and true-scale modes remain explicitly separated."
      },
      {
        id: "solar-system",
        title: "Solar System",
        subtitle: "From the Sun through the eight planets to the outer planetary frontier.",
        scaleLabel: "TENS OF AU",
        scienceStatus: "ESTABLISHED MODEL",
        visualNote:
          "Current motion uses circularized reference orbits and labelled visual phase offsets, not a current ephemeris."
      },
      {
        id: "nearby-stars",
        title: "Nearby Stars",
        subtitle: "Leave the heliosphere and enter the local stellar neighbourhood.",
        scaleLabel: "LIGHT-YEARS",
        scienceStatus: "OBSERVED",
        visualNote:
          "A schematic local stellar map. Relative layout is designed for exploration rather than claimed as an astrometric reconstruction."
      },
      {
        id: "milky-way",
        title: "Milky Way",
        subtitle: "Our barred spiral galaxy, seen as a structured stellar system rather than a flat icon.",
        scaleLabel: "~100,000 LIGHT-YEARS",
        scienceStatus: "ESTABLISHED MODEL",
        visualNote:
          "Procedural spiral structure visualizes large-scale morphology. Individual generated stars are not catalogue claims."
      },
      {
        id: "local-group",
        title: "Local Group",
        subtitle: "The gravitational neighbourhood containing the Milky Way, Andromeda and many smaller galaxies.",
        scaleLabel: "MILLIONS OF LIGHT-YEARS",
        scienceStatus: "ESTABLISHED MODEL",
        visualNote:
          "Membership and hierarchy are scientifically motivated; the visual spacing is compressed for readability."
      },
      {
        id: "clusters",
        title: "Galaxy Clusters",
        subtitle: "Hundreds to thousands of galaxies bound inside deep gravitational environments.",
        scaleLabel: "TENS OF MILLIONS OF LIGHT-YEARS",
        scienceStatus: "ESTABLISHED MODEL",
        visualNote:
          "The scene is a representative cluster visualization, not a labelled map of one observed cluster."
      },
      {
        id: "superclusters",
        title: "Superclusters",
        subtitle: "Cluster complexes extending across hundreds of millions of light-years.",
        scaleLabel: "HUNDREDS OF MILLIONS OF LIGHT-YEARS",
        scienceStatus: "ESTABLISHED MODEL",
        visualNote:
          "The rendered network communicates hierarchy and connectivity, not literal present-day object coordinates."
      },
      {
        id: "cosmic-web",
        title: "Cosmic Web",
        subtitle: "Filaments, nodes, sheets and immense voids emerging from large-scale structure formation.",
        scaleLabel: "BILLIONS OF LIGHT-YEARS",
        scienceStatus: "ESTABLISHED MODEL",
        visualNote:
          "Procedural filaments are an explanatory visualization of cosmic-web morphology, not observed galaxy positions."
      },
      {
        id: "observable-universe",
        title: "Observable Universe",
        subtitle: "The region from which signals can have reached us during cosmic history.",
        scaleLabel: "COSMOLOGICAL HORIZON",
        scienceStatus: "ESTABLISHED MODEL",
        visualNote:
          "The horizon surface is conceptual. It is not a physical wall or shell surrounding Earth."
      },
      {
        id: "beyond",
        title: "Beyond the Horizon",
        subtitle: "Continue past observation only where the assumptions are made explicit.",
        scaleLabel: "BEYOND DIRECT OBSERVATION",
        scienceStatus: "PHYSICS-CONSTRAINED EXTRAPOLATION",
        visualNote:
          "Generated structure beyond the horizon is never presented as observed. The boundary marks an epistemic limit, not an edge of space."
      },
      {
        id: "infinity",
        title: "∞",
        subtitle: "Exploration continues without pretending that cosmology has measured a final spatial edge.",
        scaleLabel: "NO VISUAL FINAL SCREEN",
        scienceStatus: "THEORETICAL CONTINUATION",
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

const MIN_ZOOM = 0.58;
const MAX_ZOOM = 7.5;

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

    result ^= result +
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
  context.fillStyle = "#00030a";
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
      0.18 +
      0.42 *
      (
        0.5 +
        0.5 *
        Math.sin(
          timeS * 0.7 +
          point.phase
        )
      );

    context.globalAlpha = alpha;
    context.fillStyle = "#dff5ff";
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
      radius * 2.8
    );

  gradient.addColorStop(
    0,
    core
  );
  gradient.addColorStop(
    0.18,
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
    radius * 2.8,
    0,
    Math.PI * 2
  );
  context.fill();
  context.restore();
}

function drawSpiralGalaxy(
  context: CanvasRenderingContext2D,
  radius: number,
  rotation: number,
  opacity: number,
  seed: number,
  flatten = 0.72
): void {
  const random =
    seededRandom(seed);

  context.save();
  context.rotate(rotation);
  context.scale(1, flatten);
  context.globalCompositeOperation = "lighter";

  glowCircle(
    context,
    0,
    0,
    radius * 0.13,
    "rgba(255,245,220,0.96)",
    "rgba(255,171,95,0.18)",
    opacity
  );

  const arms = 4;
  const starsPerArm = 330;

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
          Math.PI * 3.6 +
        (
          random() - 0.5
        ) * 0.36;

      const radial =
        radius *
        (
          0.08 +
          0.92 * progress
        ) *
        (
          0.9 +
          random() * 0.2
        );

      const x =
        Math.cos(angle) *
        radial;

      const y =
        Math.sin(angle) *
        radial;

      const cool =
        progress > 0.55;

      context.globalAlpha =
        opacity *
        (
          0.12 +
          random() * 0.5
        );

      context.fillStyle =
        cool
          ? "#b7d9ff"
          : "#ffe0aa";

      context.beginPath();
      context.arc(
        x,
        y,
        0.35 +
          random() * 1.35,
        0,
        Math.PI * 2
      );
      context.fill();
    }
  }

  context.globalCompositeOperation =
    "source-over";
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
  context.moveTo(
    -30,
    -70
  );
  context.lineTo(
    -88,
    42
  );
  context.moveTo(
    30,
    -70
  );
  context.lineTo(
    88,
    42
  );
  context.moveTo(
    -22,
    42
  );
  context.lineTo(
    -42,
    185
  );
  context.moveTo(
    22,
    42
  );
  context.lineTo(
    42,
    185
  );
  context.stroke();

  context.shadowBlur = 0;
  context.restore();
}

function drawNearbyStars(
  context: CanvasRenderingContext2D,
  timeS: number
): void {
  const stars = [
    {
      name: "SUN",
      x: 0,
      y: 0,
      radius: 9,
      color: "#fff0ad"
    },
    {
      name: "α CENTAURI",
      x: -180,
      y: -72,
      radius: 7,
      color: "#ffe5a0"
    },
    {
      name: "BARNARD'S STAR",
      x: 118,
      y: 78,
      radius: 5,
      color: "#ff9876"
    },
    {
      name: "SIRIUS",
      x: 245,
      y: -126,
      radius: 8,
      color: "#dcecff"
    },
    {
      name: "PROCYON",
      x: -260,
      y: 138,
      radius: 6,
      color: "#fff2c7"
    }
  ] as const;

  context.save();
  context.strokeStyle =
    "rgba(135,218,255,0.11)";
  context.lineWidth = 1;

  for (
    let radius = 110;
    radius <= 330;
    radius += 110
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

  for (
    const star of stars
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
      "rgba(116,196,255,0.12)"
    );

    context.globalAlpha = 0.66;
    context.fillStyle = "#dcecff";
    context.font =
      "11px ui-monospace, monospace";
    context.fillText(
      star.name,
      star.x + 14,
      star.y - 10
    );
  }

  context.globalAlpha = 1;
  context.restore();
}

function drawLocalGroup(
  context: CanvasRenderingContext2D,
  timeS: number
): void {
  context.save();

  context.translate(
    -125,
    30
  );
  drawSpiralGalaxy(
    context,
    120,
    timeS * 0.025,
    0.92,
    41
  );

  context.translate(
    310,
    -120
  );
  drawSpiralGalaxy(
    context,
    155,
    -0.65 -
      timeS * 0.015,
    0.88,
    83,
    0.56
  );

  context.translate(
    -35,
    245
  );
  drawSpiralGalaxy(
    context,
    66,
    0.9 +
      timeS * 0.02,
    0.7,
    121,
    0.82
  );

  context.restore();
}

function drawCluster(
  context: CanvasRenderingContext2D,
  timeS: number,
  density = 22
): void {
  const random =
    seededRandom(7_131);

  for (
    let index = 0;
    index < density;
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
        random() * 0.5
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

interface NetworkNode {
  readonly x: number;
  readonly y: number;
  readonly weight: number;
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

      const dx =
        first.x - second.x;
      const dy =
        first.y - second.y;
      const distance =
        Math.hypot(
          dx,
          dy
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

  const network =
    makeNetwork(
      777,
      78,
      780,
      580
    );

  drawNetwork(
    context,
    network,
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
  timeS: number
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
        timeS
      );
      break;

    case "milky-way":
      drawSpiralGalaxy(
        context,
        315,
        timeS * 0.012,
        1,
        33
      );
      break;

    case "local-group":
      drawLocalGroup(
        context,
        timeS
      );
      break;

    case "clusters":
      drawCluster(
        context,
        timeS,
        28
      );
      break;

    case "superclusters": {
      const nodes =
        makeNetwork(
          651,
          34,
          720,
          520
        );

      drawNetwork(
        context,
        nodes,
        165,
        timeS,
        false
      );
      break;
    }

    case "cosmic-web": {
      const nodes =
        makeNetwork(
          1_927,
          76,
          820,
          620
        );

      drawNetwork(
        context,
        nodes,
        125,
        timeS,
        true
      );
      break;
    }

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
        timeS
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

  const [
    zoomPercent,
    setZoomPercent
  ] =
    useState(100);

  const stage =
    stageFromId(stageId);

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
          190
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
                ? 1.5
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

          context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
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

          target.panX +=
            next.x -
            previousSingle.x;

          target.panY +=
            next.y -
            previousSingle.y;

          target.panX =
            clamp(
              target.panX,
              -360,
              360
            );

          target.panY =
            clamp(
              target.panY,
              -260,
              260
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

        if (
          pointers.size === 1
        ) {
          previousSingle =
            Array.from(
              pointers.values()
            )[0] ?? null;
        } else {
          previousSingle = null;
        }

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
          timeS
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
    [stageId]
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
