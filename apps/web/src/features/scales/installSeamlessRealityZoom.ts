import "./seamlessRealityZoom.css";

const SCALE_IDS = [
  "human",
  "earth",
  "moon",
  "solar-system",
  "nearby-stars",
  "milky-way",
  "local-group",
  "clusters",
  "superclusters",
  "cosmic-web",
  "observable-universe",
  "beyond",
  "infinity"
] as const;

type ScaleId = typeof SCALE_IDS[number];
type ZoomDirection = "OUT" | "IN";

interface Point2 {
  readonly x: number;
  readonly y: number;
}

const WHEEL_THRESHOLD = 190;
const PINCH_LOG_THRESHOLD = 0.22;
const TRANSITION_COOLDOWN_MS = 105;
const GESTURE_IDLE_MS = 90;
const SNAPSHOT_DURATION_MS = 180;

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.max(
    minimum,
    Math.min(maximum, value)
  );
}

function currentScaleId(): ScaleId | null {
  const prefix = "#/scale/";

  if (!window.location.hash.startsWith(prefix)) {
    return null;
  }

  const id = window.location.hash.slice(
    prefix.length
  ) as ScaleId;

  return SCALE_IDS.includes(id)
    ? id
    : null;
}

function adjacentScale(
  id: ScaleId,
  direction: ZoomDirection
): ScaleId | null {
  const index = SCALE_IDS.indexOf(id);
  const nextIndex =
    direction === "OUT"
      ? index + 1
      : index - 1;

  return SCALE_IDS[nextIndex] ?? null;
}

function activeSceneCanvas():
  HTMLCanvasElement | null {
  return document.querySelector<HTMLCanvasElement>(
    ".cosmos-scale-experience .ue-canvas, .cosmos-scale-experience .cse-canvas"
  );
}

function isUiTarget(
  target: EventTarget | null
): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return target.closest(
    [
      "button",
      "input",
      "select",
      "textarea",
      "a",
      ".ue-controls",
      ".ue-camera-tools",
      ".cse-camera",
      ".cse-deep-dive",
      ".cse-info",
      ".cosmos-scale-stepper",
      ".cosmos-back-home"
    ].join(",")
  ) !== null;
}

function isSceneTarget(
  target: EventTarget | null
): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  if (isUiTarget(target)) {
    return false;
  }

  return target.closest(
    ".ue-canvas, .cse-canvas, .ue-shell, .cse-shell, .cosmos-scale-experience"
  ) !== null;
}

function wheelPixels(
  event: WheelEvent
): number {
  const unit =
    event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? Math.max(320, window.innerHeight)
        : 1;

  return event.deltaY * unit;
}

function updateHud(
  hud: HTMLElement,
  direction: ZoomDirection | null = null,
  gestureProgress = 0
): void {
  const id = currentScaleId();

  if (id === null) {
    hud.dataset.visible = "false";
    return;
  }

  hud.dataset.visible = "true";

  const index = SCALE_IDS.indexOf(id);
  const label =
    hud.querySelector<HTMLElement>(
      "[data-reality-label]"
    );
  const fill =
    hud.querySelector<HTMLElement>(
      "[data-reality-fill]"
    );
  const motion =
    hud.querySelector<HTMLElement>(
      "[data-reality-motion]"
    );

  if (label !== null) {
    label.textContent =
      `${String(index + 1).padStart(2, "0")}/${SCALE_IDS.length} · ${id.replaceAll("-", " ").toUpperCase()}`;
  }

  if (motion !== null) {
    motion.textContent =
      direction === null || gestureProgress < 0.01
        ? "CONTINUOUS SCALE"
        : `${direction === "OUT" ? "ZOOMING OUT" : "ZOOMING IN"} · ${Math.round(gestureProgress * 100)}%`;
  }

  if (fill !== null) {
    const stageProgress =
      index / Math.max(1, SCALE_IDS.length - 1);
    const stageStep =
      1 / Math.max(1, SCALE_IDS.length - 1);
    const signedGesture =
      direction === "OUT"
        ? gestureProgress * stageStep
        : direction === "IN"
          ? -gestureProgress * stageStep
          : 0;

    fill.style.transform =
      `scaleX(${clamp(stageProgress + signedGesture, 0, 1)})`;
  }
}

