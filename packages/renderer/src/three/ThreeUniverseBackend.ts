import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  WebGPURenderer
} from "three/webgpu";

import type {
  UniverseCameraState,
  UniverseRenderBody,
  UniverseRenderOrbit,
  UniverseRenderScene
} from "../universeTypes";

import type {
  RendererSize
} from "../RendererBackend";

const ORBIT_SEGMENTS =
  160;

export class ThreeUniverseBackend {
  private readonly scene =
    new Scene();

  private readonly camera =
    new PerspectiveCamera(
      52,
      1,
      0.01,
      100_000
    );

  private readonly unitSphere =
    new SphereGeometry(
      1,
      48,
      32
    );

  private readonly bodyMeshes =
    new Map<
      string,
      Mesh<
        SphereGeometry,
        MeshBasicMaterial
      >
    >();

  private readonly orbitLines =
    new Map<
      string,
      LineLoop<
        BufferGeometry,
        LineBasicMaterial
      >
    >();

  private renderer:
    WebGPURenderer | null =
      null;

  public constructor() {
    this.scene.background =
      new Color(
        0x000000
      );
  }

  public async initialize(
    canvas: HTMLCanvasElement
  ): Promise<void> {
    if (
      this.renderer !== null
    ) {
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

    this.renderer =
      renderer;
  }

  public resize(
    size: RendererSize
  ): void {
    const renderer =
      this.requireRenderer();

    if (
      !Number.isFinite(
        size.width
      ) ||
      !Number.isFinite(
        size.height
      ) ||
      !Number.isFinite(
        size.pixelRatio
      ) ||
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

    this.camera
      .updateProjectionMatrix();
  }

  public render(
    snapshot:
      UniverseRenderScene,

    cameraState:
      UniverseCameraState
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

  private updateBodies(
    bodies:
      readonly UniverseRenderBody[]
  ): void {
    const activeIds =
      new Set(
        bodies.map(
          (
            body
          ) =>
            body.id
        )
      );

    for (
      const [
        id,
        mesh
      ] of
        this.bodyMeshes
    ) {
      if (
        !activeIds.has(id)
      ) {
        this.scene.remove(
          mesh
        );

        mesh.material.dispose();

        this.bodyMeshes.delete(
          id
        );
      }
    }

    for (
      const body of bodies
    ) {
      if (
        !Number.isFinite(
          body.radius
        ) ||
        body.radius <= 0
      ) {
        continue;
      }

      let mesh =
        this.bodyMeshes.get(
          body.id
        );

      if (
        mesh === undefined
      ) {
        const material =
          new MeshBasicMaterial({
            color:
              new Color(
                body.color.r,
                body.color.g,
                body.color.b
              )
          });

        mesh =
          new Mesh(
            this.unitSphere,
            material
          );

        mesh.frustumCulled =
          false;

        this.bodyMeshes.set(
          body.id,
          mesh
        );

        this.scene.add(
          mesh
        );
      }

      mesh.position.set(
        body.position.x,
        body.position.y,
        body.position.z
      );

      mesh.scale.setScalar(
        body.radius
      );

      mesh.material.color.setRGB(
        body.color.r,
        body.color.g,
        body.color.b
      );
    }
  }

  private updateOrbits(
    orbits:
      readonly UniverseRenderOrbit[]
  ): void {
    const activeIds =
      new Set(
        orbits.map(
          (
            orbit
          ) =>
            orbit.id
        )
      );

    for (
      const [
        id,
        line
      ] of
        this.orbitLines
    ) {
      if (
        !activeIds.has(id)
      ) {
        this.scene.remove(
          line
        );

        line.geometry.dispose();
        line.material.dispose();

        this.orbitLines.delete(
          id
        );
      }
    }

    for (
      const orbit of orbits
    ) {
      let line =
        this.orbitLines.get(
          orbit.id
        );

      if (
        line === undefined
      ) {
        const geometry =
          new BufferGeometry();

        const material =
          new LineBasicMaterial({
            color:
              new Color(
                orbit.color.r,
                orbit.color.g,
                orbit.color.b
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

        line.frustumCulled =
          false;

        this.orbitLines.set(
          orbit.id,
          line
        );

        this.scene.add(
          line
        );
      }

      const positions =
        new Float32Array(
          ORBIT_SEGMENTS *
          3
        );

      for (
        let index = 0;
        index <
        ORBIT_SEGMENTS;
        index += 1
      ) {
        const angle =
          (
            index /
            ORBIT_SEGMENTS
          ) *
          Math.PI *
          2;

        const offset =
          index *
          3;

        positions[offset] =
          orbit.center.x +
          Math.cos(
            angle
          ) *
          orbit.radius;

        positions[
          offset + 1
        ] =
          orbit.center.y;

        positions[
          offset + 2
        ] =
          orbit.center.z +
          Math.sin(
            angle
          ) *
          orbit.radius;
      }

      line.geometry
        .setAttribute(
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

  public dispose():
    void {
    for (
      const mesh of
        this.bodyMeshes.values()
    ) {
      this.scene.remove(
        mesh
      );

      mesh.material.dispose();
    }

    for (
      const line of
        this.orbitLines.values()
    ) {
      this.scene.remove(
        line
      );

      line.geometry.dispose();
      line.material.dispose();
    }

    this.bodyMeshes.clear();
    this.orbitLines.clear();

    this.unitSphere.dispose();

    if (
      this.renderer !== null
    ) {
      this.renderer.dispose();
      this.renderer = null;
    }
  }

  private requireRenderer():
    WebGPURenderer {
    if (
      this.renderer === null
    ) {
      throw new Error(
        "ThreeUniverseBackend must be initialized before rendering."
      );
    }

    return this.renderer;
  }
}
