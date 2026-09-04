import {
  useEffect,
  useState
} from "react";

import TesseractLab from "./features/dimensions/TesseractLab";

import "./App.css";
import "./mobile.css";

type CosmosExperience =
  | "HOME"
  | "4D_LAB";

interface ScaleDestination {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly status:
    | "READY"
    | "FOUNDATION"
    | "UPCOMING";
}

const SCALE_DESTINATIONS:
  readonly ScaleDestination[] = [
    {
      id: "human",
      title: "Human",
      subtitle: "Begin from the scale you know.",
      status: "UPCOMING"
    },
    {
      id: "earth",
      title: "Earth",
      subtitle: "Our planetary reference frame.",
      status: "FOUNDATION"
    },
    {
      id: "moon",
      title: "Moon",
      subtitle: "Earth's natural satellite.",
      status: "UPCOMING"
    },
    {
      id: "solar-system",
      title: "Solar System",
      subtitle: "From the Sun to the outer frontier.",
      status: "UPCOMING"
    },
    {
      id: "nearby-stars",
      title: "Nearby Stars",
      subtitle: "Enter the local stellar neighborhood.",
      status: "UPCOMING"
    },
    {
      id: "milky-way",
      title: "Milky Way",
      subtitle: "Our galactic structure.",
      status: "UPCOMING"
    },
    {
      id: "local-group",
      title: "Local Group",
      subtitle: "The neighborhood of galaxies around us.",
      status: "UPCOMING"
    },
    {
      id: "clusters",
      title: "Galaxy Clusters",
      subtitle: "Gravity on enormous scales.",
      status: "UPCOMING"
    },
    {
      id: "superclusters",
      title: "Superclusters",
      subtitle: "Structures spanning hundreds of millions of light-years.",
      status: "UPCOMING"
    },
    {
      id: "cosmic-web",
      title: "Cosmic Web",
      subtitle: "Filaments, walls and immense voids.",
      status: "UPCOMING"
    },
    {
      id: "observable-universe",
      title: "Observable Universe",
      subtitle: "The present cosmological horizon.",
      status: "UPCOMING"
    },
    {
      id: "beyond",
      title: "Beyond the Horizon",
      subtitle: "Physics-constrained continuation beyond observation.",
      status: "UPCOMING"
    },
    {
      id: "infinity",
      title: "∞",
      subtitle: "Exploration does not end at the visible universe.",
      status: "UPCOMING"
    }
  ];

const HOME_SCROLL_KEY =
  "cosmos-home-scroll";

function routeFromLocation():
  CosmosExperience {
  if (
    window.location.hash ===
    "#/4d-lab"
  ) {
    return "4D_LAB";
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

    if (
      stored === null
    ) {
      return 0;
    }

    const value =
      Number(stored);

    return Number.isFinite(
      value
    )
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

  /**
   * Two animation frames ensure the long homepage has been mounted
   * and laid out before the previous scroll position is restored.
   */
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
  readonly onOpen4D:
    () => void;

  readonly onScrollTo:
    (
      sectionId: string
    ) => void;
}

function CosmosHome({
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
          Travel from familiar human scales through
          planets, stars, galaxies, the cosmic web and
          the observable universe — then continue beyond
          the horizon using clearly labelled
          physics-constrained models.
        </p>

        <div className="universe-hero-actions">
          <button
            type="button"
            className="universe-primary-button"
            onClick={
              () =>
                onScrollTo(
                  "journey"
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
            TRUE R⁴ GEOMETRY ACTIVE
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
            Each level will become an interactive
            scientific environment rather than a
            static page.
          </p>
        </header>

        <div className="universe-scale-path">
          {SCALE_DESTINATIONS.map(
            (
              destination,
              index
            ) => (
              <article
                key={
                  destination.id
                }
                className="universe-scale-node"
                data-status={
                  destination.status
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
                      {
                        destination.status
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
                </div>
              </article>
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
            Our first working scientific laboratory
            performs real four-dimensional rotations,
            projection and geometric slicing rather
            than animating a fake 3D cube.
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

            <h3>
              OBSERVED
            </h3>

            <p>
              Directly supported by observational
              evidence.
            </p>
          </article>

          <article>
            <span>02</span>

            <h3>
              ESTABLISHED MODEL
            </h3>

            <p>
              Standard scientific models with their
              assumptions exposed.
            </p>
          </article>

          <article>
            <span>03</span>

            <h3>
              EXTRAPOLATED
            </h3>

            <p>
              Physics-constrained continuation where
              observation can no longer reach.
            </p>
          </article>

          <article>
            <span>04</span>

            <h3>
              SPECULATIVE
            </h3>

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

  /**
   * HOME:
   * normal document scrolling.
   *
   * 4D LAB:
   * lock document scrolling because the WebGPU viewport owns the
   * complete screen.
   */
  useEffect(
    () => {
      const labActive =
        experience ===
        "4D_LAB";

      document.documentElement
        .classList
        .toggle(
          "cosmos-lab-active",
          labActive
        );

      document.body
        .classList
        .toggle(
          "cosmos-lab-active",
          labActive
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
    [
      experience
    ]
  );

  /**
   * Browser Back / Forward support.
   *
   * Hash routing is deliberate because the first deployment target is
   * GitHub Pages. A route such as /4d-lab would return a 404 after a
   * hard refresh on Pages unless additional fallback infrastructure
   * were introduced.
   */
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
          const next =
            routeFromLocation();

          setExperience(
            next
          );

          if (
            next ===
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

  function open4D():
    void {
    saveHomeScroll();

    window.history.pushState(
      {
        cosmosRoute:
          "4d-lab",

        cosmosFromHome:
          true
      },
      "",
      `${window.location.pathname}${window.location.search}#/4d-lab`
    );

    setExperience(
      "4D_LAB"
    );

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }

  function returnFrom4D():
    void {
    const state =
      window.history.state as
        | {
            cosmosFromHome?:
              boolean;
          }
        | null;

    /**
     * Normal case:
     *
     * HOME -> 4D LAB
     *
     * Go to the actual previous browser-history entry. This means the
     * browser Back button and the visible Back button behave
     * consistently.
     */
    if (
      state?.cosmosFromHome ===
      true
    ) {
      window.history.back();
      return;
    }

    /**
     * Direct-entry fallback:
     *
     * Someone may open or refresh:
     *
     *   #/4d-lab
     *
     * In that situation we must not send them away from COSMOS∞ when
     * they press the in-app Back button.
     */
    window.history.replaceState(
      {
        cosmosRoute:
          "home"
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

  function scrollToSection(
    sectionId: string
  ): void {
    const section =
      document.getElementById(
        sectionId
      );

    if (
      section === null
    ) {
      return;
    }

    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
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
            returnFrom4D
          }
          aria-label="Return to previous Cosmos Infinity view"
        >
          ← BACK TO COSMOS∞
        </button>
      </div>
    );
  }

  return (
    <CosmosHome
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

