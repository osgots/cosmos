import {
  AdditiveBlending,
  AmbientLight,
  BackSide,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  WebGPURenderer
} from "three/webgpu";

import type {
  UniverseAtmosphereVisual,
  UniverseCameraState,
  UniverseHaloVisual,
  UniverseRenderBody,
  UniverseRenderOrbit,
  UniverseRenderScene,
  UniverseRingVisual,
  UniverseSurfacePreset
} from "../universeTypes";

import type {
  RendererSize
} from "../RendererBackend";

import {
  createProceduralCelestialTexture,
  createRadialHaloTexture
} from "./proceduralCelestialTexture";

const ORBIT_SEGMENTS = 192;
const BODY_SEGMENTS = 64;

interface BodyNode {
  readonly group: Group;
  readonly surface: Mesh;
  readonly surfaceMaterial:
    MeshBasicMaterial |
    MeshStandardMaterial;
  readonly ringGroup:
    Group | null;
  readonly atmosphere:
    Mesh | null;
  readonly halo:
    Sprite | null;
  readonly preset:
    UniverseSurfacePreset;
}

function colorFrom(
  color: {
    readonly r: number;
    readonly g: number;
    readonly b: number;
  }
): Color {
  return new Color(
    color.r,
    color.g,
    color.b
  );
}

function inferPreset(
  body: UniverseRenderBody
): UniverseSurfacePreset {
  if (body.surfacePreset !== undefined) {
    return body.surfacePreset;
  }

  switch (body.id) {
    case "sun":
    case "mercury":
    case "venus":
    case "earth":
    case "moon":
    case "mars":
    case "jupiter":
    case "saturn":
    case "uranus":
    case "neptune":
      return body.id;

    default:
      return body.kind === "star"
        ? "sun"
        : body.kind === "moon"
          ? "moon"
          : "earth";
  }
}

function defaultRing(
  preset: UniverseSurfacePreset
): UniverseRingVisual | undefined {
  if (preset !== "saturn") {
    return undefined;
  }

  return {
    innerRadiusMultiplier: 1.24,
    outerRadiusMultiplier: 2.28,
    tiltRad: 0.466,
    opacity: 0.82,
    color: {
      r: 0.92,
      g: 0.82,
      b: 0.64
    }
  };
}

function defaultHalo(
  preset: UniverseSurfacePreset
): UniverseHaloVisual | undefined {
  if (preset !== "sun") {
    return undefined;
  }

  return {
    scaleMultiplier: 2.55,
    opacity: 0.52,
    color: {
      r: 1,
      g: 0.48,
      b: 0.08
    }
  };
}

function defaultAtmosphere(
  preset: UniverseSurfacePreset
): UniverseAtmosphereVisual | undefined {
  switch (preset) {
    case "earth":
      return {
        scaleMultiplier: 1.045,
        opacity: 0.13,
        color: {
          r: 0.18,
          g: 0.55,
          b: 1
        }
      };

    case "venus":
      return {
        scaleMultiplier: 1.035,
        opacity: 0.075,
        color: {
          r: 1,
          g: 0.72,
          b: 0.32
        }
      };

    case "uranus":
      return {
        scaleMultiplier: 1.025,
        opacity: 0.065,
        color: {
          r: 0.4,
          g: 0.9,
          b: 0.92
        }
      };

    case "neptune":
      return {
        scaleMultiplier: 1.03,
        opacity: 0.075,
        color: {
          r: 0.14,
          g: 0.44,
          b: 1
        }
      };

    default:
      return undefined;
  }
}

export class ThreeUniverseBackend {
  private readonly scene =
    new Scene();

  private readonly camera =
    new PerspectiveCamera(
      52,
      1,
      0.01,
      1_000
    );

  private readonly unitSphere =
    new SphereGeometry(
      1,
      BODY_SEGMENTS,
      Math.floor(
        BODY_SEGMENTS / 2
      )
    );

  private readonly bodyNodes =
    new Map<
      string,
      BodyNode
    >();

  private readonly orbitLines =
    new Map<
      string,
      LineLoop<
        BufferGeometry,
        LineBasicMaterial
      >
    >();

  private readonly textures =
    new Map<
      UniverseSurfacePreset,
      ReturnType<
        typeof createProceduralCelestialTexture
      >
    >();

