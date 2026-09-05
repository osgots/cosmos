import "./continuousRealityZoom.css";

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

type ScaleId =
  typeof SCALE_IDS[number];

type ZoomDirection =
  | "OUT"
  | "IN";

const WHEEL_THRESHOLD = 620;
const PINCH_LOG_THRESHOLD = 0.72;
const TRANSITION_COOLDOWN_MS = 520;

function currentScaleId():
  ScaleId | null {
  const prefix = "#/scale/";

  if (
    !window.location.hash.startsWith(
      prefix
    )
  ) {
    return null;
  }

  const id =
    window.location.hash.slice(
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
  const index =
    SCALE_IDS.indexOf(id);

  const nextIndex =
    direction === "OUT"
      ? index + 1
      : index - 1;

  return SCALE_IDS[
    nextIndex
  ] ?? null;
}

function updateHud(
  hud: HTMLElement
): void {
  const id =
    currentScaleId();

  if (id === null) {
    hud.dataset.visible = "false";
    return;
  }

  hud.dataset.visible = "true";

  const index =
    SCALE_IDS.indexOf(id);

  const label =
    hud.querySelector<HTMLElement>(
      "[data-reality-label]"
    );

  const fill =
    hud.querySelector<HTMLElement>(
      "[data-reality-fill]"
    );

  if (label !== null) {
    label.textContent =
      `${String(index + 1).padStart(2, "0")}/${SCALE_IDS.length} · ${id.replaceAll("-", " ").toUpperCase()}`;
  }

  if (fill !== null) {
    const progress =
      SCALE_IDS.length <= 1
        ? 0
        : index /
          (SCALE_IDS.length - 1);

    fill.style.transform =
      `scaleX(${progress})`;
  }
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

    const buttons =
      Array.from(
        document.querySelectorAll<HTMLButtonElement>(
          ".ue-focus-row button"
        )
      );

    const button =
      buttons.find(
        candidate =>
          candidate.textContent
            ?.trim()
            .toUpperCase() ===
          desired
      );

    if (button !== undefined) {
      button.click();
      return;
    }

    if (attempts < 10) {
      window.setTimeout(
        apply,
        60
      );
    }
  };

  window.setTimeout(
    apply,
    0
  );
}

export function installContinuousRealityZoom():
  () => void {
  const hud =
    document.createElement("div");

  hud.className =
    "cosmos-reality-zoom-hud";

  hud.innerHTML = `
    <div class="cosmos-reality-zoom-title">REALITY ZOOM</div>
    <div class="cosmos-reality-zoom-label" data-reality-label></div>
    <div class="cosmos-reality-zoom-track" aria-hidden="true">
      <div class="cosmos-reality-zoom-fill" data-reality-fill></div>
    </div>
    <div class="cosmos-reality-zoom-hint">ZOOM OUT → ∞ · ZOOM IN → HUMAN</div>
  `;

  document.body.append(hud);

  let wheelAccumulation = 0;
  let wheelDirection:
    ZoomDirection | null = null;
  let pinchLogAccumulation = 0;
  let previousPinchDistance:
    number | null = null;
  let lastTransitionAt = 0;

  const pointers =
    new Map<
      number,
      {
        readonly x: number;
        readonly y: number;
      }
    >();

  const transition = (
    direction: ZoomDirection
  ): void => {
    const now =
      performance.now();

    if (
      now - lastTransitionAt <
      TRANSITION_COOLDOWN_MS
    ) {
      return;
    }

    const current =
      currentScaleId();

    if (current === null) {
      return;
    }

    const next =
      adjacentScale(
        current,
        direction
      );

    if (next === null) {
      return;
    }

    lastTransitionAt = now;
    wheelAccumulation = 0;
    pinchLogAccumulation = 0;

    window.location.hash =
      `/scale/${next}`;

    window.setTimeout(
      () => {
        updateHud(hud);
        syncUniverseFocus(next);
      },
      20
    );
  };

  const handleWheel = (
    event: WheelEvent
  ): void => {
    if (
      currentScaleId() === null
    ) {
      return;
    }

    const direction:
      ZoomDirection =
        event.deltaY > 0
          ? "OUT"
          : "IN";

    if (
      wheelDirection !==
      direction
    ) {
      wheelAccumulation = 0;
      wheelDirection = direction;
    }

    wheelAccumulation +=
      Math.abs(event.deltaY);

    if (
      wheelAccumulation >=
      WHEEL_THRESHOLD
    ) {
      transition(direction);
    }
  };

  const handlePointerDown = (
    event: PointerEvent
  ): void => {
    if (
      currentScaleId() === null
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
      const active =
        Array.from(
          pointers.values()
        );

      previousPinchDistance =
        Math.hypot(
          active[1]!.x -
          active[0]!.x,
          active[1]!.y -
          active[0]!.y
        );

      pinchLogAccumulation = 0;
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

    const active =
      Array.from(
        pointers.values()
      );

    const distance =
      Math.hypot(
        active[1]!.x -
        active[0]!.x,
        active[1]!.y -
        active[0]!.y
      );

    if (
      previousPinchDistance !== null &&
      previousPinchDistance > 0 &&
      distance > 0
    ) {
      const logRatio =
        Math.log(
          distance /
          previousPinchDistance
        );

      pinchLogAccumulation +=
        logRatio;

      if (
        Math.abs(
          pinchLogAccumulation
        ) >=
        PINCH_LOG_THRESHOLD
      ) {
        transition(
          pinchLogAccumulation < 0
            ? "OUT"
            : "IN"
        );
      }
    }

    previousPinchDistance =
      distance;
  };

  const releasePointer = (
    event: PointerEvent
  ): void => {
    pointers.delete(
      event.pointerId
    );

    if (pointers.size < 2) {
      previousPinchDistance = null;
      pinchLogAccumulation = 0;
    }
  };

  const handleHashChange =
    (): void => {
      wheelAccumulation = 0;
      wheelDirection = null;
      pinchLogAccumulation = 0;
      updateHud(hud);

      const id =
        currentScaleId();

      if (id !== null) {
        syncUniverseFocus(id);
      }
    };

  window.addEventListener(
    "wheel",
    handleWheel,
    {
      capture: true,
      passive: true
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
    true
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

  const initial =
    currentScaleId();

  if (initial !== null) {
    syncUniverseFocus(initial);
  }

  return () => {
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

    hud.remove();
  };
}
