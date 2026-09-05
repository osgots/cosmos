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

function fillVerticalGradient(
  context: CanvasRenderingContext2D,
  stops:
    readonly (
      readonly [
        offset: number,
        color: string
      ]
    )[]
): void {
  const gradient =
    context.createLinearGradient(
      0,
      0,
      0,
      HEIGHT
    );

  for (const [offset, color] of stops) {
    gradient.addColorStop(
      offset,
      color
    );
  }

  context.fillStyle = gradient;
  context.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT
  );
}

function projectLonLat(
  point: LonLat
): readonly [number, number] {
  return [
    (
      point[0] + 180
    ) /
      360 *
      WIDTH,
    (
      90 - point[1]
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
    context.lineWidth = 1.1;
    context.stroke();
  }
}

function addFineNoise(
  context: CanvasRenderingContext2D,
  random: () => number,
  count: number,
  light: string,
  dark: string,
  maximumAlpha: number,
  maximumRadius = 3.4
): void {
  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const size =
      0.45 +
      random() *
      maximumRadius;

    context.globalAlpha =
      maximumAlpha *
      (
        0.22 +
        random() * 0.78
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

function paintCrater(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  light: string,
  dark: string,
  alpha: number
): void {
  const shadow =
    context.createRadialGradient(
      x - radius * 0.24,
      y - radius * 0.22,
      radius * 0.08,
      x,
      y,
      radius
    );

  shadow.addColorStop(
    0,
    `rgba(255,255,255,${alpha * 0.22})`
  );
  shadow.addColorStop(
    0.56,
    dark
  );
  shadow.addColorStop(
    0.8,
    light
  );
  shadow.addColorStop(
    1,
    `rgba(0,0,0,${alpha * 0.12})`
  );

  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = shadow;
  context.beginPath();
  context.ellipse(
    x,
    y,
    radius,
    radius * 0.76,
    0,
    0,
    Math.PI * 2
  );
  context.fill();

  context.globalAlpha =
    alpha * 0.45;
  context.strokeStyle = light;
  context.lineWidth =
    Math.max(
      0.6,
      radius * 0.08
    );
  context.beginPath();
  context.ellipse(
    x - radius * 0.09,
    y - radius * 0.11,
    radius * 0.84,
    radius * 0.62,
    0,
    Math.PI * 0.86,
    Math.PI * 1.84
  );
  context.stroke();
  context.restore();
}

function paintRockyWorld(
  context: CanvasRenderingContext2D,
  random: () => number,
  base: string,
  light: string,
  dark: string,
  craterCount: number
): void {
  fillVerticalGradient(
    context,
    [
      [0, light],
      [0.22, base],
      [0.54, base],
      [1, dark]
    ]
  );

  addFineNoise(
    context,
    random,
    7_200,
    light,
    dark,
    0.2,
    2.8
  );

  context.save();
  context.globalAlpha = 0.08;

  for (
    let ridge = 0;
    ridge < 95;
    ridge += 1
  ) {
    const y =
      random() * HEIGHT;

    context.strokeStyle =
      random() > 0.5
        ? light
        : dark;
    context.lineWidth =
      0.5 +
      random() * 2;
    context.beginPath();

    for (
      let x = -20;
      x <= WIDTH + 20;
      x += 24
    ) {
      const wave =
        y +
        Math.sin(
          x *
            (
              0.006 +
              random() * 0.008
            ) +
          ridge
        ) *
        (
          2 +
          random() * 8
        );

      if (x === -20) {
        context.moveTo(x, wave);
      } else {
        context.lineTo(x, wave);
      }
    }

    context.stroke();
  }

  context.restore();

  for (
    let index = 0;
    index < craterCount;
    index += 1
  ) {
    const radius =
      1.5 +
      Math.pow(
        random(),
        2.35
      ) * 31;

    paintCrater(
      context,
      random() * WIDTH,
      random() * HEIGHT,
      radius,
      light,
      dark,
      0.22 +
        random() * 0.38
    );
  }
}

function paintEarth(
  context: CanvasRenderingContext2D,
  random: () => number
): void {
  fillVerticalGradient(
    context,
    [
      [0, "#155f9a"],
      [0.22, "#0c4c84"],
      [0.5, "#06366c"],
      [0.78, "#082b5d"],
      [1, "#061839"]
    ]
  );

  context.globalAlpha = 0.12;
  context.strokeStyle = "#69c8e8";
  context.lineWidth = 1;

  for (
    let current = 0;
    current < 140;
    current += 1
  ) {
    const y =
      random() * HEIGHT;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(
      WIDTH * 0.32,
      y +
        (
          random() - 0.5
        ) * 14,
      WIDTH * 0.68,
      y +
        (
          random() - 0.5
        ) * 14,
      WIDTH,
      y
    );
    context.stroke();
  }

  const coast =
    "rgba(230,220,163,0.48)";

  paintPolygon(
    context,
    [
      [-168, 70], [-149, 67], [-132, 58], [-124, 48],
      [-117, 33], [-104, 25], [-93, 19], [-84, 24],
      [-80, 31], [-68, 45], [-78, 58], [-105, 72],
      [-138, 72]
    ],
    "#5e7d48",
    coast
  );

  paintPolygon(
    context,
    [
      [-82, 13], [-71, 8], [-62, -5], [-55, -15],
      [-52, -25], [-58, -39], [-69, -55], [-76, -42],
      [-80, -20]
    ],
    "#6f8248",
    coast
  );

  paintPolygon(
    context,
    [
      [-18, 36], [-4, 38], [12, 36], [26, 31],
      [40, 15], [50, 8], [43, -12], [31, -30],
      [18, -35], [5, -28], [-8, -7]
    ],
    "#728147",
    coast
  );

  paintPolygon(
    context,
    [
      [-10, 38], [8, 56], [31, 68], [65, 72],
      [96, 66], [128, 56], [151, 48], [144, 29],
      [121, 20], [104, 6], [81, 8], [60, 25],
      [44, 35], [26, 42], [8, 42]
    ],
    "#657b48",
    coast
  );

  paintPolygon(
    context,
    [
      [112, -11], [130, -10], [153, -24],
      [146, -39], [125, -42], [113, -28]
    ],
    "#8b7846",
    coast
  );

  paintPolygon(
    context,
    [
      [-52, 60], [-43, 75], [-20, 82],
      [-18, 68], [-32, 58]
    ],
    "#d8e8e4",
    "rgba(255,255,255,0.58)"
  );

  context.save();
  context.globalAlpha = 0.26;

  for (
    let patch = 0;
    patch < 460;
    patch += 1
  ) {
    const warm =
      random() > 0.58;

    context.fillStyle =
      warm
        ? "#c19a59"
        : "#395d35";

    context.beginPath();
    context.ellipse(
      random() * WIDTH,
      38 +
        random() *
        (HEIGHT - 76),
      1.5 +
        random() * 13,
      0.8 +
        random() * 5,
      random() * Math.PI,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  context.restore();

  const northIce =
    context.createLinearGradient(
      0,
      0,
      0,
      42
    );
  northIce.addColorStop(
    0,
    "rgba(250,255,255,0.96)"
  );
  northIce.addColorStop(
    1,
    "rgba(230,246,250,0)"
  );
  context.fillStyle = northIce;
  context.fillRect(
    0,
    0,
    WIDTH,
    46
  );

  const southIce =
    context.createLinearGradient(
      0,
      HEIGHT - 46,
      0,
      HEIGHT
    );
  southIce.addColorStop(
    0,
    "rgba(230,246,250,0)"
  );
  southIce.addColorStop(
    1,
    "rgba(250,255,255,0.96)"
  );
  context.fillStyle = southIce;
  context.fillRect(
    0,
    HEIGHT - 46,
    WIDTH,
    46
  );

  context.save();
  context.globalAlpha = 0.28;
  context.strokeStyle = "#ffffff";
  context.lineCap = "round";

  for (
    let cloud = 0;
    cloud < 175;
    cloud += 1
  ) {
    const y =
      30 +
      random() *
      (HEIGHT - 60);
    const x =
      random() * WIDTH;
    const radiusX =
      12 +
      random() * 74;

    context.lineWidth =
      1 +
      random() * 3;
    context.beginPath();
    context.ellipse(
      x,
      y,
      radiusX,
      1.2 +
        random() * 6,
      (
        random() - 0.5
      ) * 0.3,
      0,
      Math.PI * 2
    );
    context.stroke();
  }

  context.globalAlpha = 0.34;
  context.lineWidth = 2.2;
  context.beginPath();
  context.ellipse(
    WIDTH * 0.18,
    HEIGHT * 0.53,
    68,
    25,
    -0.35,
    0,
    Math.PI * 1.65
  );
  context.stroke();
  context.restore();
}

function paintMars(
  context: CanvasRenderingContext2D,
  random: () => number
): void {
  paintRockyWorld(
    context,
    random,
    "#a64c2c",
    "#d8794b",
    "#48231b",
    94
  );

  context.save();
  context.globalAlpha = 0.36;
  context.fillStyle = "#45241d";

  for (
    let region = 0;
    region < 55;
    region += 1
  ) {
    context.beginPath();
    context.ellipse(
      random() * WIDTH,
      48 +
        random() *
        (HEIGHT - 96),
      14 +
        random() * 78,
      3 +
        random() * 20,
      (
        random() - 0.5
      ) * 0.8,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  context.globalAlpha = 0.38;
  context.strokeStyle = "#351812";
  context.lineWidth = 9;
  context.beginPath();
  context.moveTo(
    WIDTH * 0.28,
    HEIGHT * 0.57
  );
  context.bezierCurveTo(
    WIDTH * 0.4,
    HEIGHT * 0.51,
    WIDTH * 0.54,
    HEIGHT * 0.64,
    WIDTH * 0.69,
    HEIGHT * 0.54
  );
  context.stroke();

  context.globalAlpha = 0.5;
  context.fillStyle = "#e5ddd0";
  context.fillRect(
    0,
    0,
    WIDTH,
    12
  );
  context.fillRect(
    0,
    HEIGHT - 10,
    WIDTH,
    10
  );
  context.restore();
}

function paintVenus(
  context: CanvasRenderingContext2D,
  random: () => number
): void {
  fillVerticalGradient(
    context,
    [
      [0, "#f1d99c"],
      [0.32, "#d9aa62"],
      [0.58, "#c58741"],
      [1, "#9b5d2e"]
    ]
  );

  const colors = [
    "#fff1c3",
    "#e9c983",
    "#d9a85a",
    "#b87635",
    "#f7df9c"
  ] as const;

  context.save();
  context.lineCap = "round";

  for (
    let band = 0;
    band < 150;
    band += 1
  ) {
    const baseY =
      random() * HEIGHT;
    const phase =
      random() *
      Math.PI * 2;

    context.strokeStyle =
      colors[
        Math.floor(
          random() * colors.length
        )
      ]!;
    context.globalAlpha =
      0.12 +
      random() * 0.3;
    context.lineWidth =
      1.5 +
      random() * 8;
    context.beginPath();

    for (
      let x = -30;
      x <= WIDTH + 30;
      x += 12
    ) {
      const y =
        baseY +
        Math.sin(
          x * 0.014 + phase
        ) *
        (
          2 +
          random() * 10
        );

      if (x === -30) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.stroke();
  }

  context.globalAlpha = 0.18;
  context.strokeStyle = "#fff7d3";
  context.lineWidth = 6;

  for (
    const y of [
      HEIGHT * 0.12,
      HEIGHT * 0.88
    ]
  ) {
    for (
      let arc = 0;
      arc < 9;
      arc += 1
    ) {
      context.beginPath();
      context.arc(
        WIDTH * 0.5,
        y,
        24 + arc * 13,
        0,
        Math.PI * 1.6
      );
      context.stroke();
    }
  }

  context.restore();
}

function paintGasGiant(
  context: CanvasRenderingContext2D,
  random: () => number,
  palette: readonly string[],
  spot: boolean
): void {
  context.fillStyle =
    palette[0]!;
  context.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT
  );

  let y = -10;
  let band = 0;

  while (y < HEIGHT + 10) {
    const bandHeight =
      8 +
      random() * 25;
    const phase =
      random() *
      Math.PI * 2;

    context.fillStyle =
      palette[
        band % palette.length
      ]!;
    context.globalAlpha =
      0.75 +
      random() * 0.24;
    context.beginPath();
    context.moveTo(-20, y);

    for (
      let x = -20;
      x <= WIDTH + 20;
      x += 12
    ) {
      context.lineTo(
        x,
        y +
          Math.sin(
            x * 0.011 + phase
          ) *
          (
            1.5 +
            random() * 4
          )
      );
    }

    for (
      let x = WIDTH + 20;
      x >= -20;
      x -= 12
    ) {
      context.lineTo(
        x,
        y +
          bandHeight +
          Math.sin(
            x * 0.013 + phase + 1.4
          ) *
          (
            1.5 +
            random() * 4
          )
      );
    }

    context.closePath();
    context.fill();

    context.globalAlpha = 0.12;
    context.strokeStyle = "#fff9ec";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, y + bandHeight * 0.5);
    context.lineTo(
      WIDTH,
      y + bandHeight * 0.5
    );
    context.stroke();

    y += bandHeight;
    band += 1;
  }

  context.save();
  context.globalAlpha = 0.16;

  for (
    let storm = 0;
    storm < 120;
    storm += 1
  ) {
    context.strokeStyle =
      palette[
        Math.floor(
          random() * palette.length
        )
      ]!;
    context.lineWidth =
      0.8 +
      random() * 2;
    context.beginPath();
    context.ellipse(
      random() * WIDTH,
      random() * HEIGHT,
      6 +
        random() * 45,
      1 +
        random() * 6,
      0,
      0,
      Math.PI * 2
    );
    context.stroke();
  }

  context.restore();

  if (spot) {
    const spotX =
      WIDTH * 0.72;
    const spotY =
      HEIGHT * 0.61;

    const gradient =
      context.createRadialGradient(
        spotX - 18,
        spotY - 8,
        4,
        spotX,
        spotY,
        82
      );
    gradient.addColorStop(
      0,
      "#e6a07d"
    );
    gradient.addColorStop(
      0.42,
      "#b65c42"
    );
    gradient.addColorStop(
      0.78,
      "#8f3f32"
    );
    gradient.addColorStop(
      1,
      "rgba(108,42,35,0.18)"
    );

    context.globalAlpha = 0.95;
    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(
      spotX,
      spotY,
      80,
      31,
      -0.08,
      0,
      Math.PI * 2
    );
    context.fill();

    for (
      let ring = 0;
      ring < 6;
      ring += 1
    ) {
      context.globalAlpha =
        0.13 +
        ring * 0.015;
      context.strokeStyle =
        ring % 2 === 0
          ? "#f5c0a2"
          : "#6f3028";
      context.lineWidth = 2;
      context.beginPath();
      context.ellipse(
        spotX,
        spotY,
        70 - ring * 7,
        25 - ring * 2.2,
        -0.08,
        0,
        Math.PI * 2
      );
      context.stroke();
    }
  }

  context.globalAlpha = 1;
}

function paintIceGiant(
  context: CanvasRenderingContext2D,
  random: () => number,
  top: string,
  middle: string,
  bottom: string,
  accent: string,
  storm: boolean
): void {
  fillVerticalGradient(
    context,
    [
      [0, top],
      [0.48, middle],
      [1, bottom]
    ]
  );

  context.save();
  context.globalAlpha = 0.11;
  context.strokeStyle = accent;
  context.lineCap = "round";

  for (
    let band = 0;
    band < 78;
    band += 1
  ) {
    const y =
      random() * HEIGHT;
    const phase =
      random() *
      Math.PI * 2;

    context.lineWidth =
      0.7 +
      random() * 4;
    context.beginPath();

    for (
      let x = 0;
      x <= WIDTH;
      x += 24
    ) {
      const wave =
        y +
        Math.sin(
          x * 0.01 + phase
        ) *
        (
          0.5 +
          random() * 3
        );

      if (x === 0) {
        context.moveTo(x, wave);
      } else {
        context.lineTo(x, wave);
      }
    }

    context.stroke();
  }

  if (storm) {
    context.globalAlpha = 0.3;
    context.fillStyle = "#0a194d";
    context.beginPath();
    context.ellipse(
      WIDTH * 0.64,
      HEIGHT * 0.58,
      37,
      16,
      -0.12,
      0,
      Math.PI * 2
    );
    context.fill();

    context.globalAlpha = 0.22;
    context.strokeStyle = "#a9c9ff";
    context.lineWidth = 3;
    context.beginPath();
    context.ellipse(
      WIDTH * 0.64,
      HEIGHT * 0.58,
      48,
      20,
      -0.12,
      0,
      Math.PI * 2
    );
    context.stroke();
  }

  context.restore();
}

function paintSun(
  context: CanvasRenderingContext2D,
  random: () => number
): void {
  fillVerticalGradient(
    context,
    [
      [0, "#fff5b6"],
      [0.34, "#ffd454"],
      [0.62, "#ffad23"],
      [0.82, "#f4720f"],
      [1, "#c83b08"]
    ]
  );

  addFineNoise(
    context,
    random,
    15_500,
    "#fffbd8",
    "#b83a08",
    0.28,
    2.5
  );

  context.save();
  context.globalCompositeOperation =
    "screen";
  context.globalAlpha = 0.13;
  context.strokeStyle = "#fff3a1";

  for (
    let cell = 0;
    cell < 620;
    cell += 1
  ) {
    const x =
      random() * WIDTH;
    const y =
      random() * HEIGHT;
    const radius =
      2 +
      random() * 11;

    context.lineWidth =
      0.5 +
      random() * 1.3;
    context.beginPath();
    context.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );
    context.stroke();
  }

  context.restore();

  for (
    let spot = 0;
    spot < 31;
    spot += 1
  ) {
    const x =
      random() * WIDTH;
    const y =
      36 +
      random() *
      (HEIGHT - 72);
    const radius =
      3 +
      random() * 17;

    context.globalAlpha =
      0.17 +
      random() * 0.22;
    context.fillStyle = "#5d1c0a";
    context.beginPath();
    context.ellipse(
      x,
      y,
      radius,
      radius * 0.48,
      random() * Math.PI,
      0,
      Math.PI * 2
    );
    context.fill();

    context.globalAlpha = 0.14;
    context.strokeStyle = "#ffcd4b";
    context.lineWidth =
      2 +
      radius * 0.12;
    context.beginPath();
    context.ellipse(
      x,
      y,
      radius * 1.55,
      radius * 0.78,
      0,
      0,
      Math.PI * 2
    );
    context.stroke();
  }

  context.globalAlpha = 0.18;
  context.strokeStyle = "#fff0a2";

  for (
    let arc = 0;
    arc < 62;
    arc += 1
  ) {
    context.lineWidth =
      0.8 +
      random() * 2.4;
    context.beginPath();
    context.arc(
      random() * WIDTH,
      random() * HEIGHT,
      13 +
        random() * 58,
      random() * Math.PI,
      random() * Math.PI +
        Math.PI * 0.9
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
        "#aaa397",
        "#353330",
        245
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
        "#8c8e8d",
        "#c8c9c5",
        "#414342",
        285
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
          "#d8b18b",
          "#f0debf",
          "#a66d4f",
          "#c88f68",
          "#f2e4ca",
          "#855846",
          "#d5a273"
        ],
        true
      );
      break;

    case "saturn":
      paintGasGiant(
        context,
        random,
        [
          "#ead7a5",
          "#cfbd8e",
          "#f6e7bd",
          "#bca776",
          "#dfca95",
          "#f0dfb0"
        ],
        false
      );
      break;

    case "uranus":
      paintIceGiant(
        context,
        random,
        "#bce9e6",
        "#7fcbd0",
        "#4a9fab",
        "#e5ffff",
        false
      );
      break;

    case "neptune":
      paintIceGiant(
        context,
        random,
        "#477cd8",
        "#2450a9",
        "#111f62",
        "#a6c8ff",
        true
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

  canvas.width = 384;
  canvas.height = 384;

  const context =
    requireContext(canvas);

  const gradient =
    context.createRadialGradient(
      192,
      192,
      4,
      192,
      192,
      192
    );

  gradient.addColorStop(
    0,
    "rgba(255,255,255,1)"
  );
  gradient.addColorStop(
    0.12,
    "rgba(255,246,190,0.98)"
  );
  gradient.addColorStop(
    0.28,
    "rgba(255,199,72,0.72)"
  );
  gradient.addColorStop(
    0.52,
    "rgba(255,117,18,0.27)"
  );
  gradient.addColorStop(
    0.74,
    "rgba(255,68,5,0.10)"
  );
  gradient.addColorStop(
    1,
    "rgba(255,45,0,0)"
  );

  context.fillStyle = gradient;
  context.fillRect(
    0,
    0,
    384,
    384
  );

  context.save();
  context.translate(192, 192);
  context.globalCompositeOperation =
    "screen";
  context.strokeStyle =
    "rgba(255,190,70,0.10)";

  for (
    let ray = 0;
    ray < 80;
    ray += 1
  ) {
    const angle =
      ray / 80 *
      Math.PI * 2;
    const inner =
      58 +
      (ray % 7) * 2;
    const outer =
      120 +
      (ray % 11) * 4;

    context.lineWidth =
      ray % 5 === 0
        ? 2
        : 0.7;
    context.beginPath();
    context.moveTo(
      Math.cos(angle) * inner,
      Math.sin(angle) * inner
    );
    context.lineTo(
      Math.cos(angle) * outer,
      Math.sin(angle) * outer
    );
    context.stroke();
  }

  context.restore();

  const texture =
    new CanvasTexture(canvas);

  texture.colorSpace =
    SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}