  private readonly ambientLight =
    new AmbientLight(
      0x506078,
      0.72
    );

  private readonly sunLight =
    new PointLight(
      0xfff2d4,
      34,
      0,
      0.18
    );

  private readonly haloTexture =
    createRadialHaloTexture();

  private readonly starfield =
    this.createStarfield();

  private renderer:
    WebGPURenderer | null =
      null;

  public constructor() {
    this.scene.background =
      new Color(0x000000);

    this.scene.add(
      this.ambientLight,
      this.sunLight,
      this.starfield
    );
  }

  public async initialize(
    canvas: HTMLCanvasElement
  ): Promise<void> {
    if (this.renderer !== null) {
      throw new Error(
        "ThreeUniverseBackend is already initialized."
      );
    }

    const renderer =
      new WebGPURenderer({
        canvas,
        antialias: true,
        alpha: false
      });

    await renderer.init();

    renderer.setClearColor(
      0x000000,
      1
    );

    this.renderer = renderer;
  }

  public resize(
    size: RendererSize
  ): void {
    const renderer =
      this.requireRenderer();

    if (
      !Number.isFinite(size.width) ||
      !Number.isFinite(size.height) ||
      !Number.isFinite(size.pixelRatio) ||
      size.width <= 0 ||
      size.height <= 0 ||
      size.pixelRatio <= 0
    ) {
      throw new RangeError(
        "Universe renderer size must contain positive finite values."
      );
    }

    renderer.setPixelRatio(
      Math.min(
        size.pixelRatio,
        2
      )
    );

    renderer.setSize(
      size.width,
      size.height,
      false
    );

    this.camera.aspect =
      size.width /
      size.height;

    this.camera.updateProjectionMatrix();
  }

  public render(
    snapshot: UniverseRenderScene,
    cameraState: UniverseCameraState
  ): void {
    const renderer =
      this.requireRenderer();

    this.updateBodies(
      snapshot.bodies
    );

    this.updateOrbits(
      snapshot.orbits
    );

    this.camera.position.set(
      cameraState.position.x,
      cameraState.position.y,
      cameraState.position.z
    );

    this.camera.lookAt(
      cameraState.target.x,
      cameraState.target.y,
      cameraState.target.z
    );

    renderer.render(
      this.scene,
      this.camera
    );
  }

  private textureFor(
    preset: UniverseSurfacePreset
  ): ReturnType<
    typeof createProceduralCelestialTexture
  > {
    const existing =
      this.textures.get(preset);

    if (existing !== undefined) {
      return existing;
    }

    const texture =
      createProceduralCelestialTexture(
        preset
      );

    this.textures.set(
      preset,
      texture
    );

    return texture;
  }

  private createBodyNode(
    body: UniverseRenderBody
  ): BodyNode {
    const preset =
      inferPreset(body);

    const texture =
      this.textureFor(preset);

    const surfaceMaterial =
      preset === "sun"
        ? new MeshBasicMaterial({
            map: texture,
            color: 0xffffff
          })
        : new MeshStandardMaterial({
            map: texture,
            color: 0xffffff,
            roughness:
              body.roughness ??
              0.9,
            metalness:
              body.metalness ??
              0
          });

    const surface =
      new Mesh(
        this.unitSphere,
        surfaceMaterial
      );

    surface.frustumCulled = false;

    const group =
      new Group();

    group.add(surface);

    const ringVisual =
      body.ring ??
      defaultRing(preset);

    const ringGroup =
      ringVisual === undefined
        ? null
        : this.createRingGroup(
            ringVisual
          );

    if (ringGroup !== null) {
      group.add(ringGroup);
    }

    const atmosphereVisual =
      body.atmosphere ??
      defaultAtmosphere(preset);

    let atmosphere:
      Mesh | null = null;

    if (atmosphereVisual !== undefined) {
      const material =
        new MeshBasicMaterial({
          color:
            colorFrom(
              atmosphereVisual.color
            ),
          transparent: true,
          opacity:
            atmosphereVisual.opacity,
          side: BackSide,
          depthWrite: false
        });

      atmosphere =
        new Mesh(
          this.unitSphere,
          material
        );

      atmosphere.scale.setScalar(
        atmosphereVisual
          .scaleMultiplier
      );

      atmosphere.frustumCulled = false;
      group.add(atmosphere);
    }

    const haloVisual =
      body.halo ??
      defaultHalo(preset);

    let halo:
      Sprite | null = null;

    if (haloVisual !== undefined) {
      const material =
        new SpriteMaterial({
          map:
            this.haloTexture,
          color:
            colorFrom(
              haloVisual.color
            ),
          transparent: true,
          opacity:
            haloVisual.opacity,
          blending:
            AdditiveBlending,
          depthWrite: false
        });

      halo = new Sprite(material);
      halo.frustumCulled = false;
      group.add(halo);
    }

    this.scene.add(group);

    return {
      group,
      surface,
      surfaceMaterial,
      ringGroup,
      atmosphere,
      halo,
      preset
    };
  }