function setScenePreview(
  direction: ZoomDirection,
  progress: number,
  origin: Point2,
  lens: HTMLElement
): void {
  const canvas = activeSceneCanvas();

  if (canvas === null) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const normalized = clamp(progress, 0, 1);
  const localX = clamp(
    ((origin.x - rect.left) /
      Math.max(1, rect.width)) * 100,
    0,
    100
  );
  const localY = clamp(
    ((origin.y - rect.top) /
      Math.max(1, rect.height)) * 100,
    0,
    100
  );

  const scale =
    direction === "OUT"
      ? Math.exp(-0.72 * normalized)
      : Math.exp(0.72 * normalized);

  canvas.dataset.realityZooming = "true";
  canvas.style.setProperty(
    "--reality-scene-scale",
    String(scale)
  );
  canvas.style.setProperty(
    "--reality-scene-origin-x",
    `${localX}%`
  );
  canvas.style.setProperty(
    "--reality-scene-origin-y",
    `${localY}%`
  );
  canvas.style.setProperty(
    "--reality-scene-depth",
    String(normalized)
  );

  lens.dataset.active =
    normalized > 0.01
      ? "true"
      : "false";
  lens.dataset.direction = direction;
  lens.style.setProperty(
    "--reality-lens-opacity",
    String(0.03 + normalized * 0.32)
  );
  lens.style.setProperty(
    "--reality-lens-x",
    `${clamp(origin.x / Math.max(1, window.innerWidth) * 100, 0, 100)}%`
  );
  lens.style.setProperty(
    "--reality-lens-y",
    `${clamp(origin.y / Math.max(1, window.innerHeight) * 100, 0, 100)}%`
  );
}

function clearScenePreview(
  lens: HTMLElement
): void {
  const canvas = activeSceneCanvas();

  if (canvas !== null) {
    delete canvas.dataset.realityZooming;
    canvas.style.removeProperty(
      "--reality-scene-scale"
    );
    canvas.style.removeProperty(
      "--reality-scene-origin-x"
    );
    canvas.style.removeProperty(
      "--reality-scene-origin-y"
    );
    canvas.style.removeProperty(
      "--reality-scene-depth"
    );
  }

  lens.dataset.active = "false";
  lens.style.setProperty(
    "--reality-lens-opacity",
    "0"
  );
}

function captureSceneSnapshot(
  snapshot: HTMLCanvasElement,
  origin: Point2
): boolean {
  const source = activeSceneCanvas();

  if (source === null) {
    return false;
  }

  const rect = source.getBoundingClientRect();

  if (
    rect.width <= 0 ||
    rect.height <= 0 ||
    source.width <= 0 ||
    source.height <= 0
  ) {
    return false;
  }

  const pixelRatio = Math.min(
    1.5,
    window.devicePixelRatio || 1
  );

  snapshot.width = Math.max(
    1,
    Math.round(rect.width * pixelRatio)
  );
  snapshot.height = Math.max(
    1,
    Math.round(rect.height * pixelRatio)
  );

  snapshot.style.left = `${rect.left}px`;
  snapshot.style.top = `${rect.top}px`;
  snapshot.style.width = `${rect.width}px`;
  snapshot.style.height = `${rect.height}px`;

  const localX = clamp(
    ((origin.x - rect.left) /
      Math.max(1, rect.width)) * 100,
    0,
    100
  );
  const localY = clamp(
    ((origin.y - rect.top) /
      Math.max(1, rect.height)) * 100,
    0,
    100
  );

  snapshot.style.transformOrigin =
    `${localX}% ${localY}%`;

  const context = snapshot.getContext("2d");

  if (context === null) {
    return false;
  }

  context.setTransform(
    pixelRatio,
    0,
    0,
    pixelRatio,
    0,
    0
  );
  context.clearRect(
    0,
    0,
    rect.width,
    rect.height
  );

  try {
    context.drawImage(
      source,
      0,
      0,
      rect.width,
      rect.height
    );
  } catch {
    return false;
  }

  snapshot.dataset.visible = "true";
  return true;
}

