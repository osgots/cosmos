import {
  CanvasTexture,
  SRGBColorSpace
} from "three/webgpu";

import type {
  UniverseSurfacePreset
} from "../universeTypes";

const WIDTH = 768;
const HEIGHT = 384;

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
      0.8 + random() * 3.4;

    context.globalAlpha =
      maximumAlpha *
      (0.25 + random() * 0.75);

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

  gradient.addColorStop(0, light);
  gradient.addColorStop(0.45, base);
  gradient.addColorStop(1, dark);

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
    3_200,
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
      2 + random() * 18;

    const x = random() * WIDTH;
    const y = random() * HEIGHT;

    context.globalAlpha =
      0.08 + random() * 0.14;

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

    context.globalAlpha = 0.11;
    context.strokeStyle = light;
    context.lineWidth =
      Math.max(1, radius * 0.13);
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

  ocean.addColorStop(0, "#164f82");
  ocean.addColorStop(0.5, "#0b3767");
  ocean.addColorStop(1, "#061d45");

  context.fillStyle = ocean;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const landColors = [
    "#66894c",
    "#6f7d3d",
    "#8b7944",
    "#496f49",
    "#9d8b55"
  ];

  for (
    let group = 0;
    group < 34;
    group += 1
  ) {
    const centerX = random() * WIDTH;
    const centerY =
      55 + random() * (HEIGHT - 110);

    const blobs =
      4 + Math.floor(random() * 8);

    context.fillStyle =
      landColors[
        Math.floor(
          random() * landColors.length
        )
      ]!;

    context.globalAlpha =
      0.72 + random() * 0.22;

    for (
      let blob = 0;
      blob < blobs;
      blob += 1
    ) {
      const x =
        centerX +
        (random() - 0.5) * 90;
      const y =
        centerY +
        (random() - 0.5) * 55;

      context.beginPath();
      context.ellipse(
        x,
        y,
        18 + random() * 42,
        7 + random() * 24,
        (random() - 0.5) * 1.2,
        0,
        Math.PI * 2
      );
      context.fill();
    }
  }

  context.globalAlpha = 0.8;
  context.fillStyle = "#eef6fb";
  context.fillRect(0, 0, WIDTH, 17);
  context.fillRect(0, HEIGHT - 18, WIDTH, 18);

  context.globalAlpha = 0.2;
  context.strokeStyle = "#ffffff";
  context.lineWidth = 2.2;

  for (
    let cloud = 0;
    cloud < 70;
    cloud += 1
  ) {
    const y =
      35 + random() * (HEIGHT - 70);
    const x = random() * WIDTH;

    context.beginPath();
    context.ellipse(
      x,
      y,
      12 + random() * 55,
      1.5 + random() * 5,
      (random() - 0.5) * 0.35,
      0,
      Math.PI * 2
    );
    context.stroke();
  }

  context.globalAlpha = 1;
}

function paintVenus(
  context: CanvasRenderingContext2D,
  random: () => number
): void {
  context.fillStyle = "#c58c42";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const colors = [
    "#e9c881",
    "#d7aa5d",
    "#f2db9a",
    "#b97b35",
    "#fff0bf"
  ];

  for (
    let band = 0;
    band < 90;
    band += 1
  ) {
    const y = random() * HEIGHT;
    const amplitude =
      3 + random() * 11;

    context.strokeStyle =
      colors[
        Math.floor(
          random() * colors.length
        )
      ]!;
    context.globalAlpha =
      0.16 + random() * 0.25;
    context.lineWidth =
      2 + random() * 8;
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
        ) * amplitude;

      if (x === -20) {
        context.moveTo(x, waveY);
      } else {
        context.lineTo(x, waveY);
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
      7 + random() * 26;

    context.fillStyle =
      palette[
        band % palette.length
      ]!;

    context.globalAlpha =
      0.78 + random() * 0.22;

    context.fillRect(
      0,
      y,
      WIDTH,
      bandHeight + 1
    );

    context.globalAlpha = 0.13;
    context.fillStyle = "#ffffff";

    for (
      let streak = 0;
      streak < 20;
      streak += 1
    ) {
      const streakX = random() * WIDTH;
      const streakWidth =
        10 + random() * 90;

      context.fillRect(
        streakX,
        y + random() * bandHeight,
        streakWidth,
        Math.max(1, random() * 2.2)
      );
    }

    y += bandHeight;
    band += 1;
  }

  if (spot) {
    context.globalAlpha = 0.9;
    context.fillStyle = "#a74c33";
    context.beginPath();
    context.ellipse(
      WIDTH * 0.72,
      HEIGHT * 0.61,
      58,
      23,
      -0.08,
      0,
      Math.PI * 2
    );
    context.fill();

    context.globalAlpha = 0.22;
    context.strokeStyle = "#f1c09a";
    context.lineWidth = 5;
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

  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);

  context.fillStyle = gradient;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.globalAlpha = 0.11;
  context.strokeStyle = accent;

  for (
    let band = 0;
    band < 42;
    band += 1
  ) {
    context.lineWidth =
      1 + random() * 4;
    context.beginPath();
    context.moveTo(
      0,
      random() * HEIGHT
    );
    context.lineTo(
      WIDTH,
      random() * HEIGHT
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

  gradient.addColorStop(0, "#fff0a0");
  gradient.addColorStop(0.48, "#ffb321");
  gradient.addColorStop(1, "#ea5b0b");

  context.fillStyle = gradient;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  addFineNoise(
    context,
    random,
    7_500,
    "#fff6c4",
    "#d94f08",
    0.28
  );

  context.globalAlpha = 0.34;
  context.fillStyle = "#702307";

  for (
    let index = 0;
    index < 18;
    index += 1
  ) {
    context.beginPath();
    context.ellipse(
      random() * WIDTH,
      40 + random() * (HEIGHT - 80),
      4 + random() * 18,
      2 + random() * 7,
      random() * Math.PI,
      0,
      Math.PI * 2
    );
    context.fill();
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
    preset.split("")
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
        135
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
        160
      );
      break;

    case "mars":
      paintRockyWorld(
        context,
        random,
        "#a44a2b",
        "#d27a4c",
        "#54271d",
        58
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
    0.22,
    "rgba(255,226,150,0.92)"
  );
  gradient.addColorStop(
    0.52,
    "rgba(255,135,25,0.35)"
  );
  gradient.addColorStop(
    1,
    "rgba(255,95,0,0)"
  );

  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);

  const texture =
    new CanvasTexture(canvas);

  texture.colorSpace =
    SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}