  private createRingGroup(
    visual: UniverseRingVisual
  ): Group {
    const group =
      new Group();

    const ringCount = 9;
    const totalWidth =
      visual.outerRadiusMultiplier -
      visual.innerRadiusMultiplier;

    for (
      let index = 0;
      index < ringCount;
      index += 1
    ) {
      const start =
        visual.innerRadiusMultiplier +
        totalWidth *
        (index / ringCount);

      const end =
        visual.innerRadiusMultiplier +
        totalWidth *
        ((index + 0.72) / ringCount);

      const brightness =
        0.74 +
        (index % 3) * 0.08;

      const geometry =
        new RingGeometry(
          start,
          end,
          128
        );

      const material =
        new MeshBasicMaterial({
          color: new Color(
            Math.min(
              1,
              visual.color.r * brightness
            ),
            Math.min(
              1,
              visual.color.g * brightness
            ),
            Math.min(
              1,
              visual.color.b * brightness
            )
          ),
          transparent: true,
          opacity:
            visual.opacity *
            (0.48 + index / ringCount * 0.45),
          side: DoubleSide,
          depthWrite: false
        });

      const ring =
        new Mesh(
          geometry,
          material
        );

      ring.frustumCulled = false;
      group.add(ring);
    }

    group.rotation.x =
      Math.PI / 2;
    group.rotation.z =
      visual.tiltRad;

    return group;
  }

  private updateBodies(
    bodies:
      readonly UniverseRenderBody[]
  ): void {
    const activeIds =
      new Set(
        bodies.map(
          body => body.id
        )
      );

    for (
      const [id, node] of
        this.bodyNodes
    ) {
      if (!activeIds.has(id)) {
        this.disposeBodyNode(node);
        this.bodyNodes.delete(id);
      }
    }

    for (const body of bodies) {
      if (
        !Number.isFinite(body.radius) ||
        body.radius <= 0
      ) {
        continue;
      }

      const preset =
        inferPreset(body);

      let node =
        this.bodyNodes.get(body.id);

      if (
        node === undefined ||
        node.preset !== preset
      ) {
        if (node !== undefined) {
          this.disposeBodyNode(node);
        }

        node =
          this.createBodyNode(body);

        this.bodyNodes.set(
          body.id,
          node
        );
      }

      node.group.position.set(
        body.position.x,
        body.position.y,
        body.position.z
      );

      node.group.scale.setScalar(
        body.radius
      );

      if (
        node.surfaceMaterial instanceof
        MeshStandardMaterial
      ) {
        node.surfaceMaterial.roughness =
          body.roughness ?? 0.9;
        node.surfaceMaterial.metalness =
          body.metalness ?? 0;
      }

      if (node.halo !== null) {
        const haloVisual =
          body.halo ??
          defaultHalo(preset);

        if (haloVisual !== undefined) {
          const haloSize =
            2 *
            haloVisual.scaleMultiplier;

          node.halo.scale.set(
            haloSize,
            haloSize,
            1
          );
        }
      }

      if (preset === "sun") {
        this.sunLight.position.set(
          body.position.x,
          body.position.y,
          body.position.z
        );
      }
    }
  }

  private disposeBodyNode(
    node: BodyNode
  ): void {
    this.scene.remove(node.group);

    node.surfaceMaterial.dispose();

    if (node.atmosphere !== null) {
      const material =
        node.atmosphere.material;

      if (
        material instanceof
        MeshBasicMaterial
      ) {
        material.dispose();
      }
    }

    if (node.halo !== null) {
      node.halo.material.dispose();
    }

    if (node.ringGroup !== null) {
      for (
        const child of
          node.ringGroup.children
      ) {
        if (child instanceof Mesh) {
          child.geometry.dispose();

          if (
            child.material instanceof
            MeshBasicMaterial
          ) {
            child.material.dispose();
          }
        }
      }
    }
  }

