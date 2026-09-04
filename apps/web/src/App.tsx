import {
  useEffect,
  useState
} from "react";

import TesseractLab from "./features/dimensions/TesseractLab";
import CosmicScaleExplorer, {
  COSMIC_SCALE_STAGES
} from "./features/scales/CosmicScaleExplorer";

import type {
  CosmicScaleId
} from "./features/scales/CosmicScaleExplorer";

import UniverseExplorer from "./features/universe/UniverseExplorer";

import "./App.css";
import "./mobile.css";

type CosmosExperience =
  | "HOME"
  | "UNIVERSE"
  | "SCALE"
  | "4D_LAB";

const HOME_SCROLL_KEY =
  "cosmos-home-scroll";

function isCosmicScaleId(
  value: string
): value is CosmicScaleId {
  return COSMIC_SCALE_STAGES.some(
    stage =>
      stage.id === value
  );
}

function scaleFromLocation():
  CosmicScaleId | null {
  const prefix =
    "#/scale/";

  if (
    !window.location.hash.startsWith(
      prefix
    )
  ) {
    return null;
  }

  const value =
    window.location.hash.slice(
      prefix.length
    );

  return isCosmicScaleId(value)
    ? value
    : null;
}

function routeFromLocation():
  CosmosExperience {
  if (
    window.location.hash ===
    "#/universe"
  ) {
    return "UNIVERSE";
  }

  if (
    window.location.hash ===
    "#/4d-lab"
  ) {
    return "4D_LAB";
  }

  if (
    scaleFromLocation() !==
    null
  ) {
    return "SCALE";
  }

  return "HOME";
}

function saveHomeScroll():
  void {
  try {
    sessionStorage.setItem(
      HOME_SCROLL_KEY,
      String(
        window.scrollY
      )
    );
  } catch {
    // Session storage is optional.
  }
}

function readHomeScroll():
  number {
  try {
    const stored =
      sessionStorage.getItem(
        HOME_SCROLL_KEY
      );

    if (stored === null) {
      return 0;
    }

    const value =
      Number(stored);

    return Number.isFinite(value)
      ? Math.max(
          0,
          value
        )
      : 0;
  } catch {
    return 0;
  }
}

function restoreHomeScroll():
  void {
  const target =
    readHomeScroll();

  requestAnimationFrame(
    () => {
      requestAnimationFrame(
        () => {
          window.scrollTo({
            top: target,
            left: 0,
            behavior: "instant"
          });
        }
      );
    }
  );
}

interface CosmosHomeProps {
  readonly onOpenScale:
    (
      stageId: CosmicScaleId
    ) => void;

  readonly onOpen4D:
    () => void;

  readonly onScrollTo:
    (
      sectionId: string
    ) => void;
}

