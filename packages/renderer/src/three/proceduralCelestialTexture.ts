import {
  CanvasTexture,
  SRGBColorSpace
} from "three/webgpu";

import type {
  UniverseSurfacePreset
} from "../universeTypes";

const WIDTH = 1_024;
const HEIGHT = 512;

type LonLat =
  readonly [
    longitude: number,
    latitude: number
  ];

function mulberry32(
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

function requireContext(
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D {
  const context =
    canvas.getContext("2d");

  if (context === null) {
    throw new Error(
      "COSMOS could not create a 2D canvas context for procedural celestial textures."
    );
  }

  return context;
}

function projectLonLat(
  point: LonLat
): readonly [number, number] {
  return [
    (
      point[0] +
      180
    ) /
      360 *
      WIDTH,
    (
      90 -
      point[1]
    ) /
      180 *
      HEIGHT
  ];
}

function paintPolygon(
  context: CanvasRenderingContext2D,
  points: readonly LonLat[],
  fill: string,
  stroke?: string
): void {
  if (points.length < 3) {
    return;
  }

  const first =
    projectLonLat(
      points[0]!
    );

  context.beginPath();
  context.moveTo(
    first[0],
    first[1]
  );

  for (
    let index = 1;
    index < points.length;
    index += 1
  ) {
    const point =
      projectLonLat(
        points[index]!
      );

    context.lineTo(
      point[0],
      point[1]
    );
  }

  context.closePath();
  context.fillStyle = fill;
  context.fill();

  if (stroke !== undefined) {
    context.strokeStyle = stroke;
    context.lineWidth = 1.2;
    context.stroke();
  }
}

function addFineNoise(
  context: CanvasRenderingContext2D,
  random: () => number,
  count: number,
  light: string,
  dark: string,
  maximumAlpha: number
): void {
  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const size =
      0.8 +
      random() * 3.4;

    context.globalAlpha =
      maximumAlpha *
      (
        0.25 +
        random() * 0.75
      );

    context.fillStyle =
      random() > 0.5
        ? light
        : dark;

    context.beginPath();
    context.arc(
      random() * WIDTH,
      random() * HEIGHT,
      size,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  context.globalAlpha = 1;
}

function paintRockyWorld(
  context: CanvasRenderingContext2D,
  random: () => number,
  base: string,
  light: string,
  dark: string,
  craterCount: number
): void {
  const gradient =
    context.createLinearGradient(
      0,
      0,
      0,
      HEIGHT
    );

  gradient.addColorStop(
    0,
    light
  );
  gradient.addColorStop(
    0.45,
    base
  );
  gradient.addColorStop(
    1,
    dark
  );

  context.fillStyle = gradient;
  context.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT
  );

  addFineNoise(
    context,
    random,
    5_000,
    light,
    dark,
    0.18
  );

  for (
    let index = 0;
    index < craterCount;
    index += 1
  ) {
    const radius =
      2 +
      random() * 22;

    const x =
      random() * WIDTH;

    const y =
      random() * HEIGHT;

    context.globalAlpha =
      0.08 +
      random() * 0.14;

    context.fillStyle = dark;
    context.beginPath();
    context.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );
    context.fill();

    context.globalAlpha = 0.12;
    context.strokeStyle = light;
    context.lineWidth =
      Math.max(
        1,
        radius * 0.12
      );
    context.beginPath();
    context.arc(
      x - radius * 0.12,
      y - radius * 0.12,
      radius * 0.82,
      Math.PI * 0.9,
      Math.PI * 1.9
    );
    context.stroke();
  }

  context.globalAlpha = 1;
}

function paintEarth(
  context: CanvasRenderingContext2D,
  random: () => number
): void {
  const ocean =
    context.createLinearGradient(
      0,
      0,
      0,
      HEIGHT
    );

  ocean.addColorStop(
    0,
    "#1a5d91"
  );
  ocean.addColorStop(
    0.45,
    "#0b3d73"
  );
  ocean.addColorStop(
    1,
    "#061b42"
  );

  context.fillStyle = ocean;
  context.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT
  );

  const landStroke =
    "rgba(195,205,142,0.45)";

  paintPolygon(
    context,
    [
      [-168, 70],
      [-145, 66],
      [-125, 52],
      [-117, 33],
      [-102, 23],
      [-86, 20],
      [-80, 30],
      [-67, 45],
      [-77, 57],
      [-102, 72],
      [-138, 72]
    ],
    "#607b46",
    landStroke
  );

  paintPolygon(
    context,
    [
      [-82, 13],
      [-70, 8],
      [-61, -7],
      [-53, -19],
      [-58, -38],
      [-69, -55],
      [-76, -42],
      [-80, -20]
    ],
    "#6d7f43",
    landStroke
  );

  paintPolygon(
    context,
    [
      [-18, 36],
      [5, 37],
      [25, 32],
      [40, 15],
      [51, 8],
      [43, -11],
      [31, -30],
      [17, -35],
      [4, -27],
      [-10, -5]
    ],
    "#777b41",
    landStroke
  );

  paintPolygon(
    context,
    [
      [-10, 38],
      [7, 55],
      [30, 68],
      [65, 72],
      [95, 66],
      [130, 54],
      [151, 48],
      [145, 28],
      [121, 20],
      [103, 6],
      [78, 9],
      [59, 25],
      [42, 35],
      [25, 42],
      [8, 42]
    ],
    "#6c7d48",
    landStroke
  );

  paintPolygon(
    context,
    [
      [112, -11],
      [131, -10],
      [153, -24],
      [146, -39],
      [125, -42],
      [113, -28]
    ],
    "#8a7948",
    landStroke
  );

  paintPolygon(
    context,
    [
      [-52, 60],
      [-42, 75],
      [-20, 82],
      [-18, 68],
      [-32, 58]
    ],
    "#d4e3dc",
    "rgba(255,255,255,0.5)"
  );

  context.globalAlpha = 0.34;
  context.fillStyle = "#a99056";

  for (
    let patch = 0;
    patch < 190;
    patch += 1
  ) {
    context.beginPath();
    context.ellipse(
      random() * WIDTH,
      55 +
      random() *
      (
        HEIGHT -
        110
      ),
      2 +
      random() * 14,
      1 +
      random() * 6,
      random() * Math.PI,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  context.globalAlpha = 0.88;
  context.fillStyle = "#f4fbff";
  context.fillRect(
    0,
    0,
    WIDTH,
    20
  );
  context.fillRect(
    0,
    HEIGHT - 22,
    WIDTH,
    22
  );

  context.globalAlpha = 0.22;
  context.strokeStyle = "#ffffff";

  for (
    let cloud = 0;
    cloud < 120;
    cloud += 1
  ) {
    const y =
      32 +
      random() *
      (
        HEIGHT -
        64
      );

    const x =
      random() * WIDTH;

    context.lineWidth =
      1.2 +
      random() * 3.5;

    context.beginPath();
    context.ellipse(
      x,
      y,
      12 +
      random() * 68,
      1.5 +
      random() * 6,
      (
        random() -
        0.5
      ) * 0.45,
      0,
      Math.PI * 2
    );
    context.stroke();
  }

  context.globalAlpha = 1;
}

function paintMars(
  context: CanvasRenderingContext2D,
  random: () => number
): void {
  paintRockyWorld(
    context,
    random,
    "#a84f2c",
    "#dc8252",
    "#4e241a",
    72
  );

  context.globalAlpha = 0.3;
  context.fillStyle = "#4a261d";

  for (
    let region = 0;
    region < 38;
    region += 1
  ) {
    context.beginPath();
    context.ellipse(
      random() * WIDTH,
      55 +
      random() *
      (
        HEIGHT -
        110
      ),
      18 +
      random() * 72,
      4 +
      random() * 22,
      (
        random() -
        0.5
      ) * 0.8,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  context.globalAlpha = 0.72;
  context.fillStyle = "#e4d8c5";
  context.fillRect(
    0,
    0,
    WIDTH,
    10
  );
  context.fillRect(
    0,
    HEIGHT - 8,
    WIDTH,
    8
  );

  context.globalAlpha = 1;
}

function paintVenus(
  context: CanvasRenderingContext2D,
  random: () => number
): void {
  context.fillStyle = "#c58c42";
  context.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT
  );

  const colors = [
    "#e9c881",
    "#d7aa5d",
    "#f2db9a",
    "#b97b35",
    "#fff0bf"
  ];

  for (
    let band = 0;
    band < 118;
    band += 1
  ) {
    const y =
      random() * HEIGHT;

    const amplitude =
      3 +
      random() * 12;

    context.strokeStyle =
      colors[
        Math.floor(
          random() *
          colors.length
        )
      ]!;

    context.globalAlpha =
      0.16 +
      random() * 0.25;

    context.lineWidth =
      2 +
      random() * 8;

    context.beginPath();

    for (
      let x = -20;
      x <= WIDTH + 20;
      x += 14
    ) {
      const waveY =
        y +
        Math.sin(
          x * 0.018 +
          random() * 0.4
        ) *
        amplitude;

      if (x === -20) {
        context.moveTo(
          x,
          waveY
        );
      } else {
        context.lineTo(
          x,
          waveY
        );
      }
    }

    context.stroke();
  }

  context.globalAlpha = 1;
}

function paintGasGiant(
  context: CanvasRenderingContext2D,
  random: () => number,
  palette: readonly string[],
  spot: boolean
): void {
  let y = 0;
  let band = 0;

  while (y < HEIGHT) {
    const bandHeight =
      7 +
      random() * 26;

    context.fillStyle =
      palette[
        band %
        palette.length
      ]!;

    context.globalAlpha =
      0.78 +
      random() * 0.22;

    context.fillRect(
      0,
      y,
      WIDTH,
      bandHeight + 1
    );

    context.globalAlpha = 0.14;
    context.fillStyle = "#ffffff";

    for (
      let streak = 0;
      streak < 32;
      streak += 1
    ) {
      context.fillRect(
        random() * WIDTH,
        y +
        random() * bandHeight,
        12 +
        random() * 115,
        Math.max(
          1,
          random() * 2.4
        )
      );
    }

    y += bandHeight;
    band += 1;
  }

  if (spot) {
    context.globalAlpha = 0.92;
    context.fillStyle = "#9f4934";
    context.beginPath();
    context.ellipse(
      WIDTH * 0.72,
      HEIGHT * 0.61,
      76,
      30,
      -0.08,
      0,
      Math.PI * 2
    );
    context.fill();

    context.globalAlpha = 0.28;
    context.strokeStyle = "#f0b98f";
    context.lineWidth = 6;
    context.stroke();

    context.globalAlpha = 0.22;
    context.strokeStyle = "#7a3429";
    context.lineWidth = 3;
    context.beginPath();
    context.ellipse(
      WIDTH * 0.72,
      HEIGHT * 0.61,
      55,
      18,
      -0.08,
      0,
      Math.PI * 2
    );
    context.stroke();
  }

  context.globalAlpha = 1;
}

function paintIceGiant(
  context: CanvasRenderingContext2D,
  random: () => number,
  top: string,
  bottom: string,
  accent: string
): void {
  const gradient =
    context.createLinearGradient(
      0,
      0,
      0,
      HEIGHT
    );

  gradient.addColorStop(
    0,
    top
  );
  gradient.addColorStop(
    1,
    bottom
  );

  context.fillStyle = gradient;
  context.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT
  );

  context.globalAlpha = 0.1;
  context.strokeStyle = accent;

  for (
    let band = 0;
    band < 54;
    band += 1
  ) {
    const y =
      random() * HEIGHT;

    context.lineWidth =
      1 +
      random() * 4;

    context.beginPath();
    context.moveTo(
      0,
      y
    );
    context.bezierCurveTo(
      WIDTH * 0.33,
      y +
      (
        random() -
        0.5
      ) * 10,
      WIDTH * 0.66,
      y +
      (
        random() -
        0.5
      ) * 10,
      WIDTH,
      y
    );
    context.stroke();
  }

  context.globalAlpha = 1;
}

function paintSun(
  context: CanvasRenderingContext2D,
  random: () => number
): void {
  const gradient =
    context.createLinearGradient(
      0,
      0,
      0,
      HEIGHT
    );

  gradient.addColorStop(
    0,
    "#fff3aa"
  );
  gradient.addColorStop(
    0.42,
    "#ffc13a"
  );
  gradient.addColorStop(
    0.72,
    "#ff8a16"
  );
  gradient.addColorStop(
    1,
    "#d94809"
  );

  context.fillStyle = gradient;
  context.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT
  );

  addFineNoise(
    context,
    random,
    11_500,
    "#fff9cf",
    "#c94308",
    0.3
  );

  context.globalAlpha = 0.3;
  context.fillStyle = "#722208";

  for (
    let index = 0;
    index < 27;
    index += 1
  ) {
    context.beginPath();
    context.ellipse(
      random() * WIDTH,
      40 +
      random() *
      (
        HEIGHT -
        80
      ),
      4 +
      random() * 22,
      2 +
      random() * 8,
      random() * Math.PI,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  context.globalAlpha = 0.15;
  context.strokeStyle = "#fff4aa";

  for (
    let arc = 0;
    arc < 34;
    arc += 1
  ) {
    context.lineWidth =
      1 +
      random() * 2.5;
    context.beginPath();
    context.arc(
      random() * WIDTH,
      random() * HEIGHT,
      16 +
      random() * 55,
      random() * Math.PI,
      random() * Math.PI +
      Math.PI * 0.8
    );
    context.stroke();
  }

  context.globalAlpha = 1;
}

export function createProceduralCelestialTexture(
  preset: UniverseSurfacePreset
): CanvasTexture {
  const canvas =
    document.createElement("canvas");

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const context =
    requireContext(canvas);

  const seed =
    preset
      .split("")
      .reduce(
        (
          total,
          character
        ) =>
          (
            total * 31 +
            character.charCodeAt(0)
          ) >>> 0,
        2_026
      );

  const random =
    mulberry32(seed);

  switch (preset) {
    case "sun":
      paintSun(
        context,
        random
      );
      break;

    case "mercury":
      paintRockyWorld(
        context,
        random,
        "#77736d",
        "#a39d91",
        "#403d3a",
        190
      );
      break;

    case "venus":
      paintVenus(
        context,
        random
      );
      break;

    case "earth":
      paintEarth(
        context,
        random
      );
      break;

    case "moon":
      paintRockyWorld(
        context,
        random,
        "#8f918f",
        "#c4c5c1",
        "#4c4e4d",
        225
      );
      break;

    case "mars":
      paintMars(
        context,
        random
      );
      break;

    case "jupiter":
      paintGasGiant(
        context,
        random,
        [
          "#d9b88f",
          "#f0dec2",
          "#a87555",
          "#c9986c",
          "#efe1c8",
          "#8e604a"
        ],
        true
      );
      break;

    case "saturn":
      paintGasGiant(
        context,
        random,
        [
          "#e9d6a3",
          "#cdbb8d",
          "#f4e4ba",
          "#bda979",
          "#dfc994"
        ],
        false
      );
      break;

    case "uranus":
      paintIceGiant(
        context,
        random,
        "#a7e1e1",
        "#58aeb7",
        "#d8ffff"
      );
      break;

    case "neptune":
      paintIceGiant(
        context,
        random,
        "#3569ca",
        "#152b78",
        "#8ebaff"
      );
      break;
  }

  const texture =
    new CanvasTexture(canvas);

  texture.colorSpace =
    SRGBColorSpace;

  texture.needsUpdate = true;

  return texture;
}

export function createRadialHaloTexture():
  CanvasTexture {
  const canvas =
    document.createElement("canvas");

  canvas.width = 256;
  canvas.height = 256;

  const context =
    requireContext(canvas);

  const gradient =
    context.createRadialGradient(
      128,
      128,
      4,
      128,
      128,
      128
    );

  gradient.addColorStop(
    0,
    "rgba(255,255,255,1)"
  );
  gradient.addColorStop(
    0.18,
    "rgba(255,232,164,0.95)"
  );
  gradient.addColorStop(
    0.46,
    "rgba(255,142,35,0.34)"
  );
  gradient.addColorStop(
    0.72,
    "rgba(255,91,8,0.12)"
  );
  gradient.addColorStop(
    1,
    "rgba(255,70,0,0)"
  );

  context.fillStyle = gradient;
  context.fillRect(
    0,
    0,
    256,
    256
  );

  const texture =
    new CanvasTexture(canvas);

  texture.colorSpace =
    SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}