function animateSnapshotAway(
  snapshot: HTMLCanvasElement,
  direction: ZoomDirection
): void {
  if (snapshot.dataset.visible !== "true") {
    return;
  }

  const endScale =
    direction === "OUT"
      ? 0.46
      : 1.85;

  const animation = snapshot.animate(
    [
      {
        transform: "scale(1)",
        opacity: 1,
        filter: "blur(0px)"
      },
      {
        transform: `scale(${endScale})`,
        opacity: 0,
        filter: "blur(2px)"
      }
    ],
    {
      duration: SNAPSHOT_DURATION_MS,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"
    }
  );

  void animation.finished
    .catch(() => undefined)
    .finally(() => {
      snapshot.dataset.visible = "false";
    });
}

function animateNewSceneIn(
  direction: ZoomDirection
): void {
  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    return;
  }

  const canvas = activeSceneCanvas();

  if (canvas === null) {
    return;
  }

  const startScale =
    direction === "OUT"
      ? 1.42
      : 0.7;

  canvas.animate(
    [
      {
        transform: `scale(${startScale})`,
        opacity: 0.34,
        filter: "blur(2px)"
      },
      {
        transform: "scale(1)",
        opacity: 1,
        filter: "blur(0px)"
      }
    ],
    {
      duration: 175,
      easing: "cubic-bezier(0.16, 0.84, 0.24, 1)"
    }
  );
}

function syncUniverseFocus(
  id: ScaleId
): void {
  const desired =
    id === "earth"
      ? "EARTH"
      : id === "moon"
        ? "MOON"
        : id === "solar-system"
          ? "SUN"
          : null;

  if (desired === null) {
    return;
  }

  let attempts = 0;

  const apply = (): void => {
    attempts += 1;

    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        ".ue-focus-row button"
      )
    );

    const button = buttons.find(
      candidate =>
        candidate.textContent
          ?.trim()
          .toUpperCase() === desired
    );

    if (
      button !== undefined &&
      button.getAttribute("aria-pressed") !== "true"
    ) {
      button.click();
      return;
    }

    if (
      button === undefined &&
      attempts < 10
    ) {
      window.setTimeout(apply, 28);
    }
  };

  window.setTimeout(apply, 0);
}