function CosmosHome({
  onOpenScale,
  onOpen4D,
  onScrollTo
}: CosmosHomeProps) {
  return (
    <main className="universe-home">
      <div
        className="universe-grid"
        aria-hidden="true"
      />

      <header className="universe-nav">
        <button
          type="button"
          className="universe-logo"
          onClick={
            () =>
              window.scrollTo({
                top: 0,
                behavior: "smooth"
              })
          }
          aria-label="Return to the top of Cosmos Infinity"
        >
          COSMOS
          <span>∞</span>
        </button>

        <nav
          aria-label="Cosmos Infinity navigation"
        >
          <button
            type="button"
            onClick={
              () =>
                onScrollTo(
                  "journey"
                )
            }
          >
            EXPLORE
          </button>

          <button
            type="button"
            onClick={
              onOpen4D
            }
          >
            4D LAB
          </button>

          <button
            type="button"
            onClick={
              () =>
                onScrollTo(
                  "science"
                )
            }
          >
            SCIENCE
          </button>
        </nav>
      </header>

      <section className="universe-hero">
        <div className="universe-eyebrow">
          INTERACTIVE REALITY ENGINE
        </div>

        <h1>
          Explore reality
          <br />

          <span>
            without a final edge.
          </span>
        </h1>

        <p>
          Travel continuously from human scale through
          planets, stars, galaxies, the cosmic web and
          the observable universe — then continue beyond
          the horizon only with clearly labelled
          physics-constrained models.
        </p>

        <div className="universe-hero-actions">
          <button
            type="button"
            className="universe-primary-button"
            onClick={
              () =>
                onOpenScale(
                  "human"
                )
            }
          >
            BEGIN JOURNEY

            <span>
              ↓
            </span>
          </button>

          <button
            type="button"
            className="universe-secondary-button"
            onClick={
              onOpen4D
            }
          >
            ENTER 4D LAB
          </button>
        </div>

        <div className="universe-origin">
          <span
            className="universe-origin-dot"
            aria-hidden="true"
          />

          <span>
            CURRENT FOUNDATION
          </span>

          <strong>
            SCALE ENGINE + TRUE R⁴ GEOMETRY ACTIVE
          </strong>
        </div>
      </section>

      <section
        id="journey"
        className="universe-journey"
      >
        <header className="universe-section-heading">
          <span>
            SCALE JOURNEY
          </span>

          <h2>
            From you to ∞
          </h2>

          <p>
            Every level below now opens an interactive
            scientific environment. Observed structure,
            modelled structure and extrapolation remain
            explicitly separated.
          </p>
        </header>

        <div className="universe-scale-path">
          {COSMIC_SCALE_STAGES.map(
            (
              destination,
              index
            ) => (
              <button
                key={
                  destination.id
                }
                type="button"
                className="universe-scale-node"
                data-status="READY"
                onClick={
                  () =>
                    onOpenScale(
                      destination.id
                    )
                }
              >
                <div className="universe-scale-index">
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div className="universe-scale-content">
                  <div className="universe-scale-meta">
                    <span>
                      READY · {
                        destination
                          .scienceStatus
                      }
                    </span>
                  </div>

                  <h3>
                    {
                      destination.title
                    }
                  </h3>

                  <p>
                    {
                      destination.subtitle
                    }
                  </p>

                  <div className="universe-scale-open">
                    OPEN SCALE
                    <b>↗</b>
                  </div>
                </div>
              </button>
            )
          )}
        </div>
      </section>

      <section className="universe-dimensions-section">
        <div>
          <span className="universe-section-label">
            DIMENSIONS LAB
          </span>

          <h2>
            Space doesn't stop at three.
          </h2>

          <p>
            Our scientific laboratory performs real
            four-dimensional rotations, projection and
            geometric slicing rather than animating a
            fake 3D cube.
          </p>
        </div>

        <button
          type="button"
          className="universe-lab-card"
          onClick={
            onOpen4D
          }
        >
          <span>
            LIVE LAB 01
          </span>

          <strong>
            FOUR-DIMENSIONAL
            <br />
            TESSERACT
          </strong>

          <small>
            16 vertices · 32 edges · 6 rotation planes
          </small>

          <div>
            OPEN EXPERIMENT
            <b>↗</b>
          </div>
        </button>
      </section>

      <section
        id="science"
        className="universe-science"
      >
        <header className="universe-section-heading">
          <span>
            SCIENTIFIC HONESTY
          </span>

          <h2>
            Know what you're looking at.
          </h2>
        </header>

        <div className="universe-science-grid">
          <article>
            <span>01</span>
            <h3>OBSERVED</h3>
            <p>
              Directly supported by observational
              evidence.
            </p>
          </article>

          <article>
            <span>02</span>
            <h3>ESTABLISHED MODEL</h3>
            <p>
              Standard scientific models with their
              assumptions exposed.
            </p>
          </article>

          <article>
            <span>03</span>
            <h3>EXTRAPOLATED</h3>
            <p>
              Physics-constrained continuation where
              observation can no longer reach.
            </p>
          </article>

          <article>
            <span>04</span>
            <h3>SPECULATIVE</h3>
            <p>
              Clearly separated from established
              physics and observation.
            </p>
          </article>
        </div>
      </section>

      <footer className="universe-footer">
        <strong>
          COSMOS∞
        </strong>

        <span>
          THE UNIVERSE IS NOT A FINAL SCREEN.
        </span>
      </footer>
    </main>
  );
}