  private updateOrbits(
    orbits:
      readonly UniverseRenderOrbit[]
  ): void {
    const activeIds =
      new Set(
        orbits.map(
          orbit => orbit.id
        )
      );

    for (
      const [id, line] of
        this.orbitLines
    ) {
      if (!activeIds.has(id)) {
        this.scene.remove(line);
        line.geometry.dispose();
        line.material.dispose();
        this.orbitLines.delete(id);
      }
    }

    for (const orbit of orbits) {
      let line =
        this.orbitLines.get(orbit.id);

      if (line === undefined) {
        const geometry =
          new BufferGeometry();

        const material =
          new LineBasicMaterial({
            color:
              colorFrom(
                orbit.color
              ),
            transparent: true,
            opacity:
              orbit.opacity
          });

        line =
          new LineLoop(
            geometry,
            material
          );

        line.frustumCulled = false;
        this.orbitLines.set(
          orbit.id,
          line
        );
        this.scene.add(line);
      }

      const positions =
        new Float32Array(
          ORBIT_SEGMENTS * 3
        );

      for (
        let index = 0;
        index < ORBIT_SEGMENTS;
        index += 1
      ) {
        const angle =
          index /
          ORBIT_SEGMENTS *
          Math.PI *
          2;

        const offset =
          index * 3;

        positions[offset] =
          orbit.center.x +
          Math.cos(angle) *
          orbit.radius;

        positions[offset + 1] =
          orbit.center.y;

        positions[offset + 2] =
          orbit.center.z +
          Math.sin(angle) *
          orbit.radius;
      }

      line.geometry.setAttribute(
        "position",
        new Float32BufferAttribute(
          positions,
          3
        )
      );

      line.material.color.setRGB(
        orbit.color.r,
        orbit.color.g,
        orbit.color.b
      );

      line.material.opacity =
        orbit.opacity;
    }
  }

  private createStarfield(): Points {
    const count = 1_200;
    const positions =
      new Float32Array(
        count * 3
      );

    let seed = 0x5f3759df;

    const random = (): number => {
      seed =
        Math.imul(
          seed ^ seed >>> 15,
          1 | seed
        );
      seed ^=
        seed +
        Math.imul(
          seed ^ seed >>> 7,
          61 | seed
        );

      return (
        (seed ^ seed >>> 14) >>> 0
      ) / 4_294_967_296;
    };

    for (
      let index = 0;
      index < count;
      index += 1
    ) {
      const theta =
        random() *
        Math.PI *
        2;
      const z =
        random() * 2 - 1;
      const radial =
        Math.sqrt(
          Math.max(
            0,
            1 - z * z
          )
        );
      const distance =
        120 + random() * 260;

      const offset =
        index * 3;

      positions[offset] =
        Math.cos(theta) *
        radial *
        distance;
      positions[offset + 1] =
        z * distance;
      positions[offset + 2] =
        Math.sin(theta) *
        radial *
        distance;
    }

    const geometry =
      new BufferGeometry();

    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(
        positions,
        3
      )
    );

    const material =
      new PointsMaterial({
        color: 0xdce9ff,
        size: 0.17,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.78,
        depthWrite: false
      });

    const points =
      new Points(
        geometry,
        material
      );

    points.frustumCulled = false;

    return points;
  }

  public dispose(): void {
    for (
      const node of
        this.bodyNodes.values()
    ) {
      this.disposeBodyNode(node);
    }

    for (
      const line of
        this.orbitLines.values()
    ) {
      this.scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    }

    this.bodyNodes.clear();
    this.orbitLines.clear();

    this.unitSphere.dispose();

    for (
      const texture of
        this.textures.values()
    ) {
      texture.dispose();
    }

    this.textures.clear();
    this.haloTexture.dispose();

    this.starfield.geometry.dispose();
    this.starfield.material.dispose();

    if (this.renderer !== null) {
      this.renderer.dispose();
      this.renderer = null;
    }
  }

  private requireRenderer():
    WebGPURenderer {
    if (this.renderer === null) {
      throw new Error(
        "ThreeUniverseBackend must be initialized before rendering."
      );
    }

    return this.renderer;
  }
}