export function installSeamlessRealityZoom():
  () => void {
  const hud = document.createElement("div");
  hud.className = "cosmos-reality-zoom-hud";
  hud.innerHTML = `
    <div class="cosmos-reality-zoom-topline">
      <span class="cosmos-reality-zoom-title">REALITY ZOOM</span>
      <span class="cosmos-reality-zoom-motion" data-reality-motion>CONTINUOUS SCALE</span>
    </div>
    <div class="cosmos-reality-zoom-label" data-reality-label></div>
    <div class="cosmos-reality-zoom-track" aria-hidden="true">
      <div class="cosmos-reality-zoom-fill" data-reality-fill></div>
    </div>
    <div class="cosmos-reality-zoom-hint">WHEEL / PINCH · HUMAN ⇄ ∞</div>
  `;

  const lens = document.createElement("div");
  lens.className = "cosmos-reality-lens";
  lens.dataset.active = "false";
  lens.setAttribute("aria-hidden", "true");
  lens.innerHTML = `
    <div class="cosmos-reality-lens-core"></div>
    <div class="cosmos-reality-lens-streaks"></div>
  `;

  const snapshot = document.createElement("canvas");
  snapshot.className = "cosmos-reality-snapshot";
  snapshot.dataset.visible = "false";
  snapshot.setAttribute("aria-hidden", "true");

  document.body.append(
    snapshot,
    lens,
    hud
  );

  let wheelAccumulation = 0;
  let wheelDirection:
    ZoomDirection | null = null;
  let pinchLogAccumulation = 0;
  let previousPinchDistance:
    number | null = null;
  let lastTransitionAt = 0;
  let pendingDirection:
    ZoomDirection | null = null;
  let idleTimer = 0;
  let lastOrigin: Point2 = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5
  };

  const pointers = new Map<number, Point2>();

  const clearIdleTimer = (): void => {
    if (idleTimer !== 0) {
      window.clearTimeout(idleTimer);
      idleTimer = 0;
    }
  };

  const resetGesture = (): void => {
    wheelAccumulation = 0;
    wheelDirection = null;
    pinchLogAccumulation = 0;
    previousPinchDistance = null;
    updateHud(hud);
    clearScenePreview(lens);
  };

  const scheduleReset = (): void => {
    clearIdleTimer();
    idleTimer = window.setTimeout(
      () => {
        resetGesture();
        idleTimer = 0;
      },
      GESTURE_IDLE_MS
    );
  };

  const transition = (
    direction: ZoomDirection
  ): boolean => {
    const now = performance.now();

    if (
      now - lastTransitionAt <
      TRANSITION_COOLDOWN_MS
    ) {
      return false;
    }

    const current = currentScaleId();

    if (current === null) {
      return false;
    }

    const next = adjacentScale(
      current,
      direction
    );

    if (next === null) {
      resetGesture();
      return false;
    }

    clearIdleTimer();
    lastTransitionAt = now;
    pendingDirection = direction;

    captureSceneSnapshot(
      snapshot,
      lastOrigin
    );

    setScenePreview(
      direction,
      1,
      lastOrigin,
      lens
    );
    lens.dataset.switching = "true";
    lens.style.setProperty(
      "--reality-lens-opacity",
      "0.46"
    );

    wheelAccumulation = 0;
    pinchLogAccumulation = 0;

    window.location.hash =
      `/scale/${next}`;

    return true;
  };

  const handleWheel = (
    event: WheelEvent
  ): void => {
    if (
      currentScaleId() === null ||
      !isSceneTarget(event.target)
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const pixels = wheelPixels(event);

    if (pixels === 0) {
      return;
    }

    const direction:
      ZoomDirection =
        pixels > 0
          ? "OUT"
          : "IN";

    if (wheelDirection !== direction) {
      wheelAccumulation = 0;
      wheelDirection = direction;
    }

    lastOrigin = {
      x: event.clientX,
      y: event.clientY
    };

    wheelAccumulation += Math.min(
      150,
      Math.abs(pixels)
    );

    const progress = clamp(
      wheelAccumulation /
        WHEEL_THRESHOLD,
      0,
      1
    );

    setScenePreview(
      direction,
      progress,
      lastOrigin,
      lens
    );
    updateHud(
      hud,
      direction,
      progress
    );

    if (progress >= 1) {
      transition(direction);
      return;
    }

    scheduleReset();
  };

  const handlePointerDown = (
    event: PointerEvent
  ): void => {
    if (
      currentScaleId() === null ||
      !isSceneTarget(event.target)
    ) {
      return;
    }

    pointers.set(
      event.pointerId,
      {
        x: event.clientX,
        y: event.clientY
      }
    );

    if (pointers.size === 2) {
      const active = Array.from(
        pointers.values()
      );

      previousPinchDistance = Math.hypot(
        active[1]!.x - active[0]!.x,
        active[1]!.y - active[0]!.y
      );

      lastOrigin = {
        x: (active[0]!.x + active[1]!.x) * 0.5,
        y: (active[0]!.y + active[1]!.y) * 0.5
      };
      pinchLogAccumulation = 0;
    }
  };

  const handlePointerMove = (
    event: PointerEvent
  ): void => {
    if (!pointers.has(event.pointerId)) {
      return;
    }

    pointers.set(
      event.pointerId,
      {
        x: event.clientX,
        y: event.clientY
      }
    );

    if (pointers.size !== 2) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();

    const active = Array.from(
      pointers.values()
    );
    const distance = Math.hypot(
      active[1]!.x - active[0]!.x,
      active[1]!.y - active[0]!.y
    );

    lastOrigin = {
      x: (active[0]!.x + active[1]!.x) * 0.5,
      y: (active[0]!.y + active[1]!.y) * 0.5
    };

    if (
      previousPinchDistance !== null &&
      previousPinchDistance > 0 &&
      distance > 0
    ) {
      pinchLogAccumulation += Math.log(
        distance /
          previousPinchDistance
      );

      const direction:
        ZoomDirection =
          pinchLogAccumulation < 0
            ? "OUT"
            : "IN";
      const progress = clamp(
        Math.abs(pinchLogAccumulation) /
          PINCH_LOG_THRESHOLD,
        0,
        1
      );

      setScenePreview(
        direction,
        progress,
        lastOrigin,
        lens
      );
      updateHud(
        hud,
        direction,
        progress
      );

      if (progress >= 1) {
        transition(direction);
      }
    }

    previousPinchDistance = distance;
  };

  const releasePointer = (
    event: PointerEvent
  ): void => {
    pointers.delete(event.pointerId);

    if (pointers.size < 2) {
      previousPinchDistance = null;

      if (pendingDirection === null) {
        scheduleReset();
      }
    }
  };

  const handleHashChange = (): void => {
    clearIdleTimer();
    wheelAccumulation = 0;
    wheelDirection = null;
    pinchLogAccumulation = 0;
    previousPinchDistance = null;

    const id = currentScaleId();
    updateHud(hud);

    if (id !== null) {
      syncUniverseFocus(id);
    }

    const direction = pendingDirection;

    if (direction === null) {
      clearScenePreview(lens);
      return;
    }

    pendingDirection = null;
    clearScenePreview(lens);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        animateSnapshotAway(
          snapshot,
          direction
        );
        animateNewSceneIn(direction);

        lens.dataset.switching = "false";
        lens.animate(
          [
            { opacity: 0.42 },
            { opacity: 0 }
          ],
          {
            duration: 130,
            easing: "ease-out"
          }
        );
      });
    });
  };

  window.addEventListener(
    "wheel",
    handleWheel,
    {
      capture: true,
      passive: false
    }
  );
  window.addEventListener(
    "pointerdown",
    handlePointerDown,
    true
  );
  window.addEventListener(
    "pointermove",
    handlePointerMove,
    {
      capture: true,
      passive: false
    }
  );
  window.addEventListener(
    "pointerup",
    releasePointer,
    true
  );
  window.addEventListener(
    "pointercancel",
    releasePointer,
    true
  );
  window.addEventListener(
    "hashchange",
    handleHashChange
  );

  updateHud(hud);

  const initial = currentScaleId();
  if (initial !== null) {
    syncUniverseFocus(initial);
  }

  return () => {
    clearIdleTimer();

    window.removeEventListener(
      "wheel",
      handleWheel,
      true
    );
    window.removeEventListener(
      "pointerdown",
      handlePointerDown,
      true
    );
    window.removeEventListener(
      "pointermove",
      handlePointerMove,
      true
    );
    window.removeEventListener(
      "pointerup",
      releasePointer,
      true
    );
    window.removeEventListener(
      "pointercancel",
      releasePointer,
      true
    );
    window.removeEventListener(
      "hashchange",
      handleHashChange
    );

    snapshot.remove();
    lens.remove();
    hud.remove();
  };
}