function App() {
  const [
    experience,
    setExperience
  ] =
    useState<CosmosExperience>(
      () =>
        routeFromLocation()
    );

  const [
    scaleId,
    setScaleId
  ] =
    useState<CosmicScaleId>(
      () =>
        scaleFromLocation() ??
        "human"
    );

  useEffect(
    () => {
      const experienceActive =
        experience !== "HOME";

      document.documentElement
        .classList
        .toggle(
          "cosmos-lab-active",
          experienceActive
        );

      document.body
        .classList
        .toggle(
          "cosmos-lab-active",
          experienceActive
        );

      return () => {
        document.documentElement
          .classList
          .remove(
            "cosmos-lab-active"
          );

        document.body
          .classList
          .remove(
            "cosmos-lab-active"
          );
      };
    },
    [experience]
  );

  useEffect(
    () => {
      const previousScrollRestoration =
        window.history
          .scrollRestoration;

      window.history
        .scrollRestoration =
          "manual";

      const handleHistoryNavigation =
        (): void => {
          const nextExperience =
            routeFromLocation();

          const nextScale =
            scaleFromLocation();

          if (
            nextScale !== null
          ) {
            setScaleId(
              nextScale
            );
          }

          setExperience(
            nextExperience
          );

          if (
            nextExperience ===
            "HOME"
          ) {
            restoreHomeScroll();
          }
        };

      window.addEventListener(
        "popstate",
        handleHistoryNavigation
      );

      window.addEventListener(
        "hashchange",
        handleHistoryNavigation
      );

      return () => {
        window.removeEventListener(
          "popstate",
          handleHistoryNavigation
        );

        window.removeEventListener(
          "hashchange",
          handleHistoryNavigation
        );

        window.history
          .scrollRestoration =
            previousScrollRestoration;
      };
    },
    []
  );

  function pushExperience(
    hash: string,
    nextExperience: CosmosExperience,
    state: Record<string, unknown>
  ): void {
    window.history.pushState(
      state,
      "",
      `${window.location.pathname}${window.location.search}${hash}`
    );

    setExperience(
      nextExperience
    );

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }

  function openUniverse():
    void {
    saveHomeScroll();

    pushExperience(
      "#/universe",
      "UNIVERSE",
      {
        cosmosRoute: "universe",
        cosmosFromHome: true
      }
    );
  }

  function openScaleFromHome(
    nextScaleId: CosmicScaleId
  ): void {
    saveHomeScroll();
    setScaleId(
      nextScaleId
    );

    pushExperience(
      `#/scale/${nextScaleId}`,
      "SCALE",
      {
        cosmosRoute:
          `scale/${nextScaleId}`,
        cosmosFromHome: true
      }
    );
  }

  function navigateScale(
    nextScaleId: CosmicScaleId
  ): void {
    setScaleId(
      nextScaleId
    );

    pushExperience(
      `#/scale/${nextScaleId}`,
      "SCALE",
      {
        cosmosRoute:
          `scale/${nextScaleId}`,
        cosmosFromHome: false
      }
    );
  }

  function open4D():
    void {
    saveHomeScroll();

    pushExperience(
      "#/4d-lab",
      "4D_LAB",
      {
        cosmosRoute: "4d-lab",
        cosmosFromHome: true
      }
    );
  }

  function returnFromExperience():
    void {
    const state =
      window.history.state as
        | {
            cosmosFromHome?:
              boolean;
          }
        | null;

    if (
      state?.cosmosFromHome ===
      true
    ) {
      window.history.back();
      return;
    }

    window.history.replaceState(
      {
        cosmosRoute: "home"
      },
      "",
      `${window.location.pathname}${window.location.search}#/`
    );

    setExperience(
      "HOME"
    );

    requestAnimationFrame(
      () => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant"
        });
      }
    );
  }

  function returnScaleHome():
    void {
    window.history.pushState(
      {
        cosmosRoute: "home"
      },
      "",
      `${window.location.pathname}${window.location.search}#/`
    );

    setExperience(
      "HOME"
    );
    restoreHomeScroll();
  }

  function scrollToSection(
    sectionId: string
  ): void {
    const section =
      document.getElementById(
        sectionId
      );

    section?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  if (
    experience ===
    "UNIVERSE"
  ) {
    return (
      <div className="cosmos-experience-wrapper">
        <UniverseExplorer />

        <button
          type="button"
          className="cosmos-back-home"
          onClick={
            returnFromExperience
          }
          aria-label="Return to Cosmos Infinity"
        >
          ← BACK TO COSMOS∞
        </button>
      </div>
    );
  }

  if (
    experience ===
    "4D_LAB"
  ) {
    return (
      <div className="cosmos-experience-wrapper">
        <TesseractLab />

        <button
          type="button"
          className="cosmos-back-home"
          onClick={
            returnFromExperience
          }
          aria-label="Return to previous Cosmos Infinity view"
        >
          ← BACK TO COSMOS∞
        </button>
      </div>
    );
  }

  if (
    experience ===
    "SCALE"
  ) {
    const stageIndex =
      COSMIC_SCALE_STAGES.findIndex(
        stage =>
          stage.id === scaleId
      );

    const previousStage =
      stageIndex > 0
        ? COSMIC_SCALE_STAGES[
            stageIndex - 1
          ]
        : null;

    const nextStage =
      stageIndex >= 0 &&
      stageIndex <
        COSMIC_SCALE_STAGES.length - 1
        ? COSMIC_SCALE_STAGES[
            stageIndex + 1
          ]
        : null;

    const useSolarSystemEngine =
      scaleId === "earth" ||
      scaleId === "moon" ||
      scaleId === "solar-system";

    return (
      <div className="cosmos-experience-wrapper cosmos-scale-experience">
        {useSolarSystemEngine
          ? <UniverseExplorer />
          : (
              <CosmicScaleExplorer
                stageId={scaleId}
              />
            )}

        <button
          type="button"
          className="cosmos-back-home"
          onClick={
            returnScaleHome
          }
          aria-label="Return to Cosmos Infinity scale journey"
        >
          ← BACK TO COSMOS∞
        </button>

        <nav
          className="cosmos-scale-stepper"
          aria-label="Cosmic scale journey navigation"
        >
          <button
            type="button"
            disabled={
              previousStage === null
            }
            onClick={
              () => {
                if (
                  previousStage !== null
                ) {
                  navigateScale(
                    previousStage.id
                  );
                }
              }
            }
          >
            ← PREVIOUS
          </button>

          <span>
            {String(
              stageIndex + 1
            ).padStart(
              2,
              "0"
            )}
            /
            {String(
              COSMIC_SCALE_STAGES.length
            ).padStart(
              2,
              "0"
            )}
          </span>

          <button
            type="button"
            disabled={
              nextStage === null
            }
            onClick={
              () => {
                if (
                  nextStage !== null
                ) {
                  navigateScale(
                    nextStage.id
                  );
                }
              }
            }
          >
            NEXT →
          </button>
        </nav>

        {scaleId ===
          "solar-system" && (
          <button
            type="button"
            className="cosmos-open-universe-engine"
            onClick={
              openUniverse
            }
          >
            OPEN DEDICATED SOLAR SYSTEM ENGINE ↗
          </button>
        )}
      </div>
    );
  }

  return (
    <CosmosHome
      onOpenScale={
        openScaleFromHome
      }
      onOpen4D={
        open4D
      }
      onScrollTo={
        scrollToSection
      }
    />
  );
}

export default App;
